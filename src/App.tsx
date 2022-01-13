import { Box, Center, Flex, Heading, Link, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

import CellEditor from "./components/CellEditor";
import NavBar from "./components/NavBar";
import Web3Context from "./context/Web3Context";

import "./App.css";

function App() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [nfsheetsContract, setNfsheetsContract] = useState<ethers.Contract>();
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState<number>();

  useEffect(() => {
    provider
      ?.getSigner()
      .getAddress()
      .then((address) => {
        setAddress(address);
      });

    provider?.getNetwork().then(({ chainId }) => {
      setChainId(chainId);
    });

    // Automatically refresh on network change
    // https://docs.ethers.io/v5/concepts/best-practices/
    provider?.on("network", (_, oldNetwork) => {
      if (oldNetwork) {
        window.location.reload();
      }
    });
  }, [provider]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        setProvider,
        nfsheetsContract,
        setNfsheetsContract,
        address,
        setAddress,
        chainId,
        setChainId,
      }}
    >
      <Helmet>
        <title>NFSheets</title>
      </Helmet>
      <Box w="100%" h="100%" bg="gray.100">
        <NavBar />
        <Flex w="100%" mt={3} mb={6} flexWrap="wrap">
          <Box flex={1} mr={3} minWidth={["100%", "unset"]} p={3}>
            <iframe
              title="The collaborative blockchain spreadsheet"
              style={{
                display: "block",
                boxShadow:
                  "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              }}
              width="100%"
              height={500}
              src={`https://docs.google.com/spreadsheets/d/${process.env.REACT_APP_NFSHEETS_GOOGLE_SHEET_ID}/edit#gid=0`}
            ></iframe>
          </Box>
          <Box my={3} pr={3} width={["100%", "450px"]} pt={[3, 0]}>
            <CellEditor width="100%" />
          </Box>
        </Flex>
        <Center p={6} pb={10} textAlign="center">
          <Box maxWidth={["100%", "50%"]}>
            <Heading pb={4}>About</Heading>
            <Text textAlign="left">
              We're creating a spreadsheet collaboratively on the blockchain.
              Anyone can mint a cell and set its value. Our backend syncs data
              from the blockchain to Google Sheets.
              <br />
              <br />
              Each cell is also an ERC-721 NFT, and the NFT image is dynamically
              updated when a token owner sets a new cell value.
              <br />
              <br />
              You can also{" "}
              <Link href="https://github.com/nfsheets/nfsheets" color="blue">
                view the source code on Github
              </Link>
              .
            </Text>
          </Box>
        </Center>
      </Box>
    </Web3Context.Provider>
  );
}

export default App;
