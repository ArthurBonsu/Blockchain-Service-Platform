// pages/swap/index.tsx
import { withAuth } from '@/utils/withAuth';
import Layout from '@/components/Layout';
import SwapComponent from '@/components/SwapComponent';
import { useEthersStore } from '@/stores/ethersStore';
import CrowdSource from './crowdSource';

const PaymentsPage = () => {
  const address = useEthersStore((state) => state.address);

  return (
    <Layout title="Payments" address={address}>
      <Payments />
    </Layout>
  );
};

export default withAuth(PaymentsPage);