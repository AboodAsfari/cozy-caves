import { 
    Box,
    Typography,
  } from "@mui/material";
  import "./styles/GridTile.css";
import Tools from "./Tools";
import { useState } from "react";
import { Point } from "@cozy-caves/utils";
  
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
    setSecondaryBrush,
    fillBrush,
    setFillBrush,
    gridSize,
    tileMap,
    setTileMap
  } = props;

  const getExtraClasses = () => {
    let extraClasses = "";
    if (currTool === Tools.PICKER) extraClasses += " ColorPickable";
    if (currTool === Tools.ERASER) extraClasses += " Erasable";
    if (currTool === Tools.FILL) extraClasses += " Fillable";
    return extraClasses;
  }

  const handleMouseDown = (e) => {
    setDragButton(e.button);

    if (currTool === Tools.PEN) {
      if (e.button !== 0) return;
      if ((!e.altKey && primaryBrush === "none") || (e.altKey && secondaryBrush === "none")) {
        layout.removeTile(pos);
        setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
        return;
      };
      let newTileType = !e.altKey ? primaryBrush : secondaryBrush;
      let newTile = new Tile(newTileType, pos); 
      layout.addTile(newTile, -1);
      setTileMap(prev => ({...prev, [pos.toString()]: newTile}));
    } else if (currTool === Tools.ERASER) {
      layout.removeTile(pos);
      setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
    } else if (currTool === Tools.SELECTOR) {
      // Select tiles
    } else if (currTool === Tools.PICKER) {
      let tileType = !!tileMap[pos.toString()] ? tileMap[pos.toString()].getTileType() : "none";
      if (e.button === 1) return;
      else if (e.button === 0) {
        if (!e.altKey) setPrimaryBrush(tileType);
        else setSecondaryBrush(tileType);
        setCurrTool(Tools.PEN);
      } else if (e.button === 2) {
        setFillBrush(tileType);
        setCurrTool(Tools.FILL);
      }
      
    } else if (currTool === Tools.FILL) {
      let typeToFill = !!tileMap[pos.toString()] ? tileMap[pos.toString()].getTileType() : "none";
      let toFill = [pos];
      let added = [];
      while (toFill.length > 0) {
        let curr = toFill.pop(0);
        added.push(curr.toString());
        let newTile = new Tile(fillBrush, pos); 
        if (fillBrush === "none") {
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
  }

  return (
    <Box className={"GridTileOutline " + getExtraClasses()} onDragStart={e => e.preventDefault()} onMouseDown={handleMouseDown} onContextMenu={(e) => e.preventDefault()}
      onMouseUp={() => setDragButton(-1)} onMouseOver={(e) => { if (dragButton !== -1) handleMouseDown({ ...e, button: dragButton }) }}>
      <Box className={"GridTile" + (!!tileMap[pos] ? " FilledTile" : "")} onContextMenu={(e) => e.preventDefault()}>
        <Typography sx={{ fontSize: 40, textAlign: "center", pointerEvents: "none" }}> 
          {!tileMap[pos]  ? "" : tileMap[pos].getTileType() === "floor" ? "F" : "W"} 
        </Typography> 
      </Box>
    </Box>
  );
}
  
export default GridTile;
  