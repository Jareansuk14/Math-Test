import { apiClient } from './client';
import type { Question, AnswerResponse, ExamResult } from '../types';

export interface StartExamResponse {
  sessionId: string;
  setVersion: number;
}

export interface AnswerRequest {
  questionId: string;
  choiceIndex: number;
}

export const examAPI = {
  // Get active questions
  getActiveQuestions: async (): Promise<{ setVersion: number; items: Question[] }> => {
    const response = await apiClient.get('/questions/active');
    return response.data;
  },

  // Start exam session
  startExam: async (): Promise<StartExamResponse> => {
    const response = await apiClient.post('/exam/start');
    return response.data;
  },

  // Submit answer
  submitAnswer: async (sessionId: string, data: AnswerRequest): Promise<AnswerResponse> => {
    const response = await apiClient.post(`/exam/${sessionId}/answer`, data);
    return response.data;
  },

  // Complete exam
  completeExam: async (sessionId: string): Promise<{ resultId: string; realScore: number }> => {
    const response = await apiClient.post(`/exam/${sessionId}/complete`);
    return response.data;
  },

  // Get exam summary
  getSummary: async (resultId: string): Promise<ExamResult> => {
    const response = await apiClient.get(`/exam/summary/${resultId}`);
    return response.data;
  },
}; 