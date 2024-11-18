"use client";

import { Card } from '@/components/ui/card';
import { EnterpriseAgent } from '@/lib/agent-core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', efficiency: 65, risks: 35, decisions: 80 },
  { name: 'Feb', efficiency: 75, risks: 45, decisions: 85 },
  { name: 'Mar', efficiency: 85, risks: 25, decisions: 90 },
  { name: 'Apr', efficiency: 80, risks: 30, decisions: 88 },
  { name: 'May', efficiency: 90, risks: 20, decisions: 95 },
];
interface MetricsDisplayProps {
  agent: EnterpriseAgent;
}

export function MetricsDisplay({ agent }: MetricsDisplayProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Performance Analytics</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="efficiency" 
              stroke="hsl(var(--chart-1))" 
              name="Efficiency"
            />
            <Line 
              type="monotone" 
              dataKey="risks" 
              stroke="hsl(var(--chart-2))" 
              name="Risks"
            />
            <Line 
              type="monotone" 
              dataKey="decisions" 
              stroke="hsl(var(--chart-3))" 
              name="Decisions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}