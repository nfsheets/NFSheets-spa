import { BigNumber, ethers } from "ethers";
import fs from "fs";
import { google, sheets_v4 } from "googleapis";
import path from "path";

import { abi as nfsheetsAbi } from "../../generated/NFSheets.json";

if (!process.env.NFSHEETS_CONTRACT_ADDRESS) {
  throw new Error("Missing env var: `NFSHEETS_CONTRACT_ADDRESS`");
}
if (!process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_FILE) {
  throw new Error("Missing env var: `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_FILE`");
}

const serviceAccountCredentials = JSON.parse(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "..",
      "..",
      process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_FILE
    ),
    "utf8"
  )
);

type ContractData = {
  tokenIds: BigNumber[];
  values: string[];
};
type GoogleSheetsData = sheets_v4.Schema$ValueRange[];

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
const googleApiAuth = new google.auth.JWT({
  email: serviceAccountCredentials.client_email,
  key: serviceAccountCredentials.private_key,
  keyId: serviceAccountCredentials.private_key_id,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({
  version: "v4",
  auth: googleApiAuth,
});

const nfsheetsContract = new ethers.Contract(
  process.env.NFSHEETS_CONTRACT_ADDRESS,
  nfsheetsAbi,
  provider
);

function tokenIdToCellId(tokenId: number): string {
  // Hardcoded for now
  const NUM_ROWS = 1000;
  const letters = [
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
  const row = ((tokenId - 1) % NUM_ROWS) + 1;
  const column = Math.floor((tokenId - 1) / NUM_ROWS) + 1;

  return `${letters[column - 1]}${row}`;
}

async function readContractData(): Promise<ContractData> {
  const totalSupply = await nfsheetsContract.totalSupply();

  const [tokenIds, values] = await nfsheetsContract.getValuesRange(
    BigNumber.from(0),
    totalSupply
  );

  return {
    tokenIds,
    values,
  };
}

function convertContractDataToGoogleSheetsData(
  contractData: ContractData
): GoogleSheetsData {
  const data = [];
  const { tokenIds, values } = contractData;
  for (let i = 0; i < tokenIds.length; i += 1) {
    const tokenId = tokenIds[i];
    const value = values[i];

    data.push({
      range: `Sheet1!${tokenIdToCellId(tokenId.toNumber())}`,
      values: [[value]],
    });
  }
  return data;
}

async function syncDataToGoogleSheets(googleSheetsData: GoogleSheetsData) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.batchUpdate(
      {
        spreadsheetId: process.env.NFSHEETS_GOOGLE_SHEET_ID,
        requestBody: {
          data: googleSheetsData,
          valueInputOption: "USER_ENTERED",
        },
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
}

async function main() {
  try {
    console.log("Starting sync...");
    const contractData = await readContractData();
    const googleSheetsData =
      convertContractDataToGoogleSheetsData(contractData);
    await syncDataToGoogleSheets(googleSheetsData);
    console.log("Synced!");
  } catch (err) {
    console.error(err);
  }
}

main();
