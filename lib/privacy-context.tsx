'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface PrivacyContextType {
  hideAmounts: boolean;
  toggleHideAmounts: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | null>(null);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hideAmounts, setHideAmounts] = useState(false);

  useEffect(() => {
    setHideAmounts(localStorage.getItem('hideAmounts') === '1');
  }, []);

  const toggleHideAmounts = useCallback(() => {
    setHideAmounts(prev => {
      const next = !prev;
      localStorage.setItem('hideAmounts', next ? '1' : '0');
      return next;
    });
  }, []);

  return (
    <PrivacyContext.Provider value={{ hideAmounts, toggleHideAmounts }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return ctx;
}
