import { Flex, Heading, Spacer } from "@chakra-ui/layout";
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
      <Heading fontSize="xl">NFSheets</Heading>
      <Spacer />
      <ConnectButton />
    </Flex>
  );
}
