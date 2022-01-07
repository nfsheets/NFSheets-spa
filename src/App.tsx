import React from "react";
import logo from "./logo.svg";
import "./App.css";
import SheetService from "./services/sheet-service";

function App() {
  const getSheetValues = async () => {
    const values = await SheetService.getGoogleSheetValues();
  };

  return (
    <div className="App">
      <iframe
        width={800}
        height={800}
        src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQAZspYrhIxKEHM5ajmQ-iTS99ikcPcMlRQfMy28zQjCo3a6QIYwFLXXl3zDE-L8_eFve5K5vOnXBOG/pubhtml?widget=true&amp;headers=false"
      ></iframe>

      <div>
        <div> sheet set up </div>
        <button onClick={getSheetValues}> get sheet values </button>
      </div>
    </div>
  );
}

export default App;
