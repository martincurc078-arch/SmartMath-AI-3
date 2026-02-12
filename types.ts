export enum AppView {
  ONBOARDING = 'ONBOARDING',
  CAMERA = 'CAMERA',
  SOLUTION = 'SOLUTION',
  TUTOR = 'TUTOR'
}

export interface MathStep {
  title: string;
  explanation: string;
  latex_result: string;
}

export interface MathSolution {
  latex_expression: string;
  final_answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  steps: MathStep[];
  topic: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}