import { BusinessContext } from "./agent";

export type AnalysisType = 'analysis' | 'workflow' | 'insights' | 'metrics';
export type InsightType = 'market' | 'strategic' | 'operational' | 'risk' | 'efficiency';
export type PriorityLevel = 'high' | 'medium' | 'low';

export interface DataItem {
  type: AnalysisType;
  content: string;
  parameters?: Record<string, any>;
}

export interface AnalysisRequest {
  context: Record<string, any>;
  data: DataItem[];
  parameters?: Record<string, any>;
}

export interface Insight {
  type: InsightType;
  content: string;
  confidence: number;
  priority: PriorityLevel;
  timestamp: string;
  source: string;
  impact?: number;
}

export interface MarketAnalysis {
  trends: string[];
  opportunities: string[];
  risks: string[];
  sentiment: number;
  confidence: number;
}

export interface AnalysisResponse {
  market_analysis: MarketAnalysis;
  recommendations: string[];
  insights: Insight[];
  confidence_score: number;
  semantic_relevance: number;
  predictions: any[];
  sentiment: {
    overall_sentiment: number;
    aspects: any[];
  };
  risks: {
    overall_risk: number;
    factors: any[];
  };
  metrics: Record<string, any>;
  confidence?: number;
}