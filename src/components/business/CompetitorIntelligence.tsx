"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import {ForceGraph2D }from 'react-force-graph';

interface CompetitorData {
  name: string;
  marketShare: number;
  trend: 'up' | 'down' | 'stable';
  threats: string[];
}

export function CompetitorIntelligence() {
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [graphData, setGraphData] = useState<any>(null);

  const analyzeCompetitors = async () => {
    setLoading(true);
    try {
      // Simulate competitor analysis
      const competitorData: CompetitorData[] = [
        {
          name: 'Competitor A',
          marketShare: 25,
          trend: 'up',
          threats: ['New Product Launch', 'Market Expansion']
        },
        {
          name: 'Competitor B',
          marketShare: 18,
          trend: 'stable',
          threats: ['Strong Brand Loyalty']
        },
        {
          name: 'Competitor C',
          marketShare: 15,
          trend: 'down',
          threats: ['Technical Debt']
        }
      ];

      // Generate graph data
      const nodes = competitorData.map(comp => ({
        id: comp.name,
        val: comp.marketShare
      }));

      const links = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          links.push({
            source: nodes[i].id,
            target: nodes[j].id,
            value: Math.random()
          });
        }
      }

      setCompetitors(competitorData);
      setGraphData({ nodes, links });
    } catch (error) {
      console.error('Competitor analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Eye className="h-6 w-6" />
          <h3 className="text-xl font-semibold">Competitor Intelligence</h3>
        </div>
        <Button onClick={analyzeCompetitors} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Competitors'}
        </Button>
      </div>

      {competitors.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ScrollArea className="h-[400px]">
              {competitors.map((competitor, index) => (
                <Card key={index} className="p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{competitor.name}</h4>
                    <Badge variant={competitor.trend === 'up' ? 'default' : 'secondary'}>
                      {competitor.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                      {competitor.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                      {competitor.marketShare}% Market Share
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {competitor.threats.map((threat, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        {threat}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </ScrollArea>
          </div>

          <div className="h-[400px] bg-muted rounded-lg">
            {graphData && (
              <ForceGraph2D
                graphData={graphData}
                nodeLabel="id"
                nodeRelSize={8}
                linkWidth={2}
                linkColor={() => '#8884d8'}
                nodeColor={() => '#ff4d4f'}
              />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}