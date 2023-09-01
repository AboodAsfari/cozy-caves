import  React from 'react';
import { Stage, Sprite, Text } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';
import { TileID } from '@cozy-caves/utils';
import  Viewport from './Viewport';
import Popup from './Popup';

const { useState, useEffect } = React;

const RendererCanvas = (props) => {
  const {
    stageRef
  } = props;

  const tileIDImageMap = new Map( Object.entries(TileID).map(([k, v]) => [v, { id: k, img: `resources/tiles/${k}.png` }]));
  BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST
  
  const stageOptions = {
    antialias: true,
    autoDensity: true,
    backgroundColor: "#1A1B1D",
  };

  const [popupContent, setPopupContent] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [clickX, setClickX] = useState(0);
  const [clickY, setClickY] = useState(0);
  
  const onClick = (e, tileInfo) => {
    setPopupContent(tileInfo);
    setIsPopupOpen(true);

    // Pass the mouse click coordinates
    setClickX(e.clientX);
    setClickY(e.clientY); 
  };

  useEffect(() => {
    if (props.zoomScaleRequest === 1) return;
    zoom(props.zoomScaleRequest);
    props.setZoomScaleRequest(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.zoomScaleRequest]);


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

    const tileInfo = `Clicked on (${tile.getPosition().getX()}, ${tile.getPosition().getY()}) || Type: ${tile.getTileType()}`
    
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
              pointerdown={(e) => onClick(e, tileInfo)}
            />
  }

  const drawProp = (prop, roomPos) => {
    let xPos = (prop.getPosition().getX() + prop.getOffset().getX() + roomPos.getX()) * size * scaleX
    let yPos = (prop.getPosition().getY() + prop.getOffset().getY() + roomPos.getY()) * size * scaleY
    return <Text
              text={prop.toString()}
              anchor={0.5}
              scale={{x:scaleX, y:scaleY}} 
              position={{x:xPos, y:yPos}}
              angle={prop.getRotation()}
              zIndex={1000}
            />
  }

  const drawDungeon = () => {
    return props.dungeon.map((room) => {
      let roomMaxX =(room.getPosition().getX()+room.getDimensions().getX()) * size * scaleX;
      let roomMaxY = (room.getPosition().getY()+room.getDimensions().getY()) * size * scaleY;
      if(roomMaxX > maxX) {
        maxX = roomMaxX;
        if (stageRef.current) {
          let viewport = stageRef.current.mountNode.containerInfo.children[0];
          viewport.maxX = maxX;
        }
      }
      if(roomMaxY > maxY) {
        maxY = roomMaxY;
        if (stageRef.current) {
          let viewport = stageRef.current.mountNode.containerInfo.children[0];
          viewport.maxY = maxY;
        }
      }
      
      return room.getTiles().map((tile) => drawTile(tile, room.getPosition()))
    })
  }

  const drawProps = () => {
    return props.dungeon.map((room) => {
      console.log(room.getPropMap())
      return room.getPropMap().entries().map((prop) => drawProp(prop, room.getPosition()))
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
  let propsList = drawProps()
  return (
    <>
      <Stage width={width} height={height} options={stageOptions} ref={stageRef}>
        <Viewport
          maxX={maxX}
          maxY={maxY}
          screenWidth={width}
          screenHeight={height}
        >
         { dungeon }
         { propsList }
        </Viewport>
      </Stage>

      {/*Add Popup for Tile/Item Information*/}
      <Popup
        isOpen={isPopupOpen}
        content={popupContent}
        onClose={() => setIsPopupOpen(false)}
        clickX={clickX}
        clickY={clickY}
      />
    </>
  );
};

export default RendererCanvas;