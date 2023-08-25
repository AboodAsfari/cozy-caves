import { 
    AppBar,
    ThemeProvider, 
    Toolbar,
    Stack,
    Box,
    Typography,
    Grid,
    Button,
  } from "@mui/material";
  import "./GridTile.css";
import Tools from "./Tools";
import { useState } from "react";
  
const Tile = require("@cozy-caves/room-generation").Tile;

const GridTile = (props) => {
  const {
    pos,
    currTool,
    layout,
    dragButton,
    setDragButton
  } = props;

  const [filled, setFilled] = useState(false);
  const [updater, setUpdater] = useState(false);

  const handleMouseDown = (e) => {
    setDragButton(e.button);

    if (currTool === Tools.PEN) {
      if (e.button !== 0) return;
      let newTile = !e.altKey ? new Tile("floor", pos) : new Tile("wall", pos); 
      layout.addTile(newTile, -1);
      setFilled(true);
      setUpdater(!updater);
    } 
  }

  return (
    <Box className="GridTileOutline" onDragStart={e => e.preventDefault()} onMouseDown={handleMouseDown} onContextMenu={(e) => e.preventDefault()}
      onMouseUp={() => setDragButton(-1)} onMouseOver={(e) => { if (dragButton !== -1) handleMouseDown({ ...e, button: dragButton }) }}>
      <Box className={"GridTile" + (filled ? " FilledTile" : "")} onContextMenu={(e) => e.preventDefault()}>
        <Typography sx={{ fontSize: 40, textAlign: "center", pointerEvents: "none" }}> 
          {!filled ? "" : layout.getTile(pos).getTileType() === "floor" ? "F" : "W"} 
        </Typography> 
      </Box>
    </Box>
  );
}
  
export default GridTile;
  