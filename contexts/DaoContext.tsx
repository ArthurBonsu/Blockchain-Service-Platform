import React, { createContext, useContext } from 'react';
import useDaoContextHook from './useDaoContext';

const DaoContext = createContext<any>(null);

export const DaoProvider = ({ children }: { children: React.ReactNode }) => {
  const daoContext = useDaoContextHook();
  
  return (
    <DaoContext.Provider value={daoContext}>
      {children}
    </DaoContext.Provider>
  );
};

// This is a wrapper to ensure components use the context through this hook
export const useDaoContext = () => {
  const context = useContext(DaoContext);
  if (!context) {
    throw new Error("useDaoContext must be used within a DaoProvider");
  }
  return context;
};

export default useDaoContext;