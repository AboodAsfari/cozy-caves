import  React from 'react';
import { Stage, Sprite } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';
import { TileID } from '@cozy-caves/utils';
import  Viewport from './Viewport';

const { useState, useEffect } = React;

const RendererCanvas = (props) => {

  const tileIDImageMap = new Map( Object.entries(TileID).map(([k, v]) => [v, { id: k, img: `resources/${k}.png` }]));

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

  const size = 64
  const scaleX = 0.5
  const scaleY = 0.5
  let maxX = 0
  let maxY = 0

  const drawTile = (tile, roomPos) => {

    const tileInfo = `Tile at position (${tile.getPosition().getX()}, ${tile.getPosition().getY()}):\nType: ${tile.getTileType()}`
    const onClick = () => {
       console.log("This tile is being clicked on: " + tileInfo);

      if (props.displayTileInfo) {
          props.displayTileInfo(tileInfo);
          // console.log(props.displayTileInfo);
          // console.log("Tile Info: " + tileInfo);
      }
    };

    let xPos = (tile.getPosition().getX() + tile.getOffset().getX() + roomPos.getX()) * size * scaleX
    let yPos = (tile.getPosition().getY() + tile.getOffset().getY() + roomPos.getY()) * size * scaleY
    return <Sprite 
              image={tileIDImageMap.get(tile.getTileID()).img}
              anchor={0.5}
              scale={{x:scaleX*tile.getScale().getX(), y:scaleY*tile.getScale().getY()}} 
              position={{x:xPos, y:yPos}}
              angle={tile.getRotation()}
              zIndex={tile.getDepth()}
              eventMode='dynamic'
              cursor='pointer'
              pointerdown={onClick}
            />
  }

  const drawDungeon = () => {
    
    return props.dungeon.map((room) => {
      if(room.getPosition().getX()+room.getDimensions().getX() > maxX) maxX = room.getPosition().getX()+room.getDimensions().getX()
      if(room.getPosition().getY()+room.getDimensions().getY() > maxY) maxY = room.getPosition().getY()+room.getDimensions().getY()
      return room.getTiles().map((tile) => drawTile(tile, room.getPosition()))
    })
  }

  // get the current window size
  const [width, height] = useResize();
  let dungeon = drawDungeon()
  maxX = maxX * size * scaleX
  maxY = maxY * size * scaleY
  console.log(maxX/2, maxY/2)
  return (
    <>
      <Stage width={width} height={height} options={stageOptions}>
        <Viewport
          maxX={maxX}
          maxY={maxY}
          screenWidth={width}
          screenHeight={height}
          worldWidth={width * 4}
          worldHeight={height * 4}
        >
         { dungeon }
        </Viewport>
      </Stage>
    </>
  );
};

export default RendererCanvas;