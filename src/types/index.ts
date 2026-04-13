import { AnalysisResult } from "@/lib/ai/classification";
import { TherapistIdentity } from "@/lib/ai/prompts";

export interface EmotionalSnapshot {
  timestamp: string;
  mood: string;
  intensity: number;
  triggers: string[];
  distortions: string[];
}

export interface UserProgress {
  resilienceScore: number;
  completedExercises: number;
  lastSessionDate: string;
  activeModules: string[];
}

export interface TherapySession {
  id: string;
  identity: TherapistIdentity;
  messages: Array<{ role: 'user' | 'assistant', content: string }>;
  analysisHistory: AnalysisResult[];
  startTime: string;
}
