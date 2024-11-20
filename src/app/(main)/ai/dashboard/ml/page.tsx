import { RiskAssessment } from '@/components/ml/RiskAssessment';
import { DemandPrediction } from '@/components/ml/DemandPrediction';

export default function MLDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">ML Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskAssessment />
        <DemandPrediction />
      </div>
    </div>
  );
}