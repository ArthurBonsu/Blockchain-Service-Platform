import React, { createContext, useContext } from "react";
import useCrowdsourceContextHook from './useCrowdsourceContext';

const CrowdSourceContext = createContext<any>(null);

export const CrowdSourceProvider = ({ children }: { children: React.ReactNode }) => {
  const crowdSourceContext = useCrowdsourceContextHook();
  
  return (
    <CrowdSourceContext.Provider value={crowdSourceContext}>
      {children}
    </CrowdSourceContext.Provider>
  );
};

// This is a wrapper to ensure components use the context through this hook
export const useCrowdSourceContext = () => {
  const context = useContext(CrowdSourceContext);
  if (!context) {
    throw new Error("useCrowdSourceContext must be used within a CrowdSourceProvider");
  }
  return context;
};

export default useCrowdSourceContext;