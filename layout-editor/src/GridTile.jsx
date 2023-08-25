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

  const handleMouseDown = (e) => {
    console.log(e)
    setDragButton(e.button);

    if (currTool === Tools.PEN) {
      if (layout.getTile(pos) || e.button === 1) return;
      let newTile = e.button === 0 ? new Tile("floor", pos) : new Tile("wall", pos); 
      layout.addTile(newTile, -1);
      setFilled(true);
    } 
  }

  return (
    <Box className="GridTileOutline" onDragStart={e => e.preventDefault()} onMouseDown={handleMouseDown} 
      onMouseUp={() => setDragButton(-1)} onMouseOver={() => { if (dragButton !== -1) handleMouseDown({ button: dragButton })  } }>
      <Box className={"GridTile" + (filled ? " FilledTile" : "")}>
        <Typography sx={{ fontSize: 40, textAlign: "center" }}> {!filled ? "" : layout.getTile(pos).getTileType() === "floor" ? "F" : "W"} </Typography> 
        {/* Todo: Make typography unselectable and mouse ignores it. */}
      </Box>
    </Box>
  );
}
  
export default GridTile;
  