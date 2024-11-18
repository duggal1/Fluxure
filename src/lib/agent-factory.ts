import { BusinessContext } from '@/types/agent';
import { AIService } from '@/services/ai-service';

export interface EnterpriseAgent {
  context: BusinessContext;
  memory: {
    conversationHistory: Array<{
      role: string;
      content: string;
      timestamp: Date;
    }>;
    insights: any[];
    decisions: Array<{
      timestamp: Date;
      context: string;
      decision: string;
      impact: string;
    }>;
    learnings: any[];
  };
  aiService: AIService;
  analyzeInput(message: string): Promise<any>;
  updateMemory(input: string, analysis: any): void;
}

export function createEnterpriseAgent(context: BusinessContext): EnterpriseAgent {
  return {
    context,
    memory: {
      conversationHistory: [],
      insights: [],
      decisions: [],
      learnings: []
    },
    aiService: new AIService(),
    async analyzeInput(message: string) {
      try {
        const response = await this.aiService.analyzeData({
          context: this.context,
          data: [{
            type: 'analysis',
            content: message,
            parameters: {
              useML: true,
              includeSentiment: true,
              includeRisks: true
            }
          }],
          parameters: {
            useML: true,
            includeSentiment: true,
            includeRisks: true
          }
        });

        this.updateMemory(message, response);
        return response;
      } catch (error) {
        console.error('Error analyzing input:', error);
        throw new Error('Failed to analyze input');
      }
    },
    updateMemory(input: string, analysis: any) {
      this.memory.conversationHistory.push({
        role: 'user',
        content: input,
        timestamp: new Date()
      });

      if (analysis.insights) {
        this.memory.insights.push(...analysis.insights);
      }

      if (analysis.decisions) {
        this.memory.decisions.push(...analysis.decisions.map((decision: any) => ({
          timestamp: new Date(),
          context: input,
          decision: decision.description,
          impact: JSON.stringify(decision.impact)
        })));
      }
    }
  };
}