import { BusinessContext } from "./agent";

export interface AnalysisRequest {
    context: BusinessContext;
    data: Array<{
      type: 'analysis' | 'workflow' | 'insights' | 'metrics';
      content?: string;
      parameters?: Record<string, any>;
    }>;
    parameters: {
      useML?: boolean;
      includeSentiment?: boolean;
      includeRisks?: boolean;
      insightTypes?: string[];
      includeConfidenceScores?: boolean;
      [key: string]: any;
    };
  }
  
  export interface AnalysisResponse {
    metrics: {};
    confidence: number;
    predictions: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
    insights: Array<{
      type: string;
      description: string;
      confidence: number;
      impact: number;
    }>;
    sentiment: {
      overall_sentiment: number;
      aspects: Array<{
        topic: string;
        score: number;
      }>;
    };
    risks: {
      overall_risk: number;
      factors: Array<{
        category: string;
        severity: number;
        probability: number;
      }>;
    };
    confidence_score: number;
  }