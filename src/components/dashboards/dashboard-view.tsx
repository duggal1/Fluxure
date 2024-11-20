"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAI } from '@/components/providers/ai-provider';

const mockData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];

export function DashboardView() {
  const { isInitialized } = useAI();
  const [insights, setInsights] = useState<string>("");

  useEffect(() => {
    if (isInitialized) {
      fetchAIInsights();
    }
  }, [isInitialized]);

  const fetchAIInsights = async () => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'gemini',
          prompt: 'Generate a brief business insight based on recent performance metrics.',
        }),
      });
      const data = await response.json();
      setInsights(data.result);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Business Performance</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
              <p className="text-muted-foreground">
                {insights || "Loading AI insights..."}
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold">Detailed Analytics</h2>
            {/* Add detailed analytics components */}
          </Card>
        </TabsContent>
        
        <TabsContent value="predictions">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold">AI Predictions</h2>
            {/* Add prediction components */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}