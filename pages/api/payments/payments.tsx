import React from 'react';
import { withAuth } from '@/utils/withAuth';
import Layout from '@/components/Layout/Layout';
import Payments from '@/components/PaymentTransfer/PaymentTransfer';
import { useEthersStore } from '@/stores/ethersStore';




const PaymentsPage = () => {
  const address = useEthersStore((state) => state.address);

  return (
    <Layout title="Payments" address={address}>
      <Payments />
    </Layout>
  );
};

export default withAuth(PaymentsPage);