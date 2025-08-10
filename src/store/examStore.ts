import { create } from 'zustand';
import type { ExamState, Question, ExamSession } from '../types';

interface ExamStore extends ExamState {
  setSession: (session: ExamSession) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentIndex: (index: number) => void;
  addAnswer: (questionId: string, choiceIndex: number) => void;
  setHint: (questionId: string, hint: { level: number; text: string; imageUrl?: string } | null) => void;
  markComplete: () => void;
  resetExam: () => void;
}

export const useExamStore = create<ExamStore>((set) => ({
  currentSession: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  hints: {},
  isComplete: false,

  setSession: (session) => set({ currentSession: session }),
  
  setQuestions: (questions) => set({ questions }),
  
  setCurrentIndex: (index) => set({ currentQuestionIndex: index }),
  
  addAnswer: (questionId, choiceIndex) => set((state) => ({
    answers: {
      ...state.answers,
      [questionId]: [...(state.answers[questionId] || []), choiceIndex],
    },
  })),
  
  setHint: (questionId, hint) => set((state) => ({
    hints: {
      ...state.hints,
      [questionId]: hint,
    },
  })),
  
  markComplete: () => set({ isComplete: true }),
  
  resetExam: () => set({
    currentSession: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    hints: {},
    isComplete: false,
  }),
})); 