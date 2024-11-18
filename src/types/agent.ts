export interface BusinessContext {
  industry: string;
  companySize: string;
  keyMetrics: {
    revenue: number;
    employees: number;
    marketShare: number;
    growthRate: number;
    efficiency: number;
    riskScore: number;
  };
  priorities: string[];
  competitiveContext: any;
  marketPosition: any;
}

export interface AgentMemory {
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    context?: any;
  }>;
  insights: Array<InsightType>;
  decisions: Array<{
    timestamp: Date;
    context: string;
    decision: string;
    impact: string;
    outcome?: string;
  }>;
  learnings: Array<{
    category: string;
    insight: string;
    confidence: number;
    timestamp: Date;
  }>;
}

export interface InsightType {
  type: 'strategic' | 'operational' | 'risk' | 'market' | 'efficiency';
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  impact: number;
  description: string;
  recommendations: string[];
  timestamp: Date;
}

export interface WorkflowAction {
  id: string;
  type: 'analysis' | 'prediction' | 'recommendation' | 'action' | 'automation';
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: {
    efficiency: number;
    risk: number;
    revenue: number;
  };
  dependencies: string[];
  automationPotential: number;
  result?: any;
}
