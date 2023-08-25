import  React from 'react';
import { Point } from "@cozy-caves/utils";
import { Stage, Sprite } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';
import { RoomBuilder } from "@cozy-caves/room-generation";
import  Viewport from "./Viewport";

const { useState, useEffect } = React;

const RendererCanvas = (props) => {

  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST

  const stageOptions = {
    antialias: true,
    autoDensity: true,
    backgroundColor: '0xefefef',
  };

  const useResize = () => {
    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    
    useEffect(() => {
      const onResize = () => {
        requestAnimationFrame(() => {
          setSize([window.innerWidth, window.innerHeight])        
        })
      };
      
      window.addEventListener('resize', onResize);
      
      return () => {
        window.removeEventListener('resize', onResize);
      }
    }, []);
    
    return size;
  };

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

  // get the current window size
  const [width, height] = useResize();

  return (
    <>
      <Stage width={width} height={height} options={stageOptions}>
        <Viewport
          screenWidth={width}
          screenHeight={height}
          worldWidth={width * 4}
          worldHeight={height * 4}
        >
          { room.getTiles().map((tile) => drawTile(tile)) }
        </Viewport>
      </Stage>
    </>
  );
};

export default RendererCanvas;