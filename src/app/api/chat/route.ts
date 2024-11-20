import axios from 'axios';
import { NextResponse } from 'next/server';
import { createEnterpriseAgent } from '@/lib/agent-factory';
import { EnterpriseAgent } from '@/lib/agent-core';

let agent: EnterpriseAgent;
const PYTHON_SERVER_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

async function checkServerHealth() {
  try {
    const response = await axios.get(`${PYTHON_SERVER_URL}/health`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      },
      proxy: false
    });
    
    return response.status === 200 && response.data?.models_initialized;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

async function initializeAgent() {
  const maxRetries = Number(process.env.NEXT_PUBLIC_MAX_RETRIES) || 3;
  const retryDelay = 1000;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const isHealthy = await checkServerHealth();
      
      if (!isHealthy && !process.env.NEXT_PUBLIC_ENABLE_FALLBACK) {
        throw new Error('Python server is not healthy');
      }

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

      agent = createEnterpriseAgent(businessContext);
      console.log('Agent initialized successfully');
      return true;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed to initialize agent:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      if (process.env.NEXT_PUBLIC_ENABLE_FALLBACK === 'true') {
        console.log('Using fallback mode');
        agent = createEnterpriseAgent({
          industry: '',
          companySize: '',
          keyMetrics: {
            revenue: 0,
            employees: 0,
            marketShare: 0,
            growthRate: 0,
            efficiency: 0,
            riskScore: 0
          },
          priorities: [],
          competitiveContext: {},
          marketPosition: {}
        });
        return true;
      }
      
      return false;
    }
  }
  return false;
}

export async function POST(req: Request) {
  try {
    if (!agent) {
      const initialized = await initializeAgent();
      if (!initialized) {
        return NextResponse.json(
          { 
            error: 'Service Unavailable',
            message: 'AI service initialization failed. Please try again later.',
            status: 'error',
            timestamp: new Date().toISOString()
          },
          { status: 503 }
        );
      }
    }

    const { message } = await req.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { 
          error: 'Bad Request',
          message: 'Message cannot be empty',
          status: 'error',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const result = await agent.analyzeInput(message);
    return NextResponse.json({
      data: result,
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        status: 'error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}