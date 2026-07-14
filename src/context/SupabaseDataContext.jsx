import React, { createContext, useContext } from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';

const SupabaseDataContext = createContext(null);

export function SupabaseDataProvider({ children }) {
  const data = useSupabaseData();
  return (
    <SupabaseDataContext.Provider value={data}>
      {children}
    </SupabaseDataContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseDataContext);
  if (!ctx) throw new Error('useSupabase must be used within a SupabaseDataProvider');
  return ctx;
}
