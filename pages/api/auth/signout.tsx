// pages/auth/signout.tsx
import { ComponentType, FC, useState, useEffect,useContext } from 'react';
import { signOut } from 'next-auth/react';

import { useRouter } from 'next/router';
import { Heading } from '@chakra-ui/react';

const SignOut = () => {
  const router = useRouter();

  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push('/');
    });
  }, [router]);

  return <Heading>Signing you out...</Heading>;
};

export default SignOut;
