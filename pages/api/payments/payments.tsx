import React from 'react';
import { withAuth } from '@/utils/withAuth';
import Layout from '@/components/Layout/Layout';
import Payments from '@/components/PaymentTransfer/PaymentTransfer';
import { useSafeContext } from '@/contexts/useSafeContext';

const PaymentsPage = () => {
  // Use SafeContext to get current account
  const { currentAccount } = useSafeContext();

  return (
    <Layout title="Payments" address={currentAccount}>
      <Payments username={''} address={''} amount={0} comment={''} receipient={''} receipients={[]} USDprice={0} paymenthash={''} owneraddress={''} onPayTransfer={function (): void {
        throw new Error('Function not implemented.');
      } } />
    </Layout>
  );
};

export default withAuth(PaymentsPage);