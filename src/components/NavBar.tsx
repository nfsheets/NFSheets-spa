import { Flex, Heading, Icon, Link, Spacer } from "@chakra-ui/react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import ConnectButton from "./ConnectButton";

export default function NavBar() {
  return (
    <Flex
      w={"100vw"}
      bg="white"
      boxShadow="md"
      py={4}
      px={5}
      textAlign="left"
      alignItems="center"
    >
      <Heading fontSize="xl">NFSheet.com</Heading>
      <Spacer />
      <Link mx={5} href="https://discord.com/invite/BEbJVRpz">
        <Icon
          as={FaDiscord}
          h={6}
          w={6}
          color="green.500"
          _hover={{
            color: "green.600",
          }}
        />
      </Link>
      <Link mx={5} href="https://twitter.com/nfsheets">
        <Icon
          as={FaTwitter}
          h={6}
          w={6}
          color="green.500"
          _hover={{
            color: "green.600",
          }}
        />
      </Link>
      <ConnectButton ml={5} />
    </Flex>
  );
}
