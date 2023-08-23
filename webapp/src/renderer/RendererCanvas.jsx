import { React, useState } from 'react';
import { Point } from "@cozy-caves/utils";
import { Stage, Sprite } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';

const RoomBuilder = require("@cozy-caves/room-generation");

const RendererCanvas = (props) => {
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST
  
  const dimensions = new Point(10, 10);

  const [ room, setRoom ] = useState(new RoomBuilder().setSize(dimensions).setLeniency(new Point(0, 0)).build());
  const size = 193
  const offsetX = 0
  const offsetY = 0
  const scaleX = 0.5
  const scaleY = 0.5

  const drawTile = (tile) => {
    const img = tile.getTileType() === "floor" ? "Floor" : "Wall"
    return <Sprite image={"resources/"+img+".jpg"} scale={{x:scaleX, y:scaleY}} x={((tile.getPosition().getX() * size)*scaleX) + offsetX} y={(tile.getPosition().getY() * size)*scaleY + offsetY} />
  }

  return (
      <Stage width={window.innerWidth} height={window.innerHeight} options={{backgroundColor:'#433a3b'}} >
        { room.getTiles().map((tile) => drawTile(tile)) }
      </Stage>
    );
};

export default RendererCanvas;