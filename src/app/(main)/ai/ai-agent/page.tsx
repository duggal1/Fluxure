'use client';

import { useEffect, useState } from 'react';
import { AgentDashboard } from '@/components/_dashboard/agent-dashboard';
import { checkServerHealth, getServerStatus } from '@/lib/health-check';
import { createEnterpriseAgent } from '@/lib/agent-factory';
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

export default function AIAgentPage() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<EnterpriseAgent | null>(null);
  const [serverStatus, setServerStatus] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeAI() {
      try {
        // First, check server health
        const isHealthy = await checkServerHealth();
        if (!mounted) return;

        if (!isHealthy) {
          setStatus('error');
          setError('AI service is not available. Please check if the Python server is running.');
          return;
        }

        // Get detailed server status
        const status = await getServerStatus();
        if (!mounted) return;
        setServerStatus(status);

        if (!status.modelsInitialized) {
          setStatus('error');
          setError('AI models are not properly initialized. Please restart the Python server.');
          return;
        }

        // Initialize the agent
        const newAgent = createEnterpriseAgent(businessContext);
        if (!mounted) return;
        
        setAgent(newAgent);
        setStatus('ready');
        console.log('AI Agent initialized successfully');

      } catch (err: any) {
        if (!mounted) return;
        console.error('AI initialization error:', err);
        setStatus('error');
        setError(err.message || 'Failed to initialize AI system');
      }
    }

    initializeAI();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Initializing AI System</h2>
          <p className="text-gray-600">Please wait while we connect to the AI backend...</p>
          <div className="mt-4 text-sm text-gray-500">
            Checking server status and initializing models...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Error</h2>
          <p className="text-red-500">{error || 'Failed to initialize AI system'}</p>
          {serverStatus && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Server Status: {serverStatus.isHealthy ? 'Online' : 'Offline'}</p>
              <p>Models Status: {serverStatus.modelsInitialized ? 'Initialized' : 'Not Initialized'}</p>
              <p>Memory Usage: {serverStatus.memoryUsage}</p>
              <p>Last Check: {new Date(serverStatus.timestamp).toLocaleString()}</p>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-background min-h-screen">
      <AgentDashboard agent={agent!} />
    </main>
  );
}