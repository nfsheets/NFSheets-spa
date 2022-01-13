import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Text,
} from "@chakra-ui/react";
import { ChangeEvent, useState } from "react";

const CellAttributesEditor = () => {
  const [fontSize, setFontSize] = useState(10);
  const [color, setColor] = useState("");
  const onChangeFontSize = (valueAsString: string, valueAsNumber: number) => {
    setFontSize(valueAsNumber);
  };

  const onChangeColor = (event: ChangeEvent<HTMLSelectElement>) => {
    setColor(event.target.value);
  };

  return (
    <>
      <Text mt="2">Font Size</Text>
      <NumberInput value={fontSize} onChange={onChangeFontSize}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

      <Text mt="2">Font Color</Text>
      <Select value={color} onChange={onChangeColor}>
        <option>Red </option>
        <option>Blue </option>
      </Select>
    </>
  );
};

export default CellAttributesEditor;
