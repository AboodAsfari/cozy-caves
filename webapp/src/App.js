import React from "react";
import { ThemeProvider, Box } from "@mui/material";
import { useLocation } from "react-router-dom";

import defaultTheme from "./themes/DarkTheme";
import Homepage from "./home/Homepage";
import MapPage from "./mapview/MapPage";
import Navbar from "./navbar/Navbar";
import Options from "./options/Options";
import DungeonBuilder from "@cozy-caves/dungeon-generation";


function App() {
  const [transitionPanelWidth, setTransitionPanelWidth] = React.useState(0);
  const transitionPanelWidthRef = React.useRef();
  transitionPanelWidthRef.current = transitionPanelWidth;
  const transitionOverCallback = React.useRef();
  const [intialRender, setIntialRender] = React.useState(true);

  const [dungeon, setDungeon ] = React.useState([]);
  const [mapSettings, setMapSettings] = React.useState({});
  const [activePage, setActivePage] = React.useState("home");

  const location = useLocation();

  React.useEffect(() => {
    const query = new URLSearchParams(location.search);
    const width = query.get("width");
    const height = query.get("height");
    const roomSize = query.get("roomSize");
    const totalCoverage = query.get("totalCoverage");
    const seed = query.get("seed");

    query.delete("width");
    query.delete("height");
    query.delete("roomSize");
    query.delete("totalCoverage");
    query.delete("seed");
    window.history.replaceState({}, "", `/`);

    if (parseInt(width) < 5 || parseInt(height) < 5 || parseInt(width) > 200 || parseInt(height) > 200) return;
    if (parseInt(roomSize) < 6 || parseInt(roomSize) > 15) return;
    if (parseInt(totalCoverage) < 0 || parseInt(totalCoverage) > 100) return;
    if (!seed) return;

    let newSettings = {
      width: parseInt(width),
      height: parseInt(height),
      roomSize: parseInt(roomSize),
      totalCoverage: parseInt(totalCoverage),
      seed
    };

    setMapSettings(newSettings);

    toggleTransitionPanel(() => {
      setMapSettings({
          preset: "Custom",
          seed: seed,
          width: width,
          height: height,
          roomSize: roomSize,
          totalCoverage: totalCoverage
      });

      setDungeon(new DungeonBuilder()
          .setSeed(seed.toString())
          .setSize(Number(width), Number(height))
          .setMinRoomSize(Number(roomSize))
          .setTotalCoverage(Number(totalCoverage))
          .build()
      );

      setActivePage("map");
      toggleTransitionPanel();
  });

// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

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