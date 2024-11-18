"use client";

import { useState } from 'react';
import { Brain, LineChart, Shield, Workflow } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AgentChat } from './agent-chat';
import { MetricsDisplay } from './metrics-display';
import { WorkflowPanel } from './workflow-panel';
import { SecurityPanel } from './security-panel';
import { EnterpriseAgent } from '@/lib/agent-core';

interface AgentDashboardProps {
  agent: EnterpriseAgent;
}

export function AgentDashboard({ agent }: AgentDashboardProps) {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Enterprise AI Agent
          </h1>
          <p className="text-muted-foreground mt-2">
            Autonomous Intelligence for Business Operations
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className={`p-4 cursor-pointer transition-all hover:scale-105 ${
            activeTab === 'chat' ? 'border-primary' : ''
          }`}
          onClick={() => setActiveTab('chat')}
        >
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
        </Card>

        <Card 
          className={`p-4 cursor-pointer transition-all hover:scale-105 ${
            activeTab === 'metrics' ? 'border-primary' : ''
          }`}
          onClick={() => setActiveTab('metrics')}
        >
          <div className="flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Analytics</h3>
          </div>
        </Card>

        <Card 
          className={`p-4 cursor-pointer transition-all hover:scale-105 ${
            activeTab === 'workflows' ? 'border-primary' : ''
          }`}
          onClick={() => setActiveTab('workflows')}
        >
          <div className="flex items-center space-x-2">
            <Workflow className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Workflows</h3>
          </div>
        </Card>

        <Card 
          className={`p-4 cursor-pointer transition-all hover:scale-105 ${
            activeTab === 'security' ? 'border-primary' : ''
          }`}
          onClick={() => setActiveTab('security')}
        >
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Security</h3>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        {activeTab === 'chat' && <AgentChat agent={agent} />}
        {activeTab === 'metrics' && <MetricsDisplay agent={agent} />}
        {activeTab === 'workflows' && <WorkflowPanel agent={agent} />}
        {activeTab === 'security' && <SecurityPanel agent={agent} />}
      </div>
    </div>
  );
}