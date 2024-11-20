import { BusinessContext } from '@/types/agent';
import { EnterpriseAgent } from './agent-core';
import { KnowledgeGraph } from './knowledge-graph';
import { RiskAnalyzer } from './risk-analyzer';
import { WorkflowOrchestrator } from './workflow-orchestrator';
import { MarketPulseAnalyzer } from './market-pulse';
import { SentimentAnalyzer } from './sentiment-analyzer';
import { AIService } from '@/services/ai-service';
import { GoogleGenerativeAI } from '@google/generative-ai';

export function createEnterpriseAgent(context: BusinessContext): EnterpriseAgent {
  const aiService = new AIService();
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const deps = {
    context,
    genAI,
    model,
    knowledgeGraph: new KnowledgeGraph(),
    riskAnalyzer: new RiskAnalyzer(),
    workflowOrchestrator: new WorkflowOrchestrator(),
    marketPulse: new MarketPulseAnalyzer(),
    sentimentAnalyzer: new SentimentAnalyzer(),
    aiService
  };

  return new EnterpriseAgent(deps);
}