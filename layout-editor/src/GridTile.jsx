import { 
    Box,
    Typography,
  } from "@mui/material";
  import "./styles/GridTile.css";
import Tools from "./Tools";
import { useState } from "react";
  
const Tile = require("@cozy-caves/room-generation").Tile;

const GridTile = (props) => {
  const {
    pos,
    currTool,
    setCurrTool,
    layout,
    dragButton,
    setDragButton,
    primaryBrush,
    setPrimaryBrush,
    secondaryBrush,
    setSecondaryBrush
  } = props;

  const [filled, setFilled] = useState(false);
  const [tileType, setTileType] = useState("none");
  const [updater, setUpdater] = useState(false);

  const getExtraClasses = () => {
    let extraClasses = "";
    if (currTool === Tools.PICKER) extraClasses += " ColorPickable";
    if (currTool === Tools.ERASER) extraClasses += " Erasable";
    return extraClasses;
  }

  const handleMouseDown = (e) => {
    setDragButton(e.button);

    if (currTool === Tools.PEN) {
      if (e.button !== 0) return;
      if ((!e.altKey && primaryBrush === "none") || (e.altKey && secondaryBrush === "none")) {
        layout.removeTile(pos);
        setFilled(false);
        setTileType("none");
        return;
      };
      let newTileType = !e.altKey ? primaryBrush : secondaryBrush;
      let newTile = new Tile(newTileType, pos); 
      layout.addTile(newTile, -1);
      setFilled(true);
      setTileType(newTileType);
      setUpdater(!updater);
    } else if (currTool === Tools.ERASER) {
      layout.removeTile(pos);
      setFilled(false);
        setTileType("none");
    } else if (currTool === Tools.SELECTOR) {
      // Select tiles
    } else if (currTool === Tools.PICKER) {
      if (e.button === 2) setCurrTool(Tools.PEN);
      if (e.button !== 0) return;
      if (!e.altKey) setPrimaryBrush(tileType);
      else setSecondaryBrush(tileType);
      setCurrTool(Tools.PEN);
    }
  }

  return (
    <Box className={"GridTileOutline " + getExtraClasses()} onDragStart={e => e.preventDefault()} onMouseDown={handleMouseDown} onContextMenu={(e) => e.preventDefault()}
      onMouseUp={() => setDragButton(-1)} onMouseOver={(e) => { if (dragButton !== -1) handleMouseDown({ ...e, button: dragButton }) }}>
      <Box className={"GridTile" + (filled ? " FilledTile" : "")} onContextMenu={(e) => e.preventDefault()}>
        <Typography sx={{ fontSize: 40, textAlign: "center", pointerEvents: "none" }}> 
          {!filled ? "" : tileType === "floor" ? "F" : "W"} 
        </Typography> 
      </Box>
    </Box>
  );
}
  
export default GridTile;
  