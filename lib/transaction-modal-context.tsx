'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TransactionModalContextType {
  isOpen: boolean;
  openAdd: () => void;
  close: () => void;
}

const TransactionModalContext = createContext<TransactionModalContextType | null>(null);

export function TransactionModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openAdd = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <TransactionModalContext.Provider value={{ isOpen, openAdd, close }}>
      {children}
    </TransactionModalContext.Provider>
  );
}

export function useTransactionModal() {
  const ctx = useContext(TransactionModalContext);
  if (!ctx) {
    throw new Error('useTransactionModal must be used within a TransactionModalProvider');
  }
  return ctx;
}
