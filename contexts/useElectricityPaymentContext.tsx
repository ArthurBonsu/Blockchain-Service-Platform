import { useContext } from 'react';
import { ElectricityPaymentContext } from './ElectricityPaymentContext';

// Custom hook to use the ElectricityPaymentContext
export const useElectricityPaymentContext = () => {
  const context = useContext(ElectricityPaymentContext);
  
  if (!context) {
    throw new Error(
      'useElectricityPaymentContext must be used within an ElectricityPaymentProvider'
    );
  }
  
  return context;
};

export default useElectricityPaymentContext;