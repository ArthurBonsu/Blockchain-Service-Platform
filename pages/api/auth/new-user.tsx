// pages/auth/verify-request.tsx
import { FC,useState, useEffect, useContext } from 'react';
import { Heading, Text } from '@chakra-ui/react';

const VerifyRequest = () => {
  return (
    <div>
      <Heading>Check Your Email</Heading>
      <Text>A verification email has been sent to your email address. Please check your inbox.</Text>
    </div>
  );
};

export default VerifyRequest;