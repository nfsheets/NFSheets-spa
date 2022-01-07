import { Box, Text } from "@chakra-ui/layout";
import {
  Button,
  Select,
  Input,
  PinInput,
  PinInputField,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";

export default function CellEditor() {
  const [value, setValue] = useState("");
  const [fontSize, setFontSize] = useState<number>(10);
  const [fontColor, setFontColor] = useState("");

  const [cellCol, setCellCol] = useState("");
  const [cellRow, setCellRow] = useState<number>(0);

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleFontSizeChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => {
    setFontSize(valueAsNumber);
  };

  const handleFontColorChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFontColor(event.target.value);
  };

  const handleColChange = (eventString: string) => {
    setCellCol(eventString);
  };

  const handleRowChange = (eventString: string) => {
    setCellRow(Number(eventString));
  };

  return (
    <Box
      display="inline-block"
      verticalAlign="top"
      w="20vw"
      bg="white"
      boxShadow="md"
      py="4"
    >
      <Box mx="8">
        <Text my="1"> Select a cell</Text>
        <PinInput onChange={handleColChange} type="alphanumeric">
          <PinInputField />
        </PinInput>
        <PinInput onChange={handleRowChange} type="number">
          <PinInputField />
        </PinInput>
      </Box>

      <Box fontSize="md" textAlign="left" mx="8">
        <Text mt="2">Cell value</Text>
        <Input value={value} onChange={handleValueChange} />

        <Text mt="2">Font Size</Text>
        <NumberInput value={fontSize} onChange={handleFontSizeChange}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>

        <Text mt="2">Font Color</Text>
        <Select value={fontColor} onChange={handleFontColorChange}>
          <option>Red </option>
          <option>Blue </option>
        </Select>
      </Box>
      <Button mt="4" colorScheme="linkedin">
        Submit changes
      </Button>
    </Box>
  );
}
