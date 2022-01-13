import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  PinInput,
  PinInputField,
  Text,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { debounce } from "lodash";
import React, {
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import Web3Context from "../context/Web3Context";
import { cellIdToTokenId, columnLetterToColumnNumber } from "../utils";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CellEditor: React.FC<React.ComponentProps<typeof Box>> = (props) => {
  const { provider, nfsheetsContract, address, chainId } =
    useContext(Web3Context);

  const [value, setValue] = useState("");
  const [column, setColumn] = useState("");
  const [row, setRow] = useState<number>();
  const [owner, setOwner] = useState("");
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [price, setPrice] = useState<BigNumber>();
  const [loadingTransaction, setLoadingTransaction] = useState(false);

  useEffect(() => {
    if (nfsheetsContract) {
      nfsheetsContract
        .getPrice()
        .then((newPrice: BigNumber) => setPrice(newPrice));
    }
  }, [nfsheetsContract]);

  const getOwner = useCallback(
    debounce(async (column: string, row: number) => {
      const tokenId = cellIdToTokenId(column, row);
      if (nfsheetsContract) {
        try {
          const newOwner = await nfsheetsContract.ownerOf(
            BigNumber.from(tokenId)
          );
          const newValue = await nfsheetsContract.getValue(
            BigNumber.from(tokenId)
          );
          setOwner(newOwner);
          setValue(newValue);
          setLoadingOwner(false);
        } catch (err) {
          const maybeMessage = (err as any)?.data?.message;
          if (
            maybeMessage?.includes("ERC721: owner query for nonexistent token")
          ) {
            setOwner(ZERO_ADDRESS);
          } else {
            setOwner("");
          }
          setValue("");
          setLoadingOwner(false);
        }
      }
    }, 1000),
    [setOwner, nfsheetsContract]
  );

  useEffect(() => {
    if (column.length === 1 && typeof row !== "undefined") {
      setLoadingOwner(true);

      getOwner(column, row);
    }
  }, [column, row, getOwner]);

  const onChangeValue = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const onChangeColumn = (value: string) => {
    value = value.toUpperCase();
    if (/[A-Z]/.test(value)) {
      setColumn(value);
    } else if (value === "") {
      setColumn("");
    }
  };

  const onChangeRow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newRow = Number(value);
    if (newRow >= 1 && newRow <= 1000) {
      setRow(newRow);
    } else if (value === "") {
      setRow(undefined);
    }
  };
  let buttonMessage = "Loading...";
  let disabled;
  let buttonOnClick = () => {};
  if (parseInt(process.env.REACT_APP_CHAIN_ID ?? "", 10) !== chainId) {
    buttonMessage = "Wrong Network";
    disabled = true;
  } else if (column === "") {
    buttonMessage = "Enter Column";
    disabled = true;
  } else if (typeof row === "undefined") {
    buttonMessage = "Enter Row";
    disabled = true;
  } else if (!provider) {
    buttonMessage = "Wallet Not Connected";
    disabled = true;
  } else if (loadingOwner) {
    buttonMessage = "Checking Availability...";
    disabled = true;
  } else if (loadingTransaction) {
    buttonMessage = "Sending Transaction...";
    disabled = true;
  } else if (owner === address) {
    buttonMessage = "Update Cell";
    buttonOnClick = async () => {
      setLoadingTransaction(true);
      try {
        const tokenId = cellIdToTokenId(column, row);
        if (nfsheetsContract) {
          await nfsheetsContract.setValue(tokenId, value);
        }
      } finally {
        setLoadingTransaction(false);
      }
    };
  } else if (owner === ZERO_ADDRESS) {
    buttonMessage = "Mint Cell";
    buttonOnClick = async () => {
      setLoadingTransaction(true);
      try {
        if (nfsheetsContract) {
          const columnNumber = columnLetterToColumnNumber(column);
          await nfsheetsContract.mint(columnNumber, row, value, {
            value: price,
          });
        }
      } finally {
        setLoadingTransaction(false);
      }
    };
  } else {
    buttonMessage = "Already Owned";
    disabled = true;
  }

  return (
    <Flex
      bg="white"
      boxShadow="md"
      py="4"
      flexDirection="column"
      alignItems="center"
      {...props}
    >
      <Heading pb={3}>Mint / Update</Heading>
      <Box mx="8">
        <Text my="1">Enter a cell (e.g. B5)</Text>
        <Flex>
          <PinInput
            value={column}
            onChange={onChangeColumn}
            type="alphanumeric"
            placeholder="A"
            size="lg"
          >
            <PinInputField />
          </PinInput>
          <Input
            value={row}
            onChange={onChangeRow}
            type="number"
            placeholder="1 – 1000"
            ml={1}
            min={1}
            max={1000}
            size="lg"
            textAlign="center"
          />
        </Flex>
      </Box>

      <Flex fontSize="md" mx={6} alignItems="center" flexDirection="column">
        <Text mt="2">Cell Value</Text>
        <Input
          value={value}
          onChange={onChangeValue}
          placeholder="=1+1"
          disabled={disabled}
          width="100%"
          size="lg"
        />
        <Button
          mt="4"
          onClick={buttonOnClick}
          disabled={disabled}
          colorScheme="green"
          size="lg"
        >
          {buttonMessage}
        </Button>
      </Flex>
    </Flex>
  );
};

export default CellEditor;
