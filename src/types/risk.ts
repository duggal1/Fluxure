export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RiskCategory = 
  | 'market' 
  | 'operational' 
  | 'financial' 
  | 'strategic' 
  | 'compliance' 
  | 'technology' 
  | 'reputational';

export interface RiskFactor {
  id: string;
  category: RiskCategory;
  description: string;
  severity: RiskSeverity;
  probability: number; // 0 to 1
  impact: number; // 0 to 1
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  indicators: string[];
  relatedFactors: string[];
  status: 'active' | 'monitored' | 'mitigated';
}

export interface MitigationStrategy {
  id: string;
  riskFactorId: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  effectiveness: number; // 0 to 1
  implementationCost: number;
  timeToImplement: string;
  priority: RiskSeverity;
  steps: string[];
  resources: string[];
  status: 'proposed' | 'in-progress' | 'implemented' | 'evaluated';
}

export interface RiskAssessment {
  overallRiskScore: number;
  factors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  timestamp: Date;
  metadata: {
    confidence: number;
    dataQuality: number;
    contextCoverage: number;
  };
  summary: {
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    mitigatedRisks: number;
  };
}