# Renderer

Syncs smart contract data to Google Sheets.

## Scripts

First, set environment variables in `.env` at the repository root.

- `npm run dev` to run the script using `ts-node`
- `npm run build` to compile the TypeScript
- `npm start` to run the compiled code in production with PM2 every minute

## Setting up Google APIs

1. Follow the instructions here to get a service account: https://isd-soft.com/tech_blog/accessing-google-apis-using-service-account-node-js/
1. Download JSON credentials for the service account and place the file at the repository root
1. Set the `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_FILE` environment variable to the filename of the credentials file
1. Create a new Google Sheet and share it with the service amount email address
1. Set the `NFSHEETS_GOOGLE_SHEET_ID` environment variable to the sheet id
