import { DashboardView } from '@/components/dashboards/dashboard-view';
import  AIFeatures  from '@/components/dashboards/ai-features';

export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="bg-clip-text bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 mb-8 font-bold text-7xl text-center text-transparent">
        Enterprise AI Command Center
      </h1>
      <DashboardView />
    
    </div>
  );
}