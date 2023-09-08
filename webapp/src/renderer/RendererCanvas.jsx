import  React from 'react';
import { Stage, Sprite } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';
import { TileID } from '@cozy-caves/utils';
import  Viewport from './Viewport';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const { useState, useEffect } = React;

const RendererCanvas = (props) => {
  const stageRef = React.createRef();

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
    
    return props.dungeon.map((room) => {
      if(room.getPosition().getX()+room.getDimensions().getX() > maxX) maxX = room.getPosition().getX()+room.getDimensions().getX()
      if(room.getPosition().getY()+room.getDimensions().getY() > maxY) maxY = room.getPosition().getY()+room.getDimensions().getY()
      return room.getTiles().map((tile) => drawTile(tile, room.getPosition()))
    })
  }

  const zoom = (factor) => {
    let viewport = stageRef.current.mountNode.containerInfo.children[0];
    let clampOptions = viewport.plugins.plugins["clamp-zoom"].options;
    let newScale = viewport.scale._x * factor;

    if (newScale > clampOptions.maxScale) viewport.animate({ scale: clampOptions.maxScale, time: 250 });
    else if (newScale < clampOptions.minScale) viewport.animate({ scale: clampOptions.minScale, time: 250 });
    else  viewport.animate({ scale: newScale, time: 250 });  
  }

  // get the current window size
  const [width, height] = useResize();
  let dungeon = drawDungeon()
  maxX = maxX * size * scaleX
  maxY = maxY * size * scaleY
  console.log(maxX/2, maxY/2)
  return (
    <>
      <Stage width={width} height={height} options={stageOptions} ref={stageRef}>
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

      <RemoveIcon className="zoom-button" sx={{ right: 60 }} onClick={() => zoom(2/3)} />
      <AddIcon className="zoom-button" onClick={() => zoom(1.5)} />
    </>
  );
};

export default RendererCanvas;