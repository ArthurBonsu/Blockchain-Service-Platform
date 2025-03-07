import React, { createContext, useContext } from 'react';
import useLandOwnershipContextHook from './useLandOwnershipContext';

const LandOwnershipContext = createContext<any>(null);

export const LandOwnershipProvider = ({ children }: { children: React.ReactNode }) => {
  const landOwnershipContext = useLandOwnershipContextHook();
  
  return (
    <LandOwnershipContext.Provider value={landOwnershipContext}>
      {children}
    </LandOwnershipContext.Provider>
  );
};

// This is a wrapper to ensure components use the context through this hook
export const useLandOwnershipContext = () => {
  const context = useContext(LandOwnershipContext);
  if (!context) {
    throw new Error("useLandOwnershipContext must be used within a LandOwnershipProvider");
  }
  return context;
};

export default useLandOwnershipContext;