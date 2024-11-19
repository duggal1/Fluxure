import axios from 'axios';
import { AnalysisRequest, AnalysisResponse } from '@/types/ai-service';
import { BusinessContext } from '@/types/agent';

export class AIService {
  private baseUrl: string = 'http://localhost:8000';
  private fallbackEnabled: boolean = true;

  private generateFallbackResponse(): AnalysisResponse {
    return {
      predictions: [{
        type: 'fallback',
        description: 'Using fallback response due to backend service unavailability',
        confidence: 0.5
      }],
      insights: [{
        type: 'system',
        description: 'Backend service is currently unavailable',
        confidence: 1.0,
        impact: 0.5
      }],
      sentiment: {
        overall_sentiment: 0,
        aspects: []
      },
      risks: {
        overall_risk: 0.5,
        factors: []
      },
      confidence: 0.5,
      confidence_score: 0.5,
      metrics: {}
    };
  }

  async analyzeData(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await axios.post<AnalysisResponse>(
        `${this.baseUrl}/api/analyze`,
        request,
        {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in AI analysis:', error);
      if (this.fallbackEnabled) {
        console.log('Using fallback response mechanism');
        return this.generateFallbackResponse();
      }
      throw new Error('Failed to analyze data: Backend service unavailable');
    }
  }

  async analyzeSentiment(context: BusinessContext, text: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/sentiment`,
        {
          context,
          data: [{ type: 'sentiment', content: text }]
        },
        {
          timeout: 5000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in sentiment analysis:', error);
      if (this.fallbackEnabled) {
        return {
          overall_sentiment: 0,
          aspects: [],
          confidence: 0.5
        };
      }
      throw new Error('Failed to analyze sentiment: Backend service unavailable');
    }
  }

  async analyzeRisks(context: BusinessContext, data: any) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/risks`,
        {
          context,
          data: [{ type: 'risks', content: data }]
        },
        {
          timeout: 5000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in risk analysis:', error);
      if (this.fallbackEnabled) {
        return {
          overall_risk: 0.5,
          risk_factors: [],
          confidence: 0.5
        };
      }
      throw new Error('Failed to analyze risks: Backend service unavailable');
    }
  }
}