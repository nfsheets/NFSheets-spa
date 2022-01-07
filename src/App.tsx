import React from "react";
import logo from "./logo.svg";
import "./App.css";
import SheetService from "./services/sheet-service";
import NavBar from "./components/nav-bar/nav-bar";
import CellEditor from "./components/cell-editor/cell-editor";
import { Box } from "@chakra-ui/react";

function App() {
  const getSheetValues = async () => {
    const values = await SheetService.getGoogleSheetValues();
  };

  return (
    <Box textAlign="center" h="100vh" w="100vw" bg="gray.100">
      <NavBar />
      <Box textAlign="center" w="100vw" my="6">
        <iframe
          style={{
            display: "inline-block",
            verticalAlign: "top",
            margin: "0 16px",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          }}
          width={"70%"}
          height={500}
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQAZspYrhIxKEHM5ajmQ-iTS99ikcPcMlRQfMy28zQjCo3a6QIYwFLXXl3zDE-L8_eFve5K5vOnXBOG/pubhtml?gid=0&amp;single=true&amp;chrome=false&amp;widget=false&amp;headers=true"
        ></iframe>

        <CellEditor />
      </Box>

      {/* <div>
        <div> sheet set up </div>
        <button onClick={getSheetValues}> get sheet values </button>
      </div> */}
    </Box>
  );
}

export default App;
