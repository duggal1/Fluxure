import { GoogleGenerativeAI } from '@google/generative-ai';
import { BusinessContext, AgentMemory, WorkflowAction, InsightType, WorkflowStatus, PriorityLevel, WorkflowActionType } from '@/types/agent';
import { KnowledgeGraph } from './knowledge-graph';
import { RiskAnalyzer } from './risk-analyzer';
import { WorkflowOrchestrator } from './workflow-orchestrator';
import { MarketPulseAnalyzer } from './market-pulse';
import { SentimentAnalyzer } from './sentiment-analyzer';
import { RiskAssessment } from '@/types/risk';
import { AIService } from '@/services/ai-service';
import { 
  AnalysisType,
  InsightType as AIInsightType,
  // Remove duplicate PriorityLevel since it's already imported above
  AnalysisRequest,
  Insight,
  MarketAnalysis,
  AnalysisResponse as AIAnalysisResponse
} from '@/types/ai-service';

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

  constructor(deps: {
    context: BusinessContext;
    genAI: GoogleGenerativeAI;
    model: any;
    knowledgeGraph: KnowledgeGraph;
    riskAnalyzer: RiskAnalyzer;
    workflowOrchestrator: WorkflowOrchestrator;
    marketPulse: MarketPulseAnalyzer;
    sentimentAnalyzer: SentimentAnalyzer;
    aiService: AIService;
  }) {
    this.context = deps.context;
    this.genAI = deps.genAI;
    this.model = deps.model;
    this.knowledgeGraph = deps.knowledgeGraph;
    this.riskAnalyzer = deps.riskAnalyzer;
    this.workflowOrchestrator = deps.workflowOrchestrator;
    this.marketPulse = deps.marketPulse;
    this.sentimentAnalyzer = deps.sentimentAnalyzer;
    this.aiService = deps.aiService;
    this.memory = this.initializeMemory();
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
    try {
      const request: AnalysisRequest = {
        context: {
          ...this.context,
          currentInput: prompt
        },
        data: [{
          type: 'analysis' as AnalysisType,
          content: prompt,
          parameters: {
            useML: true,
            includeSentiment: true,
            includeRisks: true,
            includeMarketAnalysis: true,
            includeTrends: true
          }
        }],
        parameters: {
          format: 'detailed',
          returnFullContext: true
        }
      };

      const pythonAnalysis = await this.aiService.analyzeData(request);
      console.log('Python analysis response:', pythonAnalysis);

      return this.formatAnalysisResults(pythonAnalysis);
    } catch (error) {
      console.error('Error in complex analysis:', error);
      throw error;
    }
  }

  private formatAnalysisResults(analysis: AIAnalysisResponse): string {
    return `
      **Analysis Results**
      
      **Market Analysis**
      ${this.formatMarketAnalysis(analysis.market_analysis)}
      
      **Recommendations**
      ${this.formatRecommendations(analysis.recommendations)}
      
      **Insights**
      ${this.formatInsights(analysis.insights)}
      
      Confidence Score: ${analysis.confidence_score.toFixed(2)}
      Semantic Relevance: ${analysis.semantic_relevance.toFixed(2)}
    `;
  }

  private formatMarketAnalysis(marketAnalysis: MarketAnalysis): string {
    if (!marketAnalysis) return 'No market analysis available';
    
    return `
      Trends:
      ${marketAnalysis.trends.map(trend => `- ${trend}`).join('\n')}
      
      Opportunities:
      ${marketAnalysis.opportunities.map(opp => `- ${opp}`).join('\n')}
      
      Risks:
      ${marketAnalysis.risks.map(risk => `- ${risk}`).join('\n')}
      
      Market Sentiment: ${marketAnalysis.sentiment.toFixed(2)}
      Analysis Confidence: ${marketAnalysis.confidence.toFixed(2)}
    `;
  }

  private formatRecommendations(recommendations: string[]): string {
    if (!recommendations?.length) return 'No recommendations available';
    return recommendations.map(rec => `- ${rec}`).join('\n');
  }

  private formatInsights(insights: Insight[]): string {
    if (!insights?.length) return 'No insights available';
    return insights.map(insight => 
      `- ${insight.content} (Type: ${insight.type}, Confidence: ${insight.confidence.toFixed(2)}, Priority: ${insight.priority})`
    ).join('\n');
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

  private async generateWorkflowActions(input: string): Promise<WorkflowAction[]> {
    try {
      const request: AnalysisRequest = {
        context: this.context,
        data: [{
          type: 'insights' as AnalysisType,
          content: input,
          parameters: {
            useML: true,
            includeSentiment: true,
            includeRisks: true,
            includeMarketAnalysis: true,
            includeTrends: true,
            workflowAnalysis: true,
            analysisType: 'workflow'
          }
        }],
        parameters: {
          format: 'detailed',
          returnFullContext: true,
          includeWorkflows: true,
          analysisType: 'workflow'
        }
      };

      const response = await this.aiService.analyzeData(request);
      return this.transformToWorkflowActions(response);
    } catch (error) {
      console.error('Error generating workflow actions:', error);
      return [];
    }
  }

  private transformToWorkflowActions(response: AIAnalysisResponse): WorkflowAction[] {
    try {
      const actions: WorkflowAction[] = [];
      
      if (response.market_analysis) {
        actions.push({
          id: `market_${Date.now()}`,
          type: 'MARKET_ANALYSIS' as WorkflowActionType,
          description: `Analyze market trends: ${response.market_analysis.trends.join(', ')}`,
          priority: 'high' as PriorityLevel,
          status: 'pending' as WorkflowStatus,
          dependencies: [],
          automationPotential: 0.7,
          mlConfidence: response.market_analysis.confidence || 0.8,
          metadata: {
            source: 'market_analysis',
            timestamp: new Date().toISOString(),
            confidence: response.market_analysis.confidence,
            sentiment: response.market_analysis.sentiment
          }
        });
      }

      response.recommendations?.forEach((rec, index) => {
        actions.push({
          id: `rec_${Date.now()}_${index}`,
          type: 'RECOMMENDATION' as WorkflowActionType,
          description: rec,
          priority: 'medium' as PriorityLevel,
          status: 'pending' as WorkflowStatus,
          dependencies: [],
          automationPotential: 0.5,
          mlConfidence: response.confidence_score || 0.8,
          metadata: {
            source: 'recommendations',
            timestamp: new Date().toISOString(),
            confidence: response.confidence_score
          }
        });
      });

      if (response.risks && response.risks.overall_risk > 0.5) {
        actions.push({
          id: `risk_${Date.now()}`,
          type: 'RISK_MITIGATION' as WorkflowActionType,
          description: 'Address identified risks and develop mitigation strategies',
          priority: 'high' as PriorityLevel,
          status: 'pending' as WorkflowStatus,
          dependencies: [],
          automationPotential: 0.3,
          mlConfidence: response.confidence_score || 0.8,
          metadata: {
            source: 'risk_analysis',
            timestamp: new Date().toISOString(),
            riskScore: response.risks.overall_risk,
            factors: response.risks.factors
          }
        });
      }

      return actions;
    } catch (error) {
      console.error('Error transforming response to workflow actions:', error);
      return [];
    }
  }

  private async extractInsights(analysis: string): Promise<InsightType[]> {
    try {
      const request: AnalysisRequest = {
        context: this.context,
        data: [{
          type: 'insights' as AnalysisType,
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
      };

      const mlInsights = await this.aiService.analyzeData(request);

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
      // First try to parse as JSON
      try {
        const parsedActions = JSON.parse(actionsText);
        return parsedActions.map((action: any) => {
          // Ensure type is valid
          const type: WorkflowActionType = 
            ['analysis', 'prediction', 'recommendation', 'action', 'automation'].includes(action.type) 
              ? action.type 
              : 'action';
              
          // Ensure priority is valid
          const priority: PriorityLevel = 
            ['high', 'medium', 'low'].includes(action.priority) 
              ? action.priority 
              : 'medium';
              
          // Ensure status is valid
          const status: WorkflowStatus = 
            ['pending', 'in_progress', 'completed', 'cancelled'].includes(action.status) 
              ? action.status 
              : 'pending';

          return {
            ...action,
            type,
            priority,
            status,
            mlConfidence: this.findMatchingMLAction(action, mlActions.predictions)?.confidence || 0,
            metadata: {
              ...action.metadata,
              source: action.metadata?.source || 'json-parsing',
              timestamp: action.metadata?.timestamp || new Date().toISOString()
            }
          } as WorkflowAction;
        });
      } catch {
        // If JSON parsing fails, try to extract structured data from text
        return this.extractActionsFromText(actionsText, mlActions);
      }
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
      if (insightsText.includes('**')) {
        const insight: InsightType = {
          type: 'market',
          content: insightsText,
          confidence: 0.85,
          priority: 'high' as PriorityLevel,
          timestamp: new Date().toISOString(),
          source: 'analysis'
        };
        return [insight];
      }
      
      const parsedInsights = JSON.parse(insightsText);
      return parsedInsights.map((insight: any): InsightType => ({
        type: (insight.type as AIInsightType) || 'market',
        content: insight.content,
        confidence: insight.confidence || 0.8,
        priority: (insight.priority as PriorityLevel) || 'medium',
        timestamp: new Date().toISOString(),
        source: insight.source || 'analysis'
      }));
    } catch (error) {
      console.warn('Error parsing insights:', error);
      return [{
        type: 'market',
        content: insightsText,
        confidence: 0.8,
        priority: 'medium' as PriorityLevel,
        timestamp: new Date().toISOString(),
        source: 'analysis'
      }];
    }
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
  private extractActionsFromText(text: string, mlActions: any): WorkflowAction[] {
    try {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      
      return lines.map((line, index) => {
        // Try to extract type from the line
        const typeMatch = line.match(/type:\s*(\w+)/i) || 
                         line.match(/\[([\w-]+)\]/i) ||
                         line.match(/^(analysis|prediction|recommendation|action|automation):/i);
        
        // Ensure type is one of the allowed values
        const extractedType = (typeMatch?.[1] || 'action').toLowerCase();
        const type: WorkflowActionType = 
          ['analysis', 'prediction', 'recommendation', 'action', 'automation'].includes(extractedType) 
            ? extractedType as WorkflowActionType 
            : 'action';
        
        // Try to extract priority from the line
        const priorityMatch = line.match(/priority:\s*(high|medium|low)/i) ||
                            line.match(/\((high|medium|low)\)/i);
        
        const priority: PriorityLevel = 
          (priorityMatch?.[1]?.toLowerCase() || 'medium') as PriorityLevel;
        
        // Try to extract impact metrics
        const impactMatch = line.match(/impact:\s*({[^}]+})/i) ||
                          line.match(/efficiency:\s*([\d.]+)/i);
        
        // Try to extract status from the line
        const statusMatch = line.match(/status:\s*(pending|in_progress|completed|cancelled)/i) ||
                           line.match(/\{(pending|in_progress|completed|cancelled)\}/i);

        const status: WorkflowStatus = 
          (statusMatch?.[1] || 'pending') as WorkflowStatus;
        
        // Find matching ML action for confidence score
        const matchingMLAction = mlActions?.predictions?.find((mla: any) => 
          this.calculateSimilarity(mla.description, line) > 0.7
        );

        const action: WorkflowAction = {
          id: `action_${Date.now()}_${index}`,
          type,
          description: line.replace(/^[^:]+:\s*/, '').trim(),
          priority,
          status,
          impact: this.parseImpact(impactMatch?.[1]),
          dependencies: [],
          automationPotential: this.estimateAutomationPotential(line),
          mlConfidence: matchingMLAction?.confidence || 0.5,
          metadata: {
            source: 'text-extraction',
            timestamp: new Date().toISOString(),
            rawText: line,
            confidence: matchingMLAction?.confidence,
            riskScore: matchingMLAction?.riskScore
          }
        };

        return action;
      });
    } catch (error) {
      console.error('Error extracting actions from text:', error);
      return [];
    }
  }

  private parseImpact(impactString?: string): { efficiency: number; risk: number; revenue: number } {
    if (!impactString) {
      return { efficiency: 0.5, risk: 0.5, revenue: 0.5 };
    }

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(impactString);
      return {
        efficiency: parsed.efficiency ?? 0.5,
        risk: parsed.risk ?? 0.5,
        revenue: parsed.revenue ?? 0.5
      };
    } catch {
      // Fallback to default values
      return { efficiency: 0.5, risk: 0.5, revenue: 0.5 };
    }
  }

  private estimateAutomationPotential(text: string): number {
    const automationKeywords = [
      'automate', 'automation', 'automated', 'automatic',
      'workflow', 'process', 'routine', 'repetitive',
      'systematic', 'programmatic', 'scheduled'
    ];

    const words = text.toLowerCase().split(/\W+/);
    const matchCount = automationKeywords.reduce((count, keyword) => 
      count + (words.includes(keyword) ? 1 : 0), 0
    );

    return Math.min(matchCount / 3, 1); // Normalize to 0-1 range
  }

  async analyzeInput(message: string): Promise<AnalysisResponse> {
    if (!message?.trim()) {
      throw new Error('Invalid input: message cannot be empty');
    }

    try {
      const analysis = await this.performComplexAnalysis(message);
      
      // Execute these in parallel but handle failures independently
      const [actions, insights, mlMetrics] = await Promise.all([
        this.generateWorkflowActions(message).catch(error => {
          console.error('Workflow generation failed:', error);
          return [];
        }),
        this.extractInsights(analysis).catch(error => {
          console.error('Insight extraction failed:', error);
          return [];
        }),
        this.aiService.analyzeData({
          context: this.context,
          data: [{
            type: 'metrics' as AnalysisType,
            content: message,
            parameters: {
              analysis,
              includeConfidence: true
            }
          }],
          parameters: { includeConfidence: true }
        }).catch(error => {
          console.error('Metrics analysis failed:', error);
          return { metrics: {}, confidence: 0 };
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
    } catch (error) {
      console.error('Error analyzing input:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to analyze input: ${error.message}`);
      }
      throw new Error('Failed to analyze input: Unknown error');
    }
  }
}