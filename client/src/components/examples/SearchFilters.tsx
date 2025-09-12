import { useState } from 'react';
import SearchFilters from '../SearchFilters';

export default function SearchFiltersExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-4 max-w-4xl">
      <SearchFilters 
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}