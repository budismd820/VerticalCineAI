
import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardResponse } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

const SYSTEM_INSTRUCTION = `
You are a "World-Class Cinematic Director & Scriptwriter". Your goal is to create high-end vertical video storyboards with perfect consistency.

### STEP 1: THINKING PHASE (Internal Planning)
Before generating JSON, you must plan:
1. CHARACTER DNA: If images are provided, analyze features (scars, armor details, helmet type, cape color).
2. NARRATIVE ARC: Ensure the story flows from a "Hook" to a "Visual Climax".
3. CINEMATOGRAPHY: Vary the shots (Extreme Long Shot for scale, ECU for emotion, Dutch Angle for tension).

### STEP 2: GENERATION RULES
1. VISUAL CONSISTENCY: Every "visual_prompt" must explicitly mention the core traits of the character/environment to prevent AI drifting.
2. STYLE SYNERGY: Force the [MANDATORY VISUAL STYLE] into every shot description.
3. NARRATIVE: The "full_narrative" must be poetic, engaging, and match the "narratorStyle".
4. TECHNICAL: Ensure "timing_sec" matches the total "duration".

Respond ONLY in valid JSON format.
`;

export interface StoryParams {
  promptText: string;
  stylePrompt: string;
  language: string;
  narratorStyle: string;
  ratio: string;
  duration?: string;
  mediaFiles?: File[];
}

export const generateStoryboardFromStory = async (params: StoryParams): Promise<StoryboardResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY_MISSING: Masukkan API_KEY di Environment Variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { promptText, stylePrompt, language, narratorStyle, ratio, duration, mediaFiles } = params;

  const userPrompt = `
    STORY PREMISE: "${promptText}"
    TECHNICAL SPECS: 
    - Duration: ${duration}
    - MANDATORY VISUAL STYLE: ${stylePrompt}
    - Language: ${language}
    - Tone: ${narratorStyle}
    - Aspect Ratio: ${ratio}
  `;

  try {
    const parts: any[] = [{ text: userPrompt }];
    if (mediaFiles && mediaFiles.length > 0) {
      const imgParts = await Promise.all(mediaFiles.map(fileToGenerativePart));
      parts.push(...imgParts);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION.replace('${duration}', duration || '30s'),
        responseMimeType: "application/json",
        // MENGAKTIFKAN MODE BERPIKIR: 
        // Ini membuat AI merencanakan konsistensi sebelum menulis kodenya.
        thinkingConfig: { thinkingBudget: 16000 }, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            full_narrative: { type: Type.STRING },
            shots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  shot_number: { type: Type.INTEGER },
                  timing_sec: { type: Type.STRING },
                  camera_angle: { type: Type.STRING },
                  visual_prompt: { type: Type.STRING },
                  audio_data: {
                    type: Type.OBJECT,
                    properties: {
                      mode: { type: Type.STRING },
                      sfx_ambience: { type: Type.STRING },
                      transcript: { type: Type.STRING },
                      voice_gender: { type: Type.STRING },
                      production_analysis: {
                        type: Type.OBJECT,
                        properties: {
                          intonation: { type: Type.STRING },
                          gesture: { type: Type.STRING }
                        }
                      }
                    },
                    required: ["mode", "sfx_ambience"]
                  },
                  camera_options: {
                    type: Type.OBJECT,
                    properties: {
                      is_handheld_shake: { type: Type.BOOLEAN },
                      is_multi_camera: { type: Type.BOOLEAN }
                    }
                  }
                },
                required: ["shot_number", "timing_sec", "camera_angle", "visual_prompt", "audio_data"]
              }
            }
          },
          required: ["summary", "full_narrative", "shots"]
        },
      },
    });

    const result = response.text;
    if (!result) throw new Error("AI returned empty result");
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("Gemini Error Detail:", error);
    if (error.message?.includes("429") || error.message?.includes("quota")) {
       throw new Error("QUOTA_EXCEEDED: Batas penggunaan habis. Tunggu 1 menit.");
    }
    throw new Error(error.message || "Terjadi kesalahan sistem AI.");
  }
};
