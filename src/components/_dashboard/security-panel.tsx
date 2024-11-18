"use client";

import { Card } from '@/components/ui/card';
import { EnterpriseAgent } from '@/lib/agent-core';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const securityMetrics = [
  {
    title: 'Encryption Status',
    status: 'Secure',
    icon: Shield,
    description: 'End-to-end encryption active',
  },
  {
    title: 'Access Control',
    status: 'Monitored',
    icon: CheckCircle,
    description: 'Role-based access enforced',
  },
  {
    title: 'Threat Detection',
    status: 'Alert',
    icon: AlertTriangle,
    description: '2 minor alerts detected',
  },
];

interface SecurityPanelProps {
  agent: EnterpriseAgent;
}

export function SecurityPanel({ agent }: SecurityPanelProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Security Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {securityMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="p-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{metric.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                  <p className="text-sm font-medium mt-1">{metric.status}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}