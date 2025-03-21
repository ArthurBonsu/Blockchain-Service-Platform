import {
  Alert,
  AlertIcon,
  Button,
  chakra,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  UseDisclosureReturn,
  IconButton,
} from '@chakra-ui/react'
import { PlusSmIcon, MinusSmIcon } from '@heroicons/react/outline'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { CreateTransferInput } from 'types'
import supportedNetworkOptions from 'constants/supportedNetworkOptions'
import { useEffect } from 'react'
import { useTransactionStore } from 'stores/transactionStore';

interface CreateTransferFormProps {
  disclosure: UseDisclosureReturn
  onSubmit: (data: { recipients: Array<CreateTransferInput> }) => void
  isLoading?: boolean
}

// Form component for creating transfers with multiple recipients
const CreateTransferForm: React.FC<CreateTransferFormProps> = ({ disclosure, onSubmit, isLoading }) => {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    handleSubmit,
    reset
  } = useFormContext<{ recipients: Array<CreateTransferInput> }>()

  const { transaction } = useTransactionStore();

  // Use fieldArray to handle dynamic recipient inputs
  const { fields, remove, append } = useFieldArray({
    control,
    name: 'recipients',
  })

  // If a transaction exists in the store, pre-fill the first recipient
  useEffect(() => {
    if (transaction && fields.length === 0) {
      append({
        amount: transaction.amount,
        asset: 'ETH', // Default asset
        recipient: transaction.receipient,
      });
    }
  }, [transaction, fields.length, append]);

  return (
    <chakra.form py={2}>
      {fields.map((f, idx) => {
        const recipients = errors.recipients || [];
        const assetError = recipients[idx]?.asset;
        const amountError = recipients[idx]?.amount;
        const recipientError = recipients[idx]?.recipient;
        const isLastItem = fields.length - 1 === idx;
        
        return (
          <Flex flexDirection="row" py={4} key={f.id}>
            <FormControl w="150px" id={`recipients.${idx}.asset`} isInvalid={!!assetError?.message} mx={2}>
              <FormLabel>Asset</FormLabel>
                      
              <Select {...register(`recipients.${idx}.asset`)} placeholder="Select option" isReadOnly={isLoading}>
                {supportedNetworkOptions.map((sno) => (
                  <option key={sno.symbol} value={sno.symbol}>
                    {sno.symbol}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{assetError?.message}</FormErrorMessage>
            </FormControl> 
            
            <FormControl id="amount" w="150px" isInvalid={!!amountError?.message} mx={2}>
              <FormLabel htmlFor="amount">Amount</FormLabel>
              <NumberInput
                id={`recipients.${idx}.amount`}
                step={0.01}
                precision={2}
                min={0}
                max={undefined}
                onChange={(x) => setValue(`recipients.${idx}.amount`, Number(x) || 0)}
                isReadOnly={isLoading}
                value={f.amount}
              >
                <NumberInputField 
                  {...register(`recipients.${idx}.amount`)} 
                  placeholder="0.00" 
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{amountError?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl id={`recipients.${idx}.recipient`} flex="1" isInvalid={!!recipientError?.message} mx={2}>
              <FormLabel>Recipient</FormLabel>
              <Input
                id={`recipients.${idx}.recipient`}
                placeholder="Recipient address"
                {...register(`recipients.${idx}.recipient`)}
                isReadOnly={isLoading}
              />
              <FormErrorMessage>{recipientError?.message}</FormErrorMessage>
            </FormControl>
            
            <IconButton
              mt={8}
              isDisabled={isLoading}
              cursor="pointer"
              as={isLastItem ? PlusSmIcon : MinusSmIcon}
              aria-label={isLastItem ? 'Add recipient' : 'Remove recipient'}
              onClick={() => {
                if (isLastItem) {
                  append({
                    amount: 0,
                    asset: 'ETH',
                    recipient: '',
                  })
                } else {
                  remove(idx)
                }
              }}
            />
          </Flex>
        )
      })}
      
      <Alert status="info" mt={4}>
        <AlertIcon />
        You&apos;re about to create a transaction and will have to confirm it with your currently connected wallet.
      </Alert>

      <Flex my={4} justifyContent="space-between">
        <Button
          variant="outline"
          {...(!isLoading && {
            onClick: disclosure.onClose,
          })}
        >
          Cancel
        </Button>
        <Button 
          colorScheme="blue"
          onClick={handleSubmit(onSubmit)} 
          isLoading={isLoading} 
          isDisabled={isLoading}
        >
          Submit
        </Button>
      </Flex>
    </chakra.form>
  )
}

export default CreateTransferForm