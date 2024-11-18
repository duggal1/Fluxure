"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { EnterpriseAgent } from '@/lib/agent-core';

const workflows = [
  {
    id: 1,
    name: 'Supply Chain Optimization',
    status: 'running',
    lastRun: '2 minutes ago',
    efficiency: '94%',
  },
  {
    id: 2,
    name: 'Customer Sentiment Analysis',
    status: 'paused',
    lastRun: '1 hour ago',
    efficiency: '87%',
  },
  {
    id: 3,
    name: 'Risk Assessment',
    status: 'running',
    lastRun: '5 minutes ago',
    efficiency: '92%',
  },
];

interface WorkflowPanelProps {
  agent: EnterpriseAgent;
}

export function WorkflowPanel({ agent }: WorkflowPanelProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Active Workflows</h2>
      <div className="space-y-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{workflow.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Last run: {workflow.lastRun} | Efficiency: {workflow.efficiency}
                </p>
              </div>
              <div className="flex gap-2">
                {workflow.status === 'running' ? (
                  <Button size="sm" variant="outline">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}