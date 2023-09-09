import React from "react";

import { ThemeProvider, Container, Box } from "@mui/material";

import defaultTheme from "./themes/DarkTheme";
import Homepage from "./home/Homepage";
import MapPage from "./mapview/MapPage";
import Navbar from "./navbar/Navbar";
import Options from "./options/Options";


function App() {
  
  const [dungeon, setDungeon ] = React.useState([]);
  const [mapSettings, setMapSettings] = React.useState({});
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
      return <MapPage dungeon={dungeon} setDungeon={setDungeon} mapSettings={mapSettings} setMapSettings={setMapSettings} />;
    }
    if (activePage === "options") {
      return <Options setActivePage={setActivePage} setDungeon={setDungeon} setMapSettings={setMapSettings} />;
    }
    return null;
  }

  return (
    <Box id="app">
      <ThemeProvider theme={defaultTheme}>
        {getPageHeader()}
        {getPage()}
      </ThemeProvider>
    </Box>
  );
}

export default App;