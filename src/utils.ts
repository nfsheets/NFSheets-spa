import Web3Modal from "web3modal";

import { ethers } from "ethers";
import nfsheetsArtifact from "./generated/NFSheets.json";

const { abi: nfsheetsAbi } = nfsheetsArtifact;

// Hardcoded for now
const NUM_ROWS = 1000;
const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

async function getWeb3Provider() {
  const web3Modal = new Web3Modal({
    providerOptions: {},
  });

  const instance = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(instance, "any");
  return provider;
}

function getNfsheetsContract(provider: ethers.providers.Web3Provider) {
  if (!process.env.REACT_APP_NFSHEETS_CONTRACT_ADDRESS) {
    throw new Error("Missing env var: `NFSHEETS_CONTRACT_ADDRESS`");
  }

  const nfsheetsContract = new ethers.Contract(
    process.env.REACT_APP_NFSHEETS_CONTRACT_ADDRESS,
    nfsheetsAbi,
    provider
  );

  const nfsheetsContractWithSigner = nfsheetsContract.connect(
    provider.getSigner()
  );

  return nfsheetsContractWithSigner;
}

function columnLetterToColumnNumber(columnLetter: string): number {
  return LETTERS.indexOf(columnLetter) + 1;
}

function cellIdToTokenId(column: string, row: number): number {
  const columnNumber = columnLetterToColumnNumber(column);
  return NUM_ROWS * (columnNumber - 1) + (row - 1) + 1;
}

export {
  getWeb3Provider,
  getNfsheetsContract,
  cellIdToTokenId,
  columnLetterToColumnNumber,
};
