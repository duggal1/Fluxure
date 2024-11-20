import axios, { AxiosError } from 'axios';
import { AnalysisRequest, AnalysisResponse } from '@/types/ai-service';

export class AIService {
  private baseUrl: string;
  private timeout: number;
  private fallbackEnabled: boolean;
  private maxRetries: number;

  constructor() {
    this.baseUrl = 'http://127.0.0.1:8000';
    this.timeout = 15000;
    this.fallbackEnabled = true;
    this.maxRetries = 3;
  }

  async analyzeData(request: AnalysisRequest): Promise<AnalysisResponse> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post<AnalysisResponse>(
          `${this.baseUrl}/api/analyze`,
          request,
          {
            timeout: this.timeout,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            proxy: false,
            validateStatus: (status) => status === 200
          }
        );

        if (!response.data) {
          throw new Error('Empty response from AI service');
        }

        return response.data;
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw error;
      }
    }
    throw new Error('All attempts failed');
  }
}