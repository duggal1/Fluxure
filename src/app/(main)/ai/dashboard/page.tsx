import { SupplyChainOptimizer } from '@/components/business/SupplyChainOptimizer';
import { CustomerIntelligence } from '@/components/business/CustomerIntelligence';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Enterprise Command Center</h1>
      
      <div className="grid grid-cols-1 gap-8">
        <SupplyChainOptimizer />
        <CustomerIntelligence />
      </div>
    </div>
  );
}