export interface Student {
  id: string;
  studentId: string;
  name: string;
  school: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface Question {
  _id: string;
  setVersion: number;
  index: number;
  promptText: string;
  promptImageUrl?: string;
  choices: { text: string }[];
  correctIndex: number;
  hints: { level: 1 | 2 | 3; text: string; imageUrl?: string }[];
  firstTryExplanation?: { text: string; imageUrl?: string };
}

export interface ExamSession {
  sessionId: string;
  setVersion: number;
}

export interface AnswerResponse {
  isCorrect: boolean;
  hintLevel?: 1 | 2 | 3;
  nextIndex?: number;
}

export interface ExamResult {
  _id: string;
  studentId: string;
  setVersion: number;
  perQuestion: {
    questionId: string;
    firstAttemptCorrect: boolean;
    wrongAttemptsCount: number;
    attempts: {
      choiceIndex: number;
      isCorrect: boolean;
      timestamp: string;
    }[];
  }[];
  realScore: number;
  startedAt: string;
  completedAt: string;
}

export interface AuthState {
  user: Student | AdminUser | null;
  role: 'student' | 'admin' | null;
  isAuthenticated: boolean;
}

export interface ExamState {
  currentSession: ExamSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, number[]>; // questionId -> choiceIndex[]
  hints: Record<string, { level: number; text: string; imageUrl?: string } | null>;
  isComplete: boolean;
} 