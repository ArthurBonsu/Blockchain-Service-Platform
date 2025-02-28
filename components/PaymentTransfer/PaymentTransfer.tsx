import { chakra, Heading , Stack} from "@chakra-ui/react";

import { ethers } from 'ethers'
const hre = require("hardhat")
import { Button, ButtonProps, Flex, useDisclosure, AlertDialog,Alert,  AlertDialogBody,  AlertDialogCloseButton,  AlertDialogContent,
  AlertDialogFooter,  AlertDialogHeader,  AlertDialogOverlay,   UseDisclosureReturn, Select,FormErrorMessage, FormControl, FormLabel,
  NumberInput,NumberInputField, NumberIncrementStepper,NumberDecrementStepper,NumberInputStepper, Input,IconButton, AlertIcon, Grid,
    Box,  Text,  InputGroup,  InputRightAddon, FormHelperText,Wrap,  WrapItem, VisuallyHidden, VisuallyHiddenInput, Accordion,AccordionItem,AccordionButton,
    AccordionPanel, AccordionIcon } from '@chakra-ui/react'
    import { useRouter } from 'next/router'
import { ComponentType, FC, useContext } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri';
import { BsShieldFillCheck } from "react-icons/bs";
import { BiSearchAlt } from "react-icons/bi";
import {  createSwapFormSchema, createSwapTransferFormSchema,  } from '../../validation'

import { RiHeart2Fill } from "react-icons/ri";
import { PlusSmIcon, MinusSmIcon } from '@heroicons/react/outline'
import { useFormContext, useFieldArray ,useForm, Controller} from 'react-hook-form'
import { CreateSwapTransferInput, CreateTransferInput, SimpleTokenList } from 'types'
import supportedNetworkOptions from 'constants/supportedNetworkOptions'
//STORES
import { useSwapStore  } from 'stores/ContextStores/walletStore'
import { useEthersStore  } from 'stores/ethersStore'
import { useSafeStore  } from 'stores/safeStore'
import { useTransactionStore } from 'stores/transactionStore';
import { useUserStore  } from 'stores/userStore'
import {TransactionDisplayProps} from 'types/ethers'
import { Receipients  } from 'types/index'



//HOOKS
import  useEthers   from 'hooks/useEthers'
import  useFetch   from 'hooks/useFetch'
import  useLoadSafe   from 'hooks/useLoadSafe'


import useTransactions   from 'hooks/useTokenTransactions'

import getSafeInfo from 'hooks/useLoadSafe'
//Context 
import  useCrowdsourceContext   from 'context/useCrowdsourceContext'
import  useDaoContext   from 'context/useDaoContext'
import  useSwapContext   from 'context/useSwapContext'
import  useTransactionContext   from 'context/useTransactionContext'
import useTransferContext   from 'context/usegetAllTransactionsContext'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";


import React,{ useCallback, useState, useEffect } from 'react' 
import { motion } from 'framer-motion';
import Router from 'next/router'
import { useQuery } from 'react-query'
import queries from "services/queries";


// For finally making execution on the blockchain 



interface PaymentTransferProps  {
  username: string , 
  address:string, 
  amount:number , 
  comment:string ,
  timestamp?:Date, 
  receipient:string
  receipients:Array<string>,
  txhash?:string , 
  USDprice:number,
  paymenthash: string,
  owneraddress: string , 
  onPayTransfer: ()=> void
}

const pathname = "../SimpleTransfer";

const TransactionDisplay: React.FC<TransactionDisplayProps> = ({ account, username, paymenthash, receipients , contractowneraddress,  amount, usdPrice  }) => {
  return (
<Stack spacing={6}>
    <Box maxW='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
    <Heading as='h1' size='4xl' noOfLines={1}> View Payment Transaction of User : {account} From Here     </Heading>
   <br>
  <Text as='b'> Username</Text>
  <Text as='b'>{username}</Text>
  </br>

  <br>
  <Text as='b'> Payment Hash</Text>
  <Text as='b'>{paymenthash}</Text>
  </br>


  {receipients.map((item ,index) =>{

<>
    <Text as='b'> Receipient:  {index} </Text>
   <Text as='b'>First Token </Text>
 </>
   return item; } )

}
   <br>
  <Text as='b'> Owner Address  </Text>
  <Text as='b'>{contractowneraddress} </Text>
  </br>
 
  <>
  <Text as='b'>Amount of Tokens </Text>
  <Text as='b'>{amount} </Text>
  </>
  
  <>
  <Text as='b'>Price </Text>
  <Text as='b'>{usdPrice} </Text>
  </>
</Box>
    </Stack>
  )
 
}




   let myreceipient: string;
// This is for the execution
const PaymentTransfer = ({
  username, address,amount, comment,txhash, USDprice,  onPayTransfer, ...rest}:PaymentTransferProps
) => {



  const { transferobjectAArray, 
    fullpaymentx,
    fulltransfertx,
     sendPayment ,
     sendSimpleTransfer,
     transactionCount,
     connectWallet,   
     currentAccount,    
     sendTransaction,    
     PaymentformData,
     transferformData,   
     paymentTransactionReceipt,
     transferTransaction,       
     isPaid,
     tokenTxReceipt,
     transferredTokenAmount,
     paidTokenAmount,
     ourUSDPrice,
     accountsProvided,} = useTransactionContext();

    const router = useRouter();
    const localDisclosure = useDisclosure()
    const [paymentapproved, setPaymentApproved] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSwapping, setIsSwapping] = useState(true)
    const [isTyping, setIsTyping] = useState(true)  
    const [transaction,setTransaction] = useState('')
    const [token, setToken] = useState({})
    const [value, setValue] = useState('')
    const [_currentAccount, setCurrentAccount] = useState('')
    const [tokenchosen, setTokenChosen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);


    const [openMultiRecipient, setMultiReceipient] = useState(false); 
    const [paymentcompleted,  setPaymentcompleted] = useState(false);
 
    const schema = yup.object({

      username: yup.string().required(),
      address: yup.string().required(), 
      amount:yup.number().required(),
      comment: yup.string().required(),
      timestamp:yup.date().required(),
      receipient:yup.number().required(),
      receipients:yup.array().of(yup.string()).required(),
      txhash:yup.string().required(),
      USDprice:yup.number().required(),
      paymenthash:yup.string().required(),
    
  }).required();

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PaymentTransferProps>()
  const { fields, append, remove} = useFieldArray({
        
        name: 'receipients'
      },
       
 )

  
 const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    isTyping
    setValue(event.target.value);
    !isTyping
    // Logic of token conversion must be here
  
  } 

  useEffect(() => {
    onPayTransfer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PaymentformData.username, PaymentformData.contractaddress, PaymentformData.amount]);

  const onMultiReceipientOpen = () => {
    setMultiReceipient(!openMultiRecipient);
  }

  const onMoveToTransfer = () => {
    router.push(pathname);
  }

  return (
    <Grid placeItems="center" w="full" h="100vh">
      <Box w="500px" shadow="md" p="10" borderRadius="md" bg="gray.50">
        <Flex justifyContent="space-between" alignItems="center">
          <Text>The Paymet Transfer Solution</Text>
          <Button bg="blue.200" _hover={{ bg: 'blue.300' }} textColor="white" onClick={() => {
            onMultiReceipientOpen();
            append({})
          }}>
            Add Owners
          </Button>
        </Flex>
        <form onSubmit={handleSubmit(() => { onPayTransfer() })}>
          {Boolean(fields.length === 0) && <Text>Please add owners..</Text>}
          {fields.map((field, index) => (
            <InputGroup key={field.id} size="sm">
              <Input {...register(`receipients.${index}`, { required: true })} mb="5px" bg="white" />
              <InputRightAddon>
                <Text onClick={() => remove(index)} _hover={{ cursor: 'pointer' }}>
                  Remove
                </Text>
              </InputRightAddon>
            </InputGroup>
          ))}
          <Flex flexDirection="column" mt="20px">
            <FormControl>
              <FormLabel htmlFor="amount" fontWeight="normal">
                Other Relevant Information
                <Heading as="h2" fontSize="xl" mb={0}>
                  Make Payment Before Transferring Tokens 
                  The price is now at : {PaymentformData.USDprice} for 5 tokens
                </Heading> 
                <InputGroup>
                  <Input placeholder='username' {...register("username")} />
                  <InputRightAddon> </InputRightAddon>
                  <Input placeholder='address' size='sm' {...register("address")} />
                  <InputRightAddon> 0x...</InputRightAddon>
                  <Input placeholder='token amount' {...register("amount")} />
                  <InputRightAddon> +233</InputRightAddon>
                  <Input placeholder='comment' {...register("comment")} />
                  <InputRightAddon> +233</InputRightAddon> 
                  <Input type="datetime-local" placeholder='Select Date and Time' {...register("timestamp")} />
                  <InputRightAddon> +233</InputRightAddon>
                  <Text>  Price of Token To Be Transferred </Text> 
                </InputGroup>   
              </FormLabel>
            </FormControl>
          </Flex>
          <Button
            bg="blue.200"
            _hover={{ bg: 'blue.300' }}
            textColor="white"
            type="submit"
            w="full"
            mt="20px"
            isLoading={isSubmitting}
          >
            Create Safe
          </Button>
          {paymentcompleted ? 
  (<Button
    bg="blue.200"
    _hover={{ bg: 'blue.300' }}
    textColor="white"
    type="submit"
    w="full"
    mt="20px"
    onClick={onMoveToTransfer}
  >
    Move to Transfer
  </Button>) : null
}
      </form>
      <TransactionDisplay 
        account = {currentAccount}
        username = {PaymentformData.username || 'Nothing yet'}
        paymenthash = {PaymentformData.paymenthash || 'Nothing yet'}
        receipients= {PaymentformData.receipients || ['Nothing yet']}
        contractowneraddress= {PaymentformData.owneraddress || 'Nothing yet'}
        amount ={Number(PaymentformData.amount) || 0}
        usdPrice = {Number(PaymentformData.USDprice) || 0}
      />
    </Box>
  </Grid>
);
};

export default PaymentTransfer;