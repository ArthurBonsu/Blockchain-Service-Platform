// @components/Footer.tsx
import React, { useEffect, useState , useContext} from "react";
import {
  Heading,
  Stack,
  Image,
  Link,
  Flex,
  Center,
  Text,
  Divider,
} from "@chakra-ui/react";
import { BiCopyright } from "react-icons/bi";
import logo from "../../images/blockdaologo.png";
import { BsGithub, BsTwitter } from "react-icons/bs";
import { Icon } from "@chakra-ui/icons";

interface FooterProps {
  message: string;
  community: string;
  copyright: string;
  blog: string;
  FAQ: string;
  Contact: string;
  githubUrl: string;
  twitterUrl: string;
  discordUrl: string;
}

const Footer: React.FC<FooterProps> = ({
  community,
  blog,
  FAQ,
  Contact,
  githubUrl,
  twitterUrl,
  discordUrl,
  copyright,
  message,
}) => {
  return (
    <Flex
      className="gradient-bg-footer"
      direction="column"
      align="center"
      justify="center"
      py={4}
    >
      <Flex justify="space-between" align="center" w="full">
        <Flex align="center">
          <Link href={githubUrl}>
            <Icon as={BsGithub} />
          </Link>
          <Link href={discordUrl}>
            <Icon as={BsTwitter} />
          </Link>
        </Flex>
        <Flex justify="evenly" align="center" flexWrap="wrap" w="full">
          <Text className="text-white text-base text-center mx-2 cursor-pointer">
            {community}
          </Text>
          <Text className="text-white text-base text-center mx-2 cursor-pointer">
            {blog}
          </Text>
          <Text className="text-white text-base text-center mx-2 cursor-pointer">
            {FAQ}
          </Text>
        </Flex>
      </Flex>
      <Flex direction="column" align="center" justify="center" mt={5}>
        <Text className="text-white text-sm text-center">{message}</Text>
        <Text className="text-white text-sm text-center font-medium mt-2">
          {Contact}
        </Text>
      </Flex>
      <Divider w="90%" h="0.25px" bg="gray.400" mt={5} />
      <Flex justify="space-between" align="center" w="full" mt={3}>
        <Text className="text-white text-left text-xs">{Contact}</Text>
        <Text className="text-white text-right text-xs">
          {copyright} <BiCopyright />
        </Text>
      </Flex>
    </Flex>
  );
};

export default Footer;