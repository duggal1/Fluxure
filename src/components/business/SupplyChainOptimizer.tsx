"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Truck, Package, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface OptimizationResult {
  optimization_result: number[];
  recommendations: Array<{
    action: string;
    impact: number;
  }>;
}

export function SupplyChainOptimizer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const { toast } = useToast();

  const optimizeSupplyChain = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/supply-chain/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: Array(10).fill(0).map(() => Math.random())
        })
      });

      if (!response.ok) throw new Error('Optimization failed');
      
      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Supply Chain Optimization Complete",
        description: "New recommendations are available.",
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
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
          <Truck className="h-6 w-6" />
          <h3 className="text-xl font-semibold">Supply Chain Optimizer</h3>
        </div>
        <Button onClick={optimizeSupplyChain} disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Now'}
        </Button>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.recommendations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="impact" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.recommendations.map((rec, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5" />
                  <h4 className="font-semibold">{rec.action}</h4>
                </div>
                <div className="text-sm text-muted-foreground">
                  Impact Score: {(rec.impact * 100).toFixed(1)}%
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}