
import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardResponse } from "../types";

// Fungsi untuk konversi file ke format yang dikenali AI
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
You are the "Master Cinematic Director & Visual Continuity Expert". 

STRICT VISUAL CONSISTENCY ENGINE:
1. IMAGE ANALYSIS: If images are provided, you MUST analyze the subject's DNA (facial structure, hair color/style, clothing details, object textures).
2. PERSISTENCE RULE: In every "visual_prompt", you MUST explicitly describe the same traits from the reference images. Use: "The exact same person from reference with [trait A] and [trait B], wearing the same [outfit details]".
3. STYLE ADHERENCE: You MUST integrate the specific visual style parameters provided (e.g., "Photorealistic 8K", "Anime Style") into every single visual_prompt without exception.
4. ZERO DEVIATION: Do not change the colors, shapes, or structure of the subjects provided.

STORYBOARD ARCHITECTURE:
1. summary: A 2-sentence high-level vision of the content.
2. full_narrative: A separate, complete, and cohesive script/narration for the entire video duration (\${duration}). This should be formatted for a voice actor or audience presentation.
3. shots: A technical breakdown that follows the full_narrative step-by-step.

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
  /**
   * PENTING: Untuk alasan keamanan, API Key harus diambil dari environment variable.
   * Di Vercel: Masuk ke Project Settings > Environment Variables > Tambahkan Key: API_KEY
   */
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY tidak terdeteksi. Silakan tambahkan 'API_KEY' di Environment Variables Vercel Anda agar aplikasi bisa berjalan setelah di-deploy.");
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
    
    MISSION: 
    - Create a FULL NARRATIVE script for the audience.
    - Create a detailed SHOT BREAKDOWN.
    - For EVERY visual_prompt, you MUST start with: "${stylePrompt}". 
    - If reference images are provided, maintain absolute consistency of characters and objects.
  `;

  try {
    const parts: any[] = [{ text: userPrompt }];
    if (mediaFiles && mediaFiles.length > 0) {
      const imgParts = await Promise.all(mediaFiles.map(fileToGenerativePart));
      parts.push(...imgParts);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: parts }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION.replace('${duration}', duration || '30s'),
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            full_narrative: { type: Type.STRING, description: "Complete script for the entire video" },
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
                        },
                        propertyOrdering: ["intonation", "gesture"]
                      }
                    },
                    required: ["mode", "sfx_ambience"],
                    propertyOrdering: ["mode", "sfx_ambience", "transcript", "voice_gender", "production_analysis"]
                  },
                  camera_options: {
                    type: Type.OBJECT,
                    properties: {
                      is_handheld_shake: { type: Type.BOOLEAN },
                      is_multi_camera: { type: Type.BOOLEAN }
                    },
                    propertyOrdering: ["is_handheld_shake", "is_multi_camera"]
                  }
                },
                required: ["shot_number", "timing_sec", "camera_angle", "visual_prompt", "audio_data"],
                propertyOrdering: ["shot_number", "timing_sec", "camera_angle", "visual_prompt", "audio_data", "camera_options"]
              }
            }
          },
          required: ["summary", "full_narrative", "shots"],
          propertyOrdering: ["summary", "full_narrative", "shots"]
        },
      },
    });

    const result = response.text;
    if (!result) throw new Error("AI returned empty result");
    
    return JSON.parse(result.trim());
  } catch (error: any) {
    console.error("Gemini Error Detail:", error);
    throw new Error(error.message || "Gagal membuat storyboard. Periksa koneksi atau API Key Anda.");
  }
};
