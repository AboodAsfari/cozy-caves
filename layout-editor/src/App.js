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
  // const [primaryBrush, setPrimaryBrush] = React.useState("floor");
  // const [secondaryBrush, setSecondaryBrush] = React.useState("wall");
  // const [fillBrush, setFillBrush] = React.useState("floor");
  const [brushInfo, setBrushInfo] = React.useState({
    primaryBrush: "floor",
    secondaryBrush: "wall",
    fillBrush: "floor"
  })
  const [mouseInfo, setMouseInfo] = React.useState({
    dragButton: -1,
    selectStart: new Point(-1, -1),
    selectEnd: new Point(-1, -1),
    selectDragStart: new Point(-1, -1),
    selectDragEnd: new Point(-1, -1)
  });

  React.useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown, []);
    document.addEventListener("mouseup", handleMouseUp, []);
    document.addEventListener("keydown", handleKeyPress, []);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown, []);
      document.removeEventListener("mouseup", handleMouseUp, []);
      document.removeEventListener("keydown", handleKeyPress, []);
    }
  });

  const handleMouseDown = (e) => {
    if (e.target.className.includes("GridTile") || e.target.className.includes("GridTileOutline")) return;
    setMouseInfo(prev => ({...prev,
      selectStart: new Point(-1, -1),
      selectEnd: new Point(-1, -1)
    }));
  }

  const handleMouseUp = () => {
    setMouseInfo(prev => ({...prev, dragButton: -1}));

    let dragEnd = mouseInfo.selectDragEnd;
    let dragStart = mouseInfo.selectDragStart;
    let dragDiff = new Point(dragEnd.getX() - dragStart.getX(), dragEnd.getY() - dragStart.getY());
    let selectStart = mouseInfo.selectStart;
    let selectEnd = mouseInfo.selectEnd;

    if (selectStart.toString() !== "-1,-1" && selectEnd.toString() !== "-1,-1") {
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

      setMouseInfo(prev => ({...prev, 
        selectStart: prev.selectStart.add(dragDiff), 
        selectEnd: prev.selectEnd.add(dragDiff),
        selectDragStart: new Point(-1, -1),
        selectDragEnd: new Point(-1, -1),
      }));
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

      setMouseInfo(prev => ({...prev, 
        selectStart: new Point(-1, -1),
        selectEnd: new Point(-1, -1)
      }));
    }
  }

  const changeTool = (tool) => {
    console.log(10)
    setMouseInfo(prev => ({...prev,
      selectStart: new Point(-1, -1),
      selectEnd: new Point(-1, -1)
    }));
    setCurrTool(tool);
    console.log(20)
  }

  const isInSelection = (pos, useDrag = true) => {
    let selectStart = mouseInfo.selectStart;
    let selectEnd = mouseInfo.selectEnd;
    let minX = Math.min(selectStart.getX(), selectEnd.getX());
    let maxX = Math.max(selectStart.getX(), selectEnd.getX());
    let minY = Math.min(selectStart.getY(), selectEnd.getY());
    let maxY = Math.max(selectStart.getY(), selectEnd.getY());
    let minPoint;
    let maxPoint; 
    if (useDrag) {
      let dragEnd = mouseInfo.selectDragEnd;
      let dragStart = mouseInfo.selectDragStart;
      let dragDiff = new Point(dragEnd.getX() - dragStart.getX(), dragEnd.getY() - dragStart.getY());
      minPoint = new Point(minX + dragDiff.getX(), minY + dragDiff.getY());
      maxPoint = new Point(maxX + dragDiff.getX(), maxY + dragDiff.getY()); 
    } else {
      minPoint = new Point(minX, minY);
      maxPoint = new Point(maxX, maxY);
    }

    return minPoint.getX() <= pos.getX() && pos.getX() <= maxPoint.getX() 
      && minPoint.getY() <= pos.getY() && pos.getY() <= maxPoint.getY();
  }

  const getOverlayMap = () => {
    let overlayMap = {};
    for (let posStr in tileMap) {
      if (!tileMap[posStr] || !isInSelection(tileMap[posStr].getPosition(), false)) continue;
      overlayMap[posStr] = null;
    }
    for (let posStr in tileMap) {
      if (!tileMap[posStr] || !isInSelection(tileMap[posStr].getPosition(), false)) continue;
      let pos = tileMap[posStr].getPosition();
      let dragEnd = mouseInfo.selectDragEnd;
      let dragStart = mouseInfo.selectDragStart;
      let dragDiff = new Point(dragEnd.getX() - dragStart.getX(), dragEnd.getY() - dragStart.getY());
      overlayMap[pos.add(dragDiff).toString()] = tileMap[posStr];
    }
    return overlayMap;
  }

  return (
    <Box>
      <AppBar position="sticky" component="nav">
        <MenuBar currTool={currTool} setCurrTool={changeTool} brushInfo={brushInfo} setBrushInfo={setBrushInfo} />
      </AppBar>

      <Box sx={{ mt: 2.5 }} id="grid">
        {[...Array(gridSize.getY())].map((x, i) => 
          <Stack direction="row" key={i} sx={{ ml: 2, mt: "-5px" }} spacing="-5px">
            {[...Array(gridSize.getX())].map((x, j) => 
              <GridTile key={j} pos={new Point(j, i)} gridSize={gridSize} currTool={currTool} setCurrTool={setCurrTool} layout={layout} 
                mouseInfo={mouseInfo} setMouseInfo={setMouseInfo} brushInfo={brushInfo} setBrushInfo={setBrushInfo} 
                tileMap={tileMap} setTileMap={setTileMap} isInSelection={isInSelection} getOverlayMap={getOverlayMap} 
              /> 
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default App;
