import { NextResponse } from 'next/server';
import { EnterpriseAgent } from '@/lib/agent-core';

// Initialize with business context
const agent = new EnterpriseAgent({
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
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Process with enterprise agent
    const result = await agent.analyzeInput(message);

    return NextResponse.json({
      response: result.response,
      actions: result.actions,
      insights: result.insights
    });
  } catch (error) {
    console.error('Error in enterprise agent:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}