import React, { createContext, useContext, useState, useCallback } from 'react';

interface CompareContextType {
  compareList: string[];
  addToCompare: (id: string) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>([]);

  const addToCompare = useCallback((id: string): boolean => {
    if (compareList.length >= MAX_COMPARE) return false;
    if (compareList.includes(id)) return true;
    setCompareList(prev => [...prev, id]);
    return true;
  }, [compareList]);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList(prev => prev.filter(item => item !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((id: string) => {
    return compareList.includes(id);
  }, [compareList]);

  const canAddMore = compareList.length < MAX_COMPARE;

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddMore,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
