import { useState } from 'react';
import BillingUpgrade from '../BillingUpgrade';

export default function BillingUpgradeExample() {
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium'>('free');

  return (
    <div className="p-6">
      <div className="mb-4 flex space-x-2">
        <button 
          onClick={() => setCurrentPlan('free')}
          className={`px-3 py-1 rounded text-sm ${currentPlan === 'free' ? 'bg-primary text-white' : 'bg-gray-200'}`}
        >
          Show Free User
        </button>
        <button 
          onClick={() => setCurrentPlan('premium')}
          className={`px-3 py-1 rounded text-sm ${currentPlan === 'premium' ? 'bg-primary text-white' : 'bg-gray-200'}`}
        >
          Show Premium User
        </button>
      </div>
      
      <BillingUpgrade 
        currentPlan={currentPlan}
        onUpgrade={() => setCurrentPlan('premium')}
      />
    </div>
  );
}