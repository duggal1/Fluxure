import axios from 'axios';
import { AnalysisRequest, AnalysisResponse } from '@/types/ai-service';
import { BusinessContext } from '@/types/agent';

export class AIService {
  private baseUrl: string = 'http://localhost:8000';

  async analyzeData(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await axios.post<AnalysisResponse>(
        `${this.baseUrl}/api/analyze`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error in AI analysis:', error);
      throw new Error('Failed to analyze data');
    }
  }

  async analyzeSentiment(context: BusinessContext, text: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/sentiment`, {
        context,
        data: [{ type: 'sentiment', content: text }]
      });
      return response.data;
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      throw new Error('Failed to analyze sentiment');
    }
  }

  async analyzeRisks(context: BusinessContext, data: any) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/risks`, {
        context,
        data: [{ type: 'risks', content: data }]
      });
      return response.data;
    } catch (error) {
      console.error('Error in risk analysis:', error);
      throw new Error('Failed to analyze risks');
    }
  }
}