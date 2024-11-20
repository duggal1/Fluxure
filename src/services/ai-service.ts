import axios, { AxiosError } from 'axios';
import { AnalysisRequest, AnalysisResponse } from '@/types/ai-service';

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://127.0.0.1:8000';
  }

  async analyzeData(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/analyze`,
        {
          context: request.context,
          data: request.data.map(item => ({
            type: item.type,
            content: item.content,
            parameters: item.parameters || {}
          })),
          parameters: request.parameters || {}
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('AI Service error:', error.response?.data || error.message);
      throw error;
    }
  }
}