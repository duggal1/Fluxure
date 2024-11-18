import { GoogleGenerativeAI } from '@google/generative-ai';
import { BusinessContext, AgentMemory, WorkflowAction, InsightType } from '@/types/agent';
import { KnowledgeGraph } from './knowledge-graph';
import { RiskAnalyzer } from './risk-analyzer';
import { WorkflowOrchestrator } from './workflow-orchestrator';
import { MarketPulseAnalyzer } from './market-pulse';
import { SentimentAnalyzer } from './sentiment-analyzer';
import { RiskAssessment } from '@/types/risk';
import { AIService } from '@/services/ai-service';

interface AnalysisResponse {
  response: string;
  actions: WorkflowAction[];
  insights: InsightType[];
  mlMetrics: Record<string, any>;
  confidence: number;
}

export class EnterpriseAgent {
  private context: BusinessContext;
  private memory: AgentMemory;
  private genAI: GoogleGenerativeAI;
  private model: any;
  private knowledgeGraph: KnowledgeGraph;
  private riskAnalyzer: RiskAnalyzer;
  private workflowOrchestrator: WorkflowOrchestrator;
  private marketPulse: MarketPulseAnalyzer;
  private sentimentAnalyzer: SentimentAnalyzer;
  private aiService: AIService;

  constructor(context: BusinessContext) {
    this.context = context;
    this.memory = this.initializeMemory();
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.aiService = new AIService();
    this.knowledgeGraph = new KnowledgeGraph();
    this.riskAnalyzer = new RiskAnalyzer();
    this.workflowOrchestrator = new WorkflowOrchestrator();
    this.marketPulse = new MarketPulseAnalyzer();
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  private initializeMemory(): AgentMemory {
    return {
      conversationHistory: [],
      insights: [],
      decisions: [],
      learnings: []
    };
  }

  private async performComplexAnalysis(prompt: string): Promise<string> {
    if (!prompt?.trim()) {
      throw new Error('Invalid input: prompt cannot be empty');
    }

    try {
      const pythonAnalysis = await this.aiService.analyzeData({
        context: this.context,
        data: [{
          type: 'analysis',
          content: prompt,
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

      if (!pythonAnalysis || typeof pythonAnalysis !== 'object') {
        throw new Error('Invalid response from ML analysis');
      }

      const geminiResult = await this.model.generateContent(
        this.enrichPromptWithMLInsights(prompt, pythonAnalysis)
      );

      if (!geminiResult?.response?.text) {
        throw new Error('Invalid response from Gemini analysis');
      }

      return this.combineAnalysisResults(
        geminiResult.response.text(),
        pythonAnalysis
      );
    } catch (error: unknown) {
      console.error('Error in complex analysis:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to perform complex analysis: ${error.message}`);
      }
      throw new Error('Failed to perform complex analysis: Unknown error');
    }
  }

  private enrichPromptWithMLInsights(
    originalPrompt: string,
    mlAnalysis: any
  ): string {
    return `
      Original Query: ${originalPrompt}
      
      ML Analysis Context:
      - Sentiment Score: ${mlAnalysis.sentiment?.overall_sentiment || 'N/A'}
      - Risk Level: ${mlAnalysis.risks?.overall_risk || 'N/A'}
      - Key Patterns: ${JSON.stringify(mlAnalysis.insights || [])}
      
      Please provide a comprehensive analysis incorporating these ML insights.
    `;
  }

  private combineAnalysisResults(
    geminiAnalysis: string,
    pythonAnalysis: any
  ): string {
    return `
      ${geminiAnalysis}
      
      Additional ML-Powered Insights:
      ${this.formatMLInsights(pythonAnalysis)}
    `;
  }

  private formatMLInsights(mlAnalysis: any): string {
    const insights = [];
    
    if (mlAnalysis.sentiment) {
      insights.push(`Sentiment Analysis: ${mlAnalysis.sentiment.overall_sentiment}`);
    }
    
    if (mlAnalysis.risks) {
      insights.push(`Risk Assessment: ${mlAnalysis.risks.overall_risk}`);
    }
    
    if (mlAnalysis.predictions) {
      insights.push('Predictions:', ...mlAnalysis.predictions.map((p: any) => 
        `- ${p.description} (Confidence: ${p.confidence})`
      ));
    }
    
    return insights.join('\n');
  }

  private async generateWorkflowActions(analysis: string): Promise<WorkflowAction[]> {
    try {
      const mlActions = await this.aiService.analyzeData({
        context: this.context,
        data: [{
          type: 'workflow',
          content: analysis,
          parameters: {
            actionTypes: ['analysis', 'prediction', 'recommendation', 'action', 'automation'],
            includeMetrics: true
          }
        }],
        parameters: { 
          actionTypes: ['analysis', 'prediction', 'recommendation', 'action', 'automation'],
          includeMetrics: true
        }
      });

      const prompt = `
        Based on the following analysis and ML-generated actions, refine and prioritize workflow actions:
        
        Analysis: ${analysis}
        ML Suggestions: ${JSON.stringify(mlActions.predictions)}
        
        For each action, provide:
        1. Type (analysis/prediction/recommendation/action/automation)
        2. Priority level
        3. Expected impact on efficiency, risk, and revenue
        4. Dependencies
        5. Automation potential (0-1)
      `;

      const result = await this.model.generateContent(prompt);
      return this.parseWorkflowActions(result.response.text(), mlActions);
    } catch (error) {
      console.error('Error generating workflow actions:', error);
      throw error;
    }
  }

  private async extractInsights(analysis: string): Promise<InsightType[]> {
    try {
      const mlInsights = await this.aiService.analyzeData({
        context: this.context,
        data: [{
          type: 'insights',
          content: analysis,
          parameters: {
            insightTypes: ['strategic', 'operational', 'risk', 'market', 'efficiency'],
            includeConfidenceScores: true
          }
        }],
        parameters: { 
          insightTypes: ['strategic', 'operational', 'risk', 'market', 'efficiency'],
          includeConfidenceScores: true
        }
      });

      const prompt = `
        Analyze these ML-generated insights and provide additional business context:
        ${JSON.stringify(mlInsights.insights)}
        
        For each insight, provide:
        1. Type (strategic/operational/risk/market/efficiency)
        2. Priority level
        3. Confidence score (0-1)
        4. Impact score (0-1)
        5. Specific recommendations
      `;

      const result = await this.model.generateContent(prompt);
      return this.parseInsights(result.response.text(), mlInsights);
    } catch (error) {
      console.error('Error extracting insights:', error);
      throw error;
    }
  }

  private parseWorkflowActions(actionsText: string, mlActions: any): WorkflowAction[] {
    try {
      const parsedActions = JSON.parse(actionsText);
      return parsedActions.map((action: any) => ({
        ...action,
        mlConfidence: this.findMatchingMLAction(action, mlActions.predictions)?.confidence || 0
      }));
    } catch (error) {
      console.error('Error parsing workflow actions:', error);
      return [];
    }
  }

  private findMatchingMLAction(action: any, mlActions: any[]): any {
    return mlActions.find(mla => 
      mla.type === action.type && 
      this.calculateSimilarity(mla.description, action.description) > 0.7
    );
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private async assessRisks(analysis: string): Promise<RiskAssessment> {
    return this.riskAnalyzer.analyzeRisks({
      analysis,
      context: this.context,
      historicalData: this.memory.decisions
    });
  }

  private async generateRecommendations(analysis: string): Promise<any[]> {
    const prompt = `
      Based on the analysis, generate actionable recommendations:
      ${analysis}
      
      Consider:
      1. Short-term actions
      2. Long-term strategy
      3. Resource requirements
      4. Implementation complexity
      5. Expected outcomes
    `;

    const result = await this.model.generateContent(prompt);
    return this.parseRecommendations(result.response.text());
  }

  private async getBusinessMetrics(): Promise<any> {
    return {
      revenue: this.context.keyMetrics.revenue,
      efficiency: this.context.keyMetrics.efficiency,
      riskScore: this.context.keyMetrics.riskScore,
    };
  }

  private updateMemory(
    input: string, 
    analysis: string, 
    actions: WorkflowAction[], 
    insights: InsightType[]
  ): void {
    this.memory.conversationHistory.push({
      role: 'user',
      content: input,
      timestamp: new Date()
    });

    this.memory.insights.push(...insights);

    const decisions = actions
      .filter(action => action.type === 'action')
      .map(action => ({
        timestamp: new Date(),
        context: input,
        decision: action.description,
        impact: JSON.stringify(action.impact)
      }));

    this.memory.decisions.push(...decisions);
  }

  private formatResponse(analysis: string): string {
    return analysis.trim();
  }

  private parseInsights(insightsText: string, mlInsights: any): InsightType[] {
    try {
      const parsedInsights = JSON.parse(insightsText);
      return parsedInsights.map((insight: any) => ({
        type: insight.type,
        content: insight.content,
        priority: insight.priority,
        confidence: insight.confidence,
        impact: insight.impact,
        recommendations: insight.recommendations,
        metadata: {
          mlConfidence: this.findMatchingMLInsight(insight, mlInsights.insights)?.confidence || 0,
          source: 'hybrid-analysis',
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error parsing insights:', error);
      return [];
    }
  }

  private findMatchingMLInsight(insight: any, mlInsights: any[]): any {
    return mlInsights?.find(mli => 
      mli.type === insight.type && 
      this.calculateSimilarity(mli.content, insight.content) > 0.7
    );
  }

  private parseRecommendations(recommendationsText: string): any[] {
    try {
      const parsed = JSON.parse(recommendationsText);
      return parsed.map((rec: any) => ({
        type: rec.type || 'recommendation',
        description: rec.description,
        timeframe: rec.timeframe || 'short-term',
        resources: rec.resources || [],
        complexity: rec.complexity || 'medium',
        expectedOutcomes: rec.expectedOutcomes || [],
        priority: rec.priority || 'medium',
        implementation: {
          steps: rec.implementation?.steps || [],
          timeline: rec.implementation?.timeline || 'TBD',
          dependencies: rec.implementation?.dependencies || []
        },
        metrics: {
          costBenefit: rec.metrics?.costBenefit || 0,
          roi: rec.metrics?.roi || 0,
          timeToValue: rec.metrics?.timeToValue || 'unknown'
        }
      }));
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return [];
    }
  }

  async analyzeInput(message: string): Promise<AnalysisResponse> {
    if (!message?.trim()) {
      throw new Error('Invalid input: message cannot be empty');
    }

    try {
      const analysis = await this.performComplexAnalysis(message);
      
      const [actions, insights, mlMetrics] = await Promise.all([
        this.generateWorkflowActions(analysis),
        this.extractInsights(analysis),
        this.aiService.analyzeData({
          context: this.context,
          data: [{
            type: 'metrics',
            content: message,
            parameters: {
              analysis: analysis,
              includeConfidence: true
            }
          }],
          parameters: { includeConfidence: true }
        })
      ]);

      this.updateMemory(message, analysis, actions, insights);

      return {
        response: this.formatResponse(analysis),
        actions,
        insights,
        mlMetrics: mlMetrics.metrics || {},
        confidence: mlMetrics.confidence || 0
      };
    } catch (error: unknown) {
      console.error('Error analyzing input:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to analyze input: ${error.message}`);
      }
      throw new Error('Failed to analyze input: Unknown error');
    }
  }
}