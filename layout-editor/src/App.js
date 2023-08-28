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
  const [selectDragStart, setSelectDragStart] = React.useState(new Point(-1, -1));
  const [selectDragEnd, setSelectDragEnd] = React.useState(new Point(-1, -1));

  React.useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp, []);
    document.addEventListener("keydown", handleKeyPress, []);
    document.addEventListener("mousedown", handleMouseDown, []);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp, []);
      document.removeEventListener("keydown", handleKeyPress, []);
      document.removeEventListener("mousedown", handleMouseDown, []);
    }
  });

  const handleMouseUp = () => {
    setDragButton(-1);
    let dragDiff = new Point(selectDragEnd.getX() - selectDragStart.getX(), selectDragEnd.getY() - selectDragStart.getY());
    if (selectStart.toString() !== new Point(-1, -1).toString() && selectEnd.toString() !== new Point(-1, -1).toString()) {
      let overlayMap = getOverlayMap();
      for (let key in overlayMap) {
        let value = overlayMap[key];
        let pos = new Point(parseInt(key.split(',')[0]), parseInt(key.split(',')[1]));
        if (value === null) {
          layout.removeTile(pos);
          setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
        } else {
          value = value.clone(pos);
          layout.addTile(value, -1);
          setTileMap(prev => ({...prev, [pos.toString()]: value}));
        }
      }

      setSelectStart(prev => prev.add(dragDiff));
      setSelectEnd(prev => prev.add(dragDiff));
      setSelectDragStart(new Point(-1, -1));
      setSelectDragEnd(new Point(-1, -1));
    } 
  }

  const handleKeyPress = (e) => {
    if (currTool === Tools.SELECTOR && e.key === "Delete") {
      for (let posStr in tileMap) {
        if (!tileMap[posStr]) continue;
        let pos = tileMap[posStr].getPosition();
        if (isInSelection(pos)) {
          layout.removeTile(pos);
          setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
        }
      }
      setSelectStart(new Point(-1, -1));
      setSelectEnd(new Point(-1, -1));
    }
  }

  const handleMouseDown = (e) => {
    if (e.target.className.includes("GridTile") || e.target.className.includes("GridTileOutline")) return;
    setSelectStart(new Point(-1, -1));
    setSelectEnd(new Point(-1, -1));
  }

  const changeTool = (tool) => {
    setSelectStart(new Point(-1, -1));
    setSelectEnd(new Point(-1, -1));
    setCurrTool(tool);
  }

  const isInSelection = (pos) => {
    let dragDiff = new Point(selectDragEnd.getX() - selectDragStart.getX(), selectDragEnd.getY() - selectDragStart.getY());
    let minPoint = new Point(Math.min(selectStart.getX(), selectEnd.getX()) + dragDiff.getX(), Math.min(selectStart.getY(), selectEnd.getY()) + dragDiff.getY());
    let maxPoint = new Point(Math.max(selectStart.getX(), selectEnd.getX()) + dragDiff.getX(), Math.max(selectStart.getY(), selectEnd.getY()) + dragDiff.getY()); 
    return minPoint.getX() <= pos.getX() && pos.getX() <= maxPoint.getX() 
      && minPoint.getY() <= pos.getY() && pos.getY() <= maxPoint.getY();
  }

  const isInDraglessSelection = (pos) => {
    let minPoint = new Point(Math.min(selectStart.getX(), selectEnd.getX()), Math.min(selectStart.getY(), selectEnd.getY()));
    let maxPoint = new Point(Math.max(selectStart.getX(), selectEnd.getX()), Math.max(selectStart.getY(), selectEnd.getY())); 
    return minPoint.getX() <= pos.getX() && pos.getX() <= maxPoint.getX() 
      && minPoint.getY() <= pos.getY() && pos.getY() <= maxPoint.getY();
  }

  const getOverlayMap = () => {
    let overlayMap = {};
    for (let posStr in tileMap) {
      if (!tileMap[posStr] || !isInDraglessSelection(tileMap[posStr].getPosition())) continue;
      overlayMap[posStr] = null;
    }
    for (let posStr in tileMap) {
      if (!tileMap[posStr] || !isInDraglessSelection(tileMap[posStr].getPosition())) continue;
      let pos = tileMap[posStr].getPosition();
      let dragDiff = new Point(selectDragEnd.getX() - selectDragStart.getX(), selectDragEnd.getY() - selectDragStart.getY());
      overlayMap[pos.add(dragDiff).toString()] = tileMap[posStr];
    }
    return overlayMap;
  }

  return (
    <Box>
      <AppBar position="sticky" component="nav">
        <MenuBar currTool={currTool} setCurrTool={changeTool} primaryBrush={primaryBrush} setPrimaryBrush={setPrimaryBrush} 
          secondaryBrush={secondaryBrush} setSecondaryBrush={setSecondaryBrush} fillBrush={fillBrush} setFillBrush={setFillBrush} />
      </AppBar>

      <Box sx={{ mt: 2.5 }} id="grid">
        {[...Array(gridSize.getY())].map((x, i) => 
          <Stack direction="row" key={i} sx={{ ml: 2, mt: "-5px" }} spacing="-5px">
            {[...Array(gridSize.getX())].map((x, j) => 
              <GridTile key={j} pos={new Point(j, i)} currTool={currTool} setCurrTool={setCurrTool} layout={layout} dragButton={dragButton} setDragButton={setDragButton} 
                primaryBrush={primaryBrush} setPrimaryBrush={setPrimaryBrush} secondaryBrush={secondaryBrush} setSecondaryBrush={setSecondaryBrush} 
                fillBrush={fillBrush} setFillBrush={setFillBrush} tileMap={tileMap} setTileMap={setTileMap} gridSize={gridSize} 
                selectStart={selectStart} setSelectStart={setSelectStart} selectEnd={selectEnd} setSelectEnd={setSelectEnd} isInSelection={isInSelection} 
                selectDragStart={selectDragStart} setSelectDragStart={setSelectDragStart} selectDragEnd={selectDragEnd} setSelectDragEnd={setSelectDragEnd} 
                getOverlayMap={getOverlayMap} /> )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default App;
