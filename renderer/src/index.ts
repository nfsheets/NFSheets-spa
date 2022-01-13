import { BigNumber, ethers } from "ethers";
import fs from "fs";
import { google, sheets_v4 } from "googleapis";
import path from "path";

import { abi as nfsheetsAbi } from "../../generated/NFSheets.json";

require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

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
type GoogleSheetsRequests = sheets_v4.Schema$Request[];

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

function tokenIdToCellId(tokenId: number): string {
  const row = ((tokenId - 1) % NUM_ROWS) + 1;
  const column = Math.floor((tokenId - 1) / NUM_ROWS) + 1;

  return `${LETTERS[column - 1]}${row}`;
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
): [GoogleSheetsData, GoogleSheetsRequests] {
  const data: GoogleSheetsData = [];
  const { tokenIds, values } = contractData;
  for (let i = 0; i < tokenIds.length; i += 1) {
    const tokenId = tokenIds[i];
    const value = values[i];

    data.push({
      range: `Sheet1!${tokenIdToCellId(tokenId.toNumber())}`,
      values: [[value]],
    });
  }

  // Create requests to turn the background color of all purchased cells to gray
  const requests: GoogleSheetsRequests = [];
  for (let i = 0; i < tokenIds.length; i += 1) {
    const tokenId = tokenIds[i].toNumber();
    const row = ((tokenId - 1) % NUM_ROWS) + 1;
    const column = Math.floor((tokenId - 1) / NUM_ROWS) + 1;

    requests.push({
      updateCells: {
        range: {
          sheetId: 0,
          startColumnIndex: column - 1,
          endColumnIndex: column,
          startRowIndex: row - 1,
          endRowIndex: row,
        },
        fields: "userEnteredFormat(backgroundColor)",
        rows: [
          {
            values: [
              {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 15,
                    green: 15,
                    blue: 15,
                  },
                },
              },
            ],
          },
        ],
      },
    });
  }

  return [data, requests];
}

async function syncDataToGoogleSheets(
  googleSheetsData: GoogleSheetsData,
  googleSheetsRequests: GoogleSheetsRequests
) {
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.NFSHEETS_GOOGLE_SHEET_ID,
      requestBody: {
        requests: googleSheetsRequests,
      },
    });

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
    const [googleSheetsData, googleSheetsRequests] =
      convertContractDataToGoogleSheetsData(contractData);

    if (googleSheetsData.length === 0 && googleSheetsRequests.length === 0) {
      console.log("No data to sync, skipping this run!");
    } else {
      await syncDataToGoogleSheets(googleSheetsData, googleSheetsRequests);
      console.log("Synced!");
    }
  } catch (err) {
    console.error(err);
  }
}

main();
