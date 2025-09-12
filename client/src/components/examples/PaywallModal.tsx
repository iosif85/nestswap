import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PaywallModal from '../PaywallModal';

export default function PaywallModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)}>
        Open Paywall Modal
      </Button>
      
      <PaywallModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        feature="request a swap"
      />
    </div>
  );
}