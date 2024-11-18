'use client';

import { AgentDashboard } from '@/components/_dashboard/agent-dashboard';
import { BusinessContext } from '@/types/agent';
import { createEnterpriseAgent } from '@/lib/agent-factory';
import { useEffect, useState } from 'react';
import { EnterpriseAgent } from '@/lib/agent-core';

const businessContext: BusinessContext = {
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
  const [agentState, setAgentState] = useState<EnterpriseAgent | null>(null);

  useEffect(() => {
    const agent = createEnterpriseAgent(businessContext);
    setAgentState(agent);
  }, []);

  if (!agentState) {
    return <div>Loading AI Agent...</div>;
  }

  return (
    <main className="bg-background min-h-screen">
      <AgentDashboard agent={agentState} />
    </main>
  );
}