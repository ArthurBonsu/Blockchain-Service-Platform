import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  UseDisclosureReturn,
} from '@chakra-ui/react';
import { PropsWithChildren, useEffect, useState } from 'react';

interface AppModalProps extends PropsWithChildren {
  disclosure: UseDisclosureReturn;
  title?: string;
  closeOnOverlayClick?: boolean;
  modalSize?: ModalProps['size'];
  bodymessage?: string;
}

const AppModal: React.FC<PropsWithChildren<AppModalProps>> = ({
  disclosure,
  title,
  modalSize = '4xl',
  bodymessage,
  closeOnOverlayClick = true,
  children,
  ...rest
}) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsBrowser(true);
    }
  }, []);

  if (!isBrowser) return null;

  return (
    <Modal
      onClose={disclosure.onClose}
      isOpen={disclosure.isOpen}
      size={modalSize}
      closeOnOverlayClick={closeOnOverlayClick}
      {...rest}
    >
      <ModalOverlay />
      <ModalContent>
        {title && <ModalHeader>{title}</ModalHeader>}
        <ModalCloseButton />
        <ModalBody>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AppModal;