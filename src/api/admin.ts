import { apiClient } from './client';
import type { Student, ExamResult } from '../types';

export interface QuestionCreateRequest {
  index: number;
  promptText: string;
  promptImageUrl?: string;
  choices: { text: string }[];
  correctIndex: number;
  hints: { level: 1 | 2 | 3; text: string; imageUrl?: string }[];
  firstTryExplanation?: { text: string; imageUrl?: string };
}

export interface QuestionSetPublishRequest {
  version: number;
  questions: QuestionCreateRequest[];
}

export interface UploadUrlRequest {
  key: string;
  contentType: string;
}

export interface UploadUrlResponse {
  url: string;
}

export const adminAPI = {
  // Students
  getStudents: async (): Promise<Student[]> => {
    const response = await apiClient.get('/admin/students');
    return response.data;
  },

  // Results
  getResults: async (): Promise<ExamResult[]> => {
    const response = await apiClient.get('/admin/results');
    return response.data;
  },

  // Questions
  publishQuestionSet: async (data: QuestionSetPublishRequest): Promise<{ message: string; version: number }> => {
    const response = await apiClient.post('/admin/questionset/publish', data);
    return response.data;
  },

  // File upload
  getUploadUrl: async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const response = await apiClient.post('/admin/upload-url', data);
    return response.data;
  },

  // Upload file to S3 using presigned URL
  uploadFile: async (presignedUrl: string, file: File): Promise<void> => {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },
}; 