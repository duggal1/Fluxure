import { NextResponse } from 'next/server';
import { EnterpriseAgent } from '@/lib/agent-core';

const businessContext = {
  industry: 'Technology',
  companySize: 'Enterprise',
  keyMetrics: {
    revenue: 1000000000,
    employees: 5000,
    marketShare: 15,
    growthRate: 8.5,
    efficiency: 0.85,
    riskScore: 0.3
  },
  priorities: ['Digital Transformation', 'Cost Optimization', 'Market Expansion'],
  competitiveContext: {},
  marketPosition: {}
};

const agent = new EnterpriseAgent(businessContext);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const result = await agent.analyzeInput(message);

    return NextResponse.json({
      response: result.response || 'Unable to generate response at this time',
      actions: result.actions || [],
      insights: result.insights || []
    });
  } catch (error) {
    console.error('Error in enterprise agent:', error);
    
    // Return a more graceful error response
    return NextResponse.json(
      {
        response: 'I apologize, but I am currently experiencing technical difficulties. Please try again later.',
        actions: [],
        insights: [{
          type: 'system',
          content: 'System is temporarily unavailable',
          priority: 'high',
          confidence: 1,
          impact: 1,
          recommendations: ['Please try again in a few moments'],
          timestamp: new Date()
        }]
      },
      { status: 500 }
    );
  }
}