export interface AnalysisResult {
  text: string;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
}
