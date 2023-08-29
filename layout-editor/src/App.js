import React from "react";
import { 
  AppBar,
  Stack,
  Box,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import "./styles/App.css";
import "./styles/MenuBar.css";

import GridTile from "./GridTile";
import { Point } from "@cozy-caves/utils";
import Tools from "./Tools";

import MenuBar from "./Toolbar/MenuBar";
import DragAction from "./actions/dragAction";

import CircleIcon from '@mui/icons-material/Circle';
import CheckIcon from '@mui/icons-material/Check';
import SelectAction from "./actions/selectAction";
import PenAction from "./actions/penAction";

const Layout = require("@cozy-caves/room-generation").Layout;

const App = () => {
  const gridSize = new Point(10, 8);
  const layout = React.useRef(new Layout()).current;
  const undoStack = React.useRef([]).current;;
  const redoStack = React.useRef([]).current;;
  const [tileMap, setTileMap] = React.useState({});
  const [currTool, setCurrTool] = React.useState(Tools.PEN);
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
  const [partitionAssigner, setPartitionAssigner] = React.useState(null);

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
    if (typeof e.target.className !== "string" || partitionAssigner !== null) return;
    if (e.target.className && (e.target.className.includes("GridTile") || e.target.className.includes("GridTileOutline"))) return;

    if (mouseInfo.selectEnd.toString() !== "-1,-1") {
      undoStack.push(new SelectAction(mouseInfo.selectStart, mouseInfo.selectEnd));
      undoStack[undoStack.length - 1].redoSelectStart = new Point(-1, -1);
      undoStack[undoStack.length - 1].redoSelectEnd = new Point(-1, -1);

      setMouseInfo(prev => ({...prev,
        selectStart: new Point(-1, -1),
        selectEnd: new Point(-1, -1)
      }));
    }
  }

  const handleMouseUp = () => {
    setMouseInfo(prev => ({...prev, dragButton: -1}));

    let dragEnd = mouseInfo.selectDragEnd;
    let dragStart = mouseInfo.selectDragStart;
    let dragDiff = new Point(dragEnd.getX() - dragStart.getX(), dragEnd.getY() - dragStart.getY());
    let selectStart = mouseInfo.selectStart;
    let selectEnd = mouseInfo.selectEnd;

    if (selectStart.toString() !== "-1,-1" && selectEnd.toString() !== "-1,-1") {
      if (dragDiff.getX() !== 0 || dragDiff.getY() !== 0) {
        undoStack.push(new DragAction(selectStart, selectEnd));
        undoStack[undoStack.length - 1].redoSelectStart = selectStart.add(dragDiff);
        undoStack[undoStack.length - 1].redoSelectEnd = selectEnd.add(dragDiff);
        redoStack.splice(0, redoStack.length);

        let overlayMap = getOverlayMap();
        for (let key in overlayMap) {
          let value = overlayMap[key];
          let pos = new Point(parseInt(key.split(',')[0]), parseInt(key.split(',')[1]));
          if (pos.getX() >= gridSize.getX() || pos.getY() >= gridSize.getY() || pos.getX() < 0 || pos.getY() < 0) continue;

          undoStack[undoStack.length - 1].oldTiles.push({ pos, tile: tileMap[pos.toString()] });

          if (value === null) {
            layout.removeTile(pos);
            setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
            undoStack[undoStack.length - 1].newTiles.push({ pos, tile: undefined });
          } else {
            value = value.clone(pos);
            layout.addTile(value);
            setTileMap(prev => ({...prev, [pos.toString()]: value}));
            undoStack[undoStack.length - 1].newTiles.push({ pos, tile: value });
          }
        }

        setMouseInfo(prev => ({...prev, 
          selectStart: prev.selectStart.add(dragDiff), 
          selectEnd: prev.selectEnd.add(dragDiff),
          selectDragStart: new Point(-1, -1),
          selectDragEnd: new Point(-1, -1),
        }));
      } else {
        undoStack[undoStack.length - 1].redoSelectStart = selectStart;
        undoStack[undoStack.length - 1].redoSelectEnd = selectEnd;
      }
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
    } else if (e.ctrlKey && e.key === "z") {
      if (undoStack.length === 0) return;
      let action = undoStack.pop();
      action.undo(layout, setTileMap, setMouseInfo, changeTool);
      redoStack.push(action);
    } else if (e.ctrlKey && e.key === "y") {
      if (redoStack.length === 0) return;
      let action = redoStack.pop();
      action.redo(layout, setTileMap, setMouseInfo, changeTool);
      undoStack.push(action);
    }
  }

  const changeTool = (tool) => {
    setMouseInfo(prev => ({...prev,
      selectStart: new Point(-1, -1),
      selectEnd: new Point(-1, -1)
    }));

    setCurrTool(tool);
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

  const handlePartitionChange = (partitionNum) => {
    let action = new PenAction(false, null);
    undoStack.push(action);

    if (isInSelection(partitionAssigner.pos) && mouseInfo.selectEnd.toString() !== "-1,-1") {
      for (let key in tileMap) {
        if (!tileMap[key] || !isInSelection(tileMap[key].getPosition())) continue;
        let tile = tileMap[key]; 
        action.oldTiles.push({ pos: tile.getPosition(), tile, partitionNum: tile.getPartitionNum() });
        action.newTiles.push({ pos: tile.getPosition(), tile, partitionNum: partitionNum });
        tile.setPartitionNum(partitionNum);
        layout.updateTile(tile);
      }
    } else {
      let tile = tileMap[partitionAssigner.pos.toString()]; 
      action.oldTiles.push({ pos: partitionAssigner.pos, tile, partitionNum: tile.getPartitionNum() });
      action.newTiles.push({ pos: partitionAssigner.pos, tile, partitionNum: partitionNum });
      tile.setPartitionNum(partitionNum);
      layout.updateTile(tile);
    }
  
    setPartitionAssigner(null);
  }

  const handlePartitionContextMenu = (e) => {
    e.preventDefault();
    setPartitionAssigner(null);
  }

  const isPartitionActiveForTile = (partitionNum) => {
    if (partitionAssigner === null) return false;
    if (mouseInfo.selectEnd.toString() !== "-1,-1") {
      for (let key in tileMap) {
        if (!tileMap[key] || !isInSelection(tileMap[key].getPosition())) continue;
        if (tileMap[key].getPartitionNum() !== partitionNum) return false;
      }
    }
    let tile = tileMap[partitionAssigner.pos.toString()]; 
    return tile.getPartitionNum() === partitionNum;
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
                mouseInfo={mouseInfo} setMouseInfo={setMouseInfo} brushInfo={brushInfo} setBrushInfo={setBrushInfo} undoStack={undoStack}
                tileMap={tileMap} setTileMap={setTileMap} isInSelection={isInSelection} getOverlayMap={getOverlayMap} redoStack={redoStack}
                partitionAssigner={partitionAssigner} setPartitionAssigner={setPartitionAssigner}
              /> 
            )}
          </Stack>
        )}
      </Box>

      <Menu open={partitionAssigner !== null} onClose={() => setPartitionAssigner(null)} anchorReference="anchorPosition"
        anchorPosition={ partitionAssigner !== null ? { top: partitionAssigner.mouseY, left: partitionAssigner.mouseX }  : undefined }
        onContextMenu={handlePartitionContextMenu} sx={{ "& .MuiPaper-root": { borderRadius: 0, backgroundColor: "#7d7a7a" }, mt: 1 }}
      >
        { layout.getPartitionDisplayInfo().map((info, i) => 
          <MenuItem key={info.name} onClick={() => handlePartitionChange(i - 2)} className="BrushMenuItem" sx={{ minWidth: 140 }} disableRipple> 
            <CircleIcon sx={{ color: info.color }} />
            <Typography sx={{ ml: 1.2, mr: 2, mt: 0.5 }}> {info.name} </Typography>
            {isPartitionActiveForTile(i - 2) && <CheckIcon />}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default App;
