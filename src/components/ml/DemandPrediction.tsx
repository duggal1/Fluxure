"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MLClient } from '@/lib/ml-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export function DemandPrediction() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<{ time: string; value: number }[]>([]);

  const predictDemand = async () => {
    setLoading(true);
    try {
      // Simulate multiple predictions over time
      const newPredictions = [];
      for (let i = 0; i < 7; i++) {
        const features = Array(8).fill(0).map(() => Math.random());
        const result = await MLClient.predictDemand({ features });
        newPredictions.push({
          time: `Day ${i + 1}`,
          value: result.predicted_demand
        });
      }
      setPredictions(newPredictions);
    } catch (error) {
      console.error('Demand prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-xl">Demand Prediction</h3>
      
      <div className="space-y-4">
        <Button 
          onClick={predictDemand} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Predicting...' : 'Predict Demand'}
        </Button>

        {predictions.length > 0 && (
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
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
        )}
      </div>
    </Card>
  );
}