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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY|| '');
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  return new EnterpriseAgent({
    context,
    genAI,
    model,
    knowledgeGraph: new KnowledgeGraph(),
    riskAnalyzer: new RiskAnalyzer(),
    workflowOrchestrator: new WorkflowOrchestrator(),
    marketPulse: new MarketPulseAnalyzer(),
    sentimentAnalyzer: new SentimentAnalyzer(),
    aiService: new AIService()
  });
}