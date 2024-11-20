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
  
  export interface MarketAnalysis {
    trends: string[];
    opportunities: string[];
    risks: string[];
    sentiment: number;
    confidence: number;
  }
  
  export interface Insight {
    content: string;
    type: 'market' | 'risk' | 'operational' | 'strategic' | 'technical';
    confidence: number;
    impact: number;
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
    source: string;
  }
  
  export interface AnalysisResponse {
    confidence: number;
    market_analysis: MarketAnalysis;
    recommendations: string[];
    insights: Insight[];
    confidence_score: number;
    semantic_relevance: number;
    predictions: Array<{
      type: string;
      description: string;
      confidence: number;
      label?: string;
    }>;
    sentiment?: {
      overall_sentiment: number;
      aspects: Array<{
        topic: string;
        sentiment: number;
        confidence: number;
      }>;
    };
    risks?: {
      overall_risk: number;
      factors: Array<{
        category: string;
        severity: number;
        probability: number;
        description?: string;
      }>;
    };
    metrics?: Record<string, any>;
  }