"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MLClient } from '@/lib/ml-client';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function RiskAssessment() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ risk_score: number; confidence: number } | null>(null);

  const assessRisk = async () => {
    setLoading(true);
    try {
      // Example features (in production, these would come from your data)
      const features = Array(10).fill(0).map(() => Math.random());
      const assessment = await MLClient.assessRisk({ features });
      setResult(assessment);
    } catch (error) {
      console.error('Risk assessment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
      
      <div className="space-y-4">
        <Button 
          onClick={assessRisk} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Analyzing...' : 'Assess Risk'}
        </Button>

        {result && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              {result.risk_score > 0.5 ? (
                <AlertCircle className="text-red-500" />
              ) : (
                <CheckCircle className="text-green-500" />
              )}
              <span className="font-medium">
                Risk Score: {(result.risk_score * 100).toFixed(2)}%
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}