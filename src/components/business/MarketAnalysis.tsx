"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useAI } from '@/components/providers/ai-provider';

export function MarketAnalysis() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const { gemini } = useAI();

  const analyzeTrends = async () => {
    setLoading(true);
    try {
      // Simulate market trend data
      const trendData = Array.from({ length: 12 }, (_, i) => ({
        month: `Month ${i + 1}`,
        trend: Math.random() * 100,
        confidence: 0.5 + Math.random() * 0.5,
        risk: Math.random() * 30
      }));
      
      setPredictions(trendData);
    } catch (error) {
      console.error('Market analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <h3 className="text-xl font-semibold">Market Analysis</h3>
        </div>
        <Button onClick={analyzeTrends} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Market'}
        </Button>
      </div>

      {predictions.length > 0 && (
        <Tabs defaultValue="trends">
          <TabsList className="mb-4">
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="trend" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="risks">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#ff4d4f" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
}