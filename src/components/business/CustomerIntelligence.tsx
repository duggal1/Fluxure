"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import { Users, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface CustomerInsight {
  category: string;
  score: number;
}

interface AnalysisResult {
  segments: number[];
  insights: CustomerInsight[];
}

export function CustomerIntelligence() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: Array(20).fill(0).map(() => Math.random())
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Customer Analysis Complete",
        description: "New insights are available.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          <h3 className="text-xl font-semibold">Customer Intelligence</h3>
        </div>
        <Button onClick={analyzeCustomers} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Customers'}
        </Button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={result.insights}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 1]} />
                <Radar
                  name="Customer Metrics"
                  dataKey="score"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.insights.map((insight, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <h4 className="font-semibold">{insight.category}</h4>
                </div>
                <div className="text-sm text-muted-foreground">
                  Score: {(insight.score * 100).toFixed(1)}%
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}