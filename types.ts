export interface AudioData {
  mode: "Dialogue" | "Voiceover" | "Ambience Only";
  sfx_ambience: string;
  transcript?: string;
  voice_gender?: "Male" | "Female";
  production_analysis?: {
    intonation?: string;
    gesture?: string;
  };
}

export interface CameraOptions {
  is_handheld_shake: boolean;
  is_multi_camera: boolean;
}

export interface Shot {
  shot_number: number;
  timing_sec: string;
  camera_angle: string;
  visual_prompt: string;
  audio_data: AudioData;
  camera_options: CameraOptions;
}

export interface StoryboardResponse {
  summary: string;
  full_narrative: string;
  shots: Shot[];
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_STORYBOARD = 'GENERATING_STORYBOARD',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}