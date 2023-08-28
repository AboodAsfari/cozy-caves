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
  const [mouseInfo, setMouseInfo] = React.useState({
    dragButton: -1,
    selectStart: new Point(-1, -1),
    selectEnd: new Point(-1, -1),
    selectDragStart: new Point(-1, -1),
    selectDragEnd: new Point(-1, -1),
  });

  React.useEffect(() => {
    document.removeEventListener("mousedown", handleMouseDown, []);
    document.addEventListener("mousedown", handleMouseDown, []);
    document.addEventListener("mouseup", handleMouseUp, []);
    document.addEventListener("keydown", handleKeyPress, []);

    return () => {
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

    let dragDiff = new Point(mouseInfo.selectDragEnd.getX() - mouseInfo.selectDragStart.getX(), 
      mouseInfo.selectDragEnd.getY() - mouseInfo.selectDragStart.getY());
    if (mouseInfo.selectStart.toString() !== new Point(-1, -1).toString() && mouseInfo.selectEnd.toString() !== new Point(-1, -1).toString()) {
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
    setMouseInfo(prev => ({...prev,
      selectStart: new Point(-1, -1),
      selectEnd: new Point(-1, -1)
    }));
    setCurrTool(tool);
  }

  const isInSelection = (pos) => {
    let dragDiff = new Point(mouseInfo.selectDragEnd.getX() - mouseInfo.selectDragStart.getX(), mouseInfo.selectDragEnd.getY() - mouseInfo.selectDragStart.getY());
    let minPoint = new Point(Math.min(mouseInfo.selectStart.getX(), mouseInfo.selectEnd.getX()) + dragDiff.getX(), Math.min(mouseInfo.selectStart.getY(), mouseInfo.selectEnd.getY()) + dragDiff.getY());
    let maxPoint = new Point(Math.max(mouseInfo.selectStart.getX(), mouseInfo.selectEnd.getX()) + dragDiff.getX(), Math.max(mouseInfo.selectStart.getY(), mouseInfo.selectEnd.getY()) + dragDiff.getY()); 
    return minPoint.getX() <= pos.getX() && pos.getX() <= maxPoint.getX() 
      && minPoint.getY() <= pos.getY() && pos.getY() <= maxPoint.getY();
  }

  const isInDraglessSelection = (pos) => {
    let minPoint = new Point(Math.min(mouseInfo.selectStart.getX(), mouseInfo.selectEnd.getX()), Math.min(mouseInfo.selectStart.getY(), mouseInfo.selectEnd.getY()));
    let maxPoint = new Point(Math.max(mouseInfo.selectStart.getX(), mouseInfo.selectEnd.getX()), Math.max(mouseInfo.selectStart.getY(), mouseInfo.selectEnd.getY())); 
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
      let dragDiff = new Point(mouseInfo.selectDragEnd.getX() - mouseInfo.selectDragStart.getX(), mouseInfo.selectDragEnd.getY() - mouseInfo.selectDragStart.getY());
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
              <GridTile key={j} pos={new Point(j, i)} currTool={currTool} setCurrTool={setCurrTool} layout={layout} mouseInfo={mouseInfo} setMouseInfo={setMouseInfo} 
                primaryBrush={primaryBrush} setPrimaryBrush={setPrimaryBrush} secondaryBrush={secondaryBrush} setSecondaryBrush={setSecondaryBrush} 
                fillBrush={fillBrush} setFillBrush={setFillBrush} tileMap={tileMap} setTileMap={setTileMap} gridSize={gridSize} 
                isInSelection={isInSelection} getOverlayMap={getOverlayMap} 
              /> 
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default App;
