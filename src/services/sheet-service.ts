import axios from "axios";

const sheetId = "1v8-OmiTqEMG5EmUJlLxaU3YLC2JsgZDrIZgHuh-gYx0";

const sheetRange = "A1:F6";

export default {
  async getGoogleSheetValues() {
    console.log("GETTING GS values");
    // https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
    // we need to verify our google identity
    const resp = await axios.get(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}`
    );

    console.log("resp");
    console.log(resp);
  },
};
