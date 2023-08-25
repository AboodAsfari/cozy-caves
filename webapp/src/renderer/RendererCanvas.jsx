import  React from 'react';
import { Stage, Sprite } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';
import { TileID } from '@cozy-caves/utils';
import  Viewport from './Viewport';

const DungeonBuilder = require('@cozy-caves/dungeon-generation');
const { useState, useEffect } = React;

const RendererCanvas = (props) => {

  // const tileIDImageMap = TileID.map((id) => { return { id: id, img: `resources/${id}.png` }})
  const tileIDImageMap = new Map( Object.entries(TileID).map(([k, v]) => [v, { id: k, img: `resources/${k}.png` }]));
  console.log(tileIDImageMap)
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST

  const stageOptions = {
    antialias: true,
    autoDensity: true,
    backgroundColor: 0xefefef,
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
  const size = 64
  const scaleX = 0.5
  const scaleY = 0.5

  const drawTile = (tile, roomPos) => {

    let xPos = (tile.getPosition().getX() + tile.getOffset().getX() + roomPos.getX()) * size * scaleX
    let yPos = (tile.getPosition().getY() + tile.getOffset().getY() + roomPos.getY()) * size * scaleY
    return <Sprite 
              image={tileIDImageMap.get(tile.getTileID()).img}
              anchor={0.5}
              scale={{x:scaleX*tile.getScale().getX(), y:scaleY*tile.getScale().getY()}} 
              position={{x:xPos, y:yPos}}
              angle={tile.getRotation()}
              zIndex={tile.getDepth()}
            />
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