import React from "react";

import { ThemeProvider, Box } from "@mui/material";

import defaultTheme from "./themes/DarkTheme";
import Homepage from "./home/Homepage";
import MapPage from "./mapview/MapPage";
import Navbar from "./navbar/Navbar";
import Options from "./options/Options";


function App() {
  const [transitionPanelWidth, setTransitionPanelWidth] = React.useState(0);
  const transitionPanelWidthRef = React.useRef();
  transitionPanelWidthRef.current = transitionPanelWidth;
  const transitionOverCallback = React.useRef();
  const [intialRender, setIntialRender] = React.useState(true);

  const [dungeon, setDungeon ] = React.useState([]);
  const [mapSettings, setMapSettings] = React.useState({});
  const [activePage, setActivePage] = React.useState("home");

  const getPageHeader = () => {
    return (
      <Navbar activePage={activePage} setActivePage={setActivePage} setIntialRender={setIntialRender} toggleTransitionPanel={toggleTransitionPanel} />
    );
  }

  const getPage = () => {
    if (activePage === "home" || activePage === "options") return <Homepage setActivePage={setActivePage}/>;
    if (activePage === "map") {
      return <MapPage dungeon={dungeon} setDungeon={setDungeon} mapSettings={mapSettings} 
        setMapSettings={setMapSettings} intialRender={intialRender} setIntialRender={setIntialRender} />;
    }
    return null;
  }

  const toggleTransitionPanel = (callback) => {
    if (callback) transitionOverCallback.current = callback;
    setTransitionPanelWidth(transitionPanelWidthRef.current === 0 ? 100 : 0);
  }

  const handleTransitionOver = () => {
    if (transitionOverCallback.current) requestAnimationFrame(transitionOverCallback.current);
    transitionOverCallback.current = null;
  }

  return (
    <Box id="app">
      <ThemeProvider theme={defaultTheme}>
        {getPageHeader()}
        {getPage()}
        <Options setActivePage={setActivePage} setDungeon={setDungeon} setMapSettings={setMapSettings} open={activePage === "options"} toggleTransitionPanel={toggleTransitionPanel} />
      </ThemeProvider>

      <Box id="transition-panel" className={transitionPanelWidth === 0 ? "hidden-transition-panel" : "visible-transition-panel"} 
        sx={{ width: transitionPanelWidth + "%" }} onTransitionEnd={handleTransitionOver} />
    </Box>
  );
}

export default App;