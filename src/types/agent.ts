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
  competitiveContext: Record<string, any>;
  marketPosition: Record<string, any>;
  currentInput?: string;
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
  type: 'market' | 'strategic' | 'operational' | 'risk' | 'efficiency';
  content: string;
  confidence: number;
  priority: PriorityLevel;
  timestamp: string;
  source: string;
  impact?: number;
}

export type WorkflowActionType = "analysis" | "prediction" | "recommendation" | "action" | "automation";
export type WorkflowStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type PriorityLevel = "high" | "medium" | "low";

export interface WorkflowAction {
  id: string;
  type: WorkflowActionType;
  description: string;
  priority: PriorityLevel;
  status: WorkflowStatus;
  impact: {
    efficiency: number;
    risk: number;
    revenue: number;
  };
  dependencies: string[];
  automationPotential: number;
  mlConfidence: number;
  metadata: {
    source: string;
    timestamp: string;
    rawText?: string;
  };
}
