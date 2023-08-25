import  React from 'react';
import { Stage, Sprite } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';
import  Viewport from './Viewport';

const DungeonBuilder = require('@cozy-caves/dungeon-generation');
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


  const [ dungeon, setDungeon ] = useState(new DungeonBuilder().setPreset("Small").build());
  const size = 193
  const offsetX = 0
  const offsetY = 0
  const scaleX = 0.5
  const scaleY = 0.5

  const drawTile = (tile, roomPos) => {
    const img = tile.getTileType() === "floor" ? "Floor" : "Wall"
    let xPos = (tile.getPosition().getX() + roomPos.getX()) * size * scaleX 
    let yPos = (tile.getPosition().getY() + roomPos.getY()) * size * scaleY
    return <Sprite image={"resources/"+img+".jpg"} scale={{x:scaleX, y:scaleY}} x={xPos} y={yPos} />
  }

  const drawDungeon = () => {
    return dungeon.map((room) => room.getTiles().map((tile) => drawTile(tile, room.getPosition())))
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
         { drawDungeon() }
        </Viewport>
      </Stage>
    </>
  );
};

export default RendererCanvas;