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
import  { TCreateTransferFormSchemaValues,   TCreateSwapTransferInput,    TcreateSwapTransferFormSchema} from '../../validation'
import { useEffect, useContext } from 'react'

interface CreateTransferFormProps {
  
  disclosure: UseDisclosureReturn
  onSubmit: (data: { recipients: Array<CreateTransferInput> }) => void
  isLoading?: boolean
}

// This has a transfer form in which transfer inputs are submitted , from receipients and amount
// We set up a sort of form control for this thing here 
const CreateTransferForm: React.FC<CreateTransferFormProps> = ({ disclosure, onSubmit, isLoading }) => {
 
  const {
    register,
    control,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useFormContext<{ recipients: Array<CreateTransferInput> }>()



  const { fields, remove, append } = useFieldArray({
    control,
    name: 'recipients',
  })

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
                {...register(`recipients.${idx}.amount`)}
                id={`recipients.${idx}.amount`}
                step={0.01}
                precision={2}
                min={0}
                max={undefined}
                onChange={(x) => setValue(`recipients.${idx}.amount`, Number(x) || 0)}
                isReadOnly={isLoading}
              >
                <NumberInputField name={`recipients.${idx}.amount`} placeholder="0.00" />
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
                placeholder="Recipient"
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
     <Alert status="info">
  <AlertIcon />
  You&apos;re about to create a transaction and will have to confirm it with your currently connected wallet.
    </Alert>

      <Flex my={2}>
        <Button
          variant="secondary"
          {...(!isLoading && {
            onClick: disclosure.onClose,
          })}
          mr={2}
        >
          Cancel
        </Button>
        <Button variant="solid" onClick={handleSubmit(onSubmit)} isLoading={isLoading} isDisabled={isLoading}>
          Submit
        </Button>
      </Flex>
    </chakra.form>
  )
}

export default CreateTransferForm
