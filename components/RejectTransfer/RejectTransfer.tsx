import { Button, ButtonProps, useDisclosure } from '@chakra-ui/react';
import AppAlertDialog from '@components/AppAlertDialog';
import useLoadSafe from 'hooks/useLoadSafe';
import React, { FC, useEffect,  useCallback, useState, useContext } from 'react';
import { PaymentTransactions } from "types";


interface RejectTransferProps extends ButtonProps {
  transaction: PaymentTransactions;
  safeAddress: string;
  userAddress: string;
}

const RejectTransfer: FC<RejectTransferProps> = ({
  transaction,
  safeAddress,
  userAddress,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const localDisclosure = useDisclosure();
  const { rejectTransfer, ...rest } = useLoadSafe({ safeAddress, userAddress });

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    await rejectTransfer(transaction);
    setIsLoading(false);
    localDisclosure.onClose();
    }, [rejectTransfer, transaction, localDisclosure]);

  return (
    <>
      <Button colorScheme="red" onClick={localDisclosure.onOpen} {...props}>
        Reject
      </Button>
      <AppAlertDialog
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        header="Reject Transaction"
        body="This action will reject this transaction. A separate Transaction will be performed to submit the rejection."
        disclosure={localDisclosure}
        customOnClose={() => {
          localDisclosure.onClose();
          setIsLoading(false);
        }}
      />
    </>
  );
};

export default RejectTransfer;