export interface MarketTrend {
    id: string;
    type: 'rising' | 'falling' | 'stable' | 'emerging';
    category: 'technology' | 'consumer' | 'market' | 'competitor' | 'regulation';
    description: string;
    impact: number; // 0 to 1
    confidence: number; // 0 to 1
    timeframe: 'short' | 'medium' | 'long';
    dataPoints: Array<{
      timestamp: Date;
      value: number;
    }>;
    relatedFactors: string[];
  }
  
  export interface MarketSentiment {
    overall: number; // -1 to 1
    categories: {
      [key: string]: number;
    };
    trends: Array<{
      category: string;
      sentiment: number;
      momentum: number;
    }>;
    sources: Array<{
      type: string;
      weight: number;
      sentiment: number;
    }>;
  }
  
  export interface CompetitorAnalysis {
    id: string;
    name: string;
    marketShare: number;
    strengthScore: number;
    trends: Array<{
      metric: string;
      trend: 'up' | 'down' | 'stable';
      value: number;
    }>;
    threats: Array<{
      type: string;
      severity: number;
      probability: number;
    }>;
    opportunities: Array<{
      type: string;
      potential: number;
      feasibility: number;
    }>;
  }
  
  export interface MarketInsight {
    trends: MarketTrend[];
    sentiment: MarketSentiment;
    competition: CompetitorAnalysis[];
    timestamp: Date;
    confidence: number;
    recommendations: Array<{
      type: string;
      priority: 'high' | 'medium' | 'low';
      action: string;
      impact: number;
    }>;
  }
  
  export interface DataSource {
    id: string;
    type: 'api' | 'webscraper' | 'database' | 'news';
    endpoint: string;
    refreshInterval: number;
    lastUpdate?: Date;
    credentials?: any;
  }