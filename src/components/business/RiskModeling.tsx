"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle } from 'lucide-react';
import { MLClient } from '@/lib/ml-client';

interface RiskMetrics {
  category: string;
  score: number;
  impact: number;
  likelihood: number;
}

export function RiskModeling() {
  const [loading, setLoading] = useState(false);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics[]>([]);
  const [overallRisk, setOverallRisk] = useState<number>(0);

  const analyzeRisks = async () => {
    setLoading(true);
    try {
      const features = Array(10).fill(0).map(() => Math.random());
      const assessment = await MLClient.assessRisk({ features });
      
      // Generate comprehensive risk metrics
      const metrics: RiskMetrics[] = [
        {
          category: 'Market Risk',
          score: Math.random(),
          impact: Math.random() * 100,
          likelihood: Math.random()
        },
        {
          category: 'Operational Risk',
          score: Math.random(),
          impact: Math.random() * 100,
          likelihood: Math.random()
        },
        {
          category: 'Financial Risk',
          score: Math.random(),
          impact: Math.random() * 100,
          likelihood: Math.random()
        },
        {
          category: 'Strategic Risk',
          score: Math.random(),
          impact: Math.random() * 100,
          likelihood: Math.random()
        }
      ];

      setRiskMetrics(metrics);
      setOverallRisk(assessment.risk_score * 100);
    } catch (error) {
      console.error('Risk modeling failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h3 className="text-xl font-semibold">Risk Modeling</h3>
        </div>
        <Button onClick={analyzeRisks} disabled={loading}>
          {loading ? 'Analyzing...' : 'Model Risks'}
        </Button>
      </div>

      {riskMetrics.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Risk Score</span>
              <span className={`font-bold ${overallRisk > 70 ? 'text-red-500' : overallRisk > 30 ? 'text-yellow-500' : 'text-green-500'}`}>
                {overallRisk.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallRisk} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} />
                  <Radar
                    name="Risk Score"
                    dataKey="score"
                    stroke="#ff4d4f"
                    fill="#ff4d4f"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {riskMetrics.map((metric, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.category}</span>
                    <AlertTriangle className={`h-5 w-5 ${metric.score > 0.7 ? 'text-red-500' : metric.score > 0.3 ? 'text-yellow-500' : 'text-green-500'}`} />
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Impact: {metric.impact.toFixed(1)}%</div>
                    <div>Likelihood: {(metric.likelihood * 100).toFixed(1)}%</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}