import React from "react";

import { ThemeProvider } from "@mui/material";

import defaultTheme from "./themes/DarkTheme";
import Homepage from "./home/Homepage";
import MapPage from "./mapview/MapPage";
import Navbar from "./navbar/Navbar";

function App() {

  const [activePage, setActivePage] = React.useState("home");

  const getPageHeader = () => {
    return (
      <Navbar activePage={activePage} setActivePage={setActivePage}/>
    );
  }

  const getPage = () => {
    if (activePage === "home") {
      return <Homepage setActivePage={setActivePage}/>;
    }
    if (activePage === "map") {
      return <MapPage />;
    }
    return null;
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      {getPageHeader()}
      {getPage()}
    </ThemeProvider>
  );
}

export default App;