import { Box, Text } from "@chakra-ui/layout";

export default function NavBar() {
  return (
    <Box w={"100vw"} bg="white" boxShadow="md" py={"3"} px="5" textAlign="left">
      <Text fontSize="lg">NFSheets</Text>
    </Box>
  );
}
