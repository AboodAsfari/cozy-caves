import { 
    Box,
    Typography,
  } from "@mui/material";
  import "./styles/GridTile.css";
import Tools from "./Tools";
import { Point } from "@cozy-caves/utils";
  
const Tile = require("@cozy-caves/room-generation").Tile;

const GridTile = (props) => {
  const {
    pos,
    currTool,
    setCurrTool,
    layout,
    mouseInfo,
    setMouseInfo,
    brushInfo,
    setBrushInfo,
    gridSize,
    tileMap,
    setTileMap,
    isInSelection,
    getOverlayMap
  } = props;

  const getOutlineClasses = () => {
    let extraClasses = "";
    if (currTool === Tools.PICKER) extraClasses += " ColorPickable";
    if (currTool === Tools.ERASER) extraClasses += " Erasable";
    if (currTool === Tools.FILL) extraClasses += " Fillable";
    if (currTool === Tools.SELECTOR && isInSelection(pos)) {
      extraClasses += " SelectedTileOutline";
      if (mouseInfo.dragButton === -1 || mouseInfo.selectDragStart.toString() !== "-1,-1") extraClasses += " Draggable";
    }
    return extraClasses;
  }

  const getTileClasses = () => {
    let extraClasses = "";
    let overlayValue = getOverlayMap()[pos.toString()];
    if ((overlayValue !== null) && (!!tileMap[pos] || overlayValue !== undefined)) extraClasses += " FilledTile";
    if (currTool === Tools.SELECTOR && isInSelection(pos)) extraClasses += " SelectedTile";
    return extraClasses;
  }

  const getLabel = () => {
    let overlayValue = getOverlayMap()[pos.toString()];
    if (overlayValue === null || (overlayValue === undefined && !tileMap[pos.toString()])) return ""; 

    let tileType;
    if (overlayValue !== undefined) tileType = overlayValue.getTileType();
    else tileType = tileMap[pos.toString()].getTileType();
    return tileType === "wall" ? "W" : "F";
  }

  const handleMouseOver = (e) => {
    let syntheticEvent = { ...e, button: mouseInfo.dragButton, synthetic: true };
    if (mouseInfo.dragButton !== -1) handleMouseDown(syntheticEvent);
  }

  const handleMouseDown = (e) => {
    if (currTool === Tools.PEN) {
      if (e.button !== 0) return;
      if ((!e.altKey && brushInfo.primaryBrush === "none") || (e.altKey && brushInfo.secondaryBrush === "none")) {
        layout.removeTile(pos);
        setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
        setMouseInfo(prev => ({...prev, dragButton: e.button}));
        return;
      };
      let newTileType = !e.altKey ? brushInfo.primaryBrush : brushInfo.secondaryBrush;
      let newTile = new Tile(newTileType, pos); 
      layout.addTile(newTile, -1);
      setTileMap(prev => ({...prev, [pos.toString()]: newTile}));
    } else if (currTool === Tools.ERASER) {
      layout.removeTile(pos);
      setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
    } else if (currTool === Tools.SELECTOR) {
      if (isInSelection(pos) && mouseInfo.dragButton === -1) {
        setMouseInfo(prev => ({...prev, 
          selectDragStart: pos,
          selectDragEnd: pos
        }));
      } else if (mouseInfo.dragButton !== -1 && mouseInfo.selectDragStart.toString() !== new Point(-1, -1).toString()) {
        setMouseInfo(prev => ({...prev, selectDragEnd: pos}));
      } else {
        if (mouseInfo.dragButton === -1) {
          setMouseInfo(prev => ({...prev,
            selectStart: pos,
            selectDragStart: new Point(-1, -1),
            selectDragEnd: new Point(-1, -1)
          }));
        }
        setMouseInfo(prev => ({...prev, selectEnd: pos}));
      }
    } else if (currTool === Tools.PICKER) {
      let tileType = !!tileMap[pos.toString()] ? tileMap[pos.toString()].getTileType() : "none";
      if (e.button === 1) return;
      else if (e.button === 0) {
        if (!e.altKey) setBrushInfo(prev => ({...prev, primaryBrush: tileType}));
        else setBrushInfo(prev => ({...prev, secondaryBrush: tileType}));
        setCurrTool(Tools.PEN);
      } else if (e.button === 2) {
        setBrushInfo(prev => ({...prev, fillBrush: tileType}));
        setCurrTool(Tools.FILL);
      }
      
    } else if (currTool === Tools.FILL) {
      let typeToFill = !!tileMap[pos.toString()] ? tileMap[pos.toString()].getTileType() : "none";
      let toFill = [pos];
      let added = [];
      while (toFill.length > 0) {
        let curr = toFill.pop(0);
        added.push(curr.toString());
        let newTile = new Tile(brushInfo.fillBrush, pos); 
        if (brushInfo.fillBrush === "none") {
          layout.removeTile(curr);
          setTileMap(prev => ({...prev, [curr.toString()]: undefined}));
        } else {
          layout.addTile(newTile, -1);
          setTileMap(prev => ({...prev, [curr.toString()]: newTile}));
        }
        
        let directions = [ new Point(-1, 0), new Point(1, 0), new Point(0, -1), new Point(0, 1) ];
        for (let dir of directions) {
          let newPos = curr.add(dir);
          if (newPos.getX() < 0 || newPos.getX() >= gridSize.getX() || newPos.getY() < 0 || newPos.getY() >= gridSize.getY()) continue;     
          
          let skipPoint = false;
          for (let point of toFill) if (point.toString() === newPos.toString()) skipPoint = true;
          if (skipPoint) continue;

          if (!added.includes(newPos.toString()) && ((typeToFill === "none" && !tileMap[newPos.toString()]) || 
            (!!tileMap[newPos.toString()] && tileMap[newPos.toString()].getTileType() === typeToFill))) toFill.push(newPos);
        } 
      }
    }

    setMouseInfo(prev => ({...prev, dragButton: e.button}));
  }

  return (
    <Box className={"GridTileOutline " + getOutlineClasses()} onMouseDown={handleMouseDown} onMouseOver={handleMouseOver}
      onDragStart={e => e.preventDefault()} onContextMenu={e => e.preventDefault()} onMouseUp={() => setMouseInfo(prev => ({...prev, dragButton: -1}))}>
      <Box className={"GridTile " + getTileClasses()} onContextMenu={(e) => e.preventDefault()}>
        <Typography sx={{ fontSize: 40, textAlign: "center", pointerEvents: "none" }}> 
          {getLabel()} 
        </Typography> 
      </Box>
    </Box>
  );
}
  
export default GridTile;
  