import React from "react";
import { 
  AppBar,
  Stack,
  Box,
} from "@mui/material";
import "./styles/App.css";
import "./styles/MenuBar.css";

import GridTile from "./GridTile";
import { Point } from "@cozy-caves/utils";
import Tools from "./Tools";

import MenuBar from "./Toolbar/MenuBar";

const Layout = require("@cozy-caves/room-generation").Layout;

const App = () => {
  const gridSize = new Point(10, 8);
  const layout = React.useRef(new Layout()).current;
  const [tileMap, setTileMap] = React.useState({});
  const [currTool, setCurrTool] = React.useState(Tools.PEN);
  const [primaryBrush, setPrimaryBrush] = React.useState("floor");
  const [secondaryBrush, setSecondaryBrush] = React.useState("wall");
  const [fillBrush, setFillBrush] = React.useState("floor");
  const [dragButton, setDragButton] = React.useState(-1);
  const [selectStart, setSelectStart] = React.useState(new Point(-1, -1));
  const [selectEnd, setSelectEnd] = React.useState(new Point(-1, -1));

  React.useEffect(() => {
    document.addEventListener("mouseup", handleMouse, []);
    document.addEventListener("keydown", handleKeyDown, []);

    return () => {
      document.removeEventListener("mouseup", handleMouse, []);
    }
  });

  const handleMouse = () => {
    setDragButton(-1);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Delete") {
      // u are here
    }
  }

  const changeTool = (tool) => {
    setSelectStart(new Point(-1, -1));
    setSelectEnd(new Point(-1, -1));
    setCurrTool(tool);
  }

  const isInSelection = (pos) => {
    let minPoint = new Point(Math.min(selectStart.getX(), selectEnd.getX()), Math.min(selectStart.getY(), selectEnd.getY()));
    let maxPoint = new Point(Math.max(selectStart.getX(), selectEnd.getX()), Math.max(selectStart.getY(), selectEnd.getY()));
    return minPoint.getX() <= pos.getX() && pos.getX() <= maxPoint.getX() 
      && minPoint.getY() <= pos.getY() && pos.getY() <= maxPoint.getY();
  }

  return (
    <Box>
      <AppBar position="sticky" component="nav">
        <MenuBar currTool={currTool} setCurrTool={changeTool} primaryBrush={primaryBrush} setPrimaryBrush={setPrimaryBrush} 
          secondaryBrush={secondaryBrush} setSecondaryBrush={setSecondaryBrush} fillBrush={fillBrush} setFillBrush={setFillBrush} />
      </AppBar>

      <Box sx={{ mt: 2.5 }}>
        {[...Array(gridSize.getY())].map((x, i) => 
          <Stack direction="row" key={i} sx={{ ml: 2, mt: "-4px" }} spacing="-4px">
            {[...Array(gridSize.getX())].map((x, j) => 
              <GridTile key={j} pos={new Point(j, i)} currTool={currTool} setCurrTool={setCurrTool} layout={layout} dragButton={dragButton} setDragButton={setDragButton} 
                primaryBrush={primaryBrush} setPrimaryBrush={setPrimaryBrush} secondaryBrush={secondaryBrush} setSecondaryBrush={setSecondaryBrush} 
                fillBrush={fillBrush} setFillBrush={setFillBrush} tileMap={tileMap} setTileMap={setTileMap} gridSize={gridSize} 
                setSelectStart={setSelectStart} setSelectEnd={setSelectEnd} isInSelection={isInSelection} /> )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default App;
