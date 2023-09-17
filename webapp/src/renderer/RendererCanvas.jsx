import  React from 'react';
import { Application, BaseTexture, SCALE_MODES, Sprite } from 'pixi.js';
import { EventSystem } from "@pixi/events"; 
import { TileID } from '@cozy-caves/utils';
import { Viewport } from "pixi-viewport";
import Popup from '../mapview/Popup';

const { useState, useEffect } = React;

const RendererCanvas = (props) => {
	const {
		dungeon
	} = props;

	const canvasRef = React.useRef();
	const pixiApp = React.useRef();
	const viewport = React.useRef();

	const maxX = React.useRef(0);
	const maxY = React.useRef(0);

	const tileIDImageMap = new Map( Object.entries(TileID).map(([k, v]) => [v, { id: k, img: `resources/tiles/${k}.png` }]));

	const onResize = () => {
        requestAnimationFrame(() => {
			pixiApp.current.renderer.resize(
				window.innerWidth,
				window.innerHeight
			);
			viewport.current.screenWidth = window.innerWidth;
			viewport.current.screenHeight = window.innerHeight;
			viewport.current.updateClamp();
			pixiApp.current.renderer.render(pixiApp.current.stage);
        });
	};

	React.useEffect(() => {
		if (!pixiApp.current) {
			window.addEventListener("resize", onResize);

			BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

			pixiApp.current = new Application({
				antialias: true,
				autoDensity: true,
				backgroundColor: "#1A1B1D",
				height: window.innerHeight,
				width: window.innerWidth
			});
			
			viewport.current = getViewport();

			pixiApp.current.stage.addChild(viewport.current);
			canvasRef.current.appendChild(pixiApp.current.view);
		}

		return () => {
			if (pixiApp.current) {
				window.removeEventListener("resize", onResize);

				pixiApp.current.stop();
				pixiApp.current.destroy(true);
				pixiApp.current = null;
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const getViewport = () => {
		const events = new EventSystem(pixiApp.current.renderer);
		events.domElement = pixiApp.current.renderer.view;

		let width = window.innerWidth;
		let height = window.innerHeight;

		const viewport = new Viewport({
			ticker: pixiApp.current.ticker,
			events: events,
			disableOnContextMenu: true,
			sortableChildren: true,
			maxX: maxX.current,
			maxY: maxY.current,
			screenWidth: width,
			screenHeight: height
		});

		viewport.updateClamp = function() {
			const fitYAxis = maxY.current / maxX.current > this.screenHeight / this.screenWidth;
		
			this.clampZoom({
				minScale: (fitYAxis ? (this.screenHeight - 70) / maxY.current : this.screenWidth / maxX.current) / 1.5,
				maxScale: 8,
			});
		};

		viewport.resetCamera = function() {
			const fitYAxis = maxY.current / maxX.current > this.screenHeight / this.screenWidth;
		
			this.updateClamp();

			this.moveCenter(maxX.current / 2, (this.screenHeight / ((this.screenHeight + 70) / maxY.current)) / 2);
			if(fitYAxis) this.setZoom(((this.screenHeight - 70) / maxY.current) / 1.1, true, true, true);
			else this.fitWidth(maxX.current * 1.1, true, true, true);
		}

		viewport.drag().pinch().wheel().decelerate({ friction: 0.90 });

		return viewport;
	}

	React.useEffect(() => {
		while(viewport.current.children[0]) viewport.current.removeChild(viewport.current.children[0]);

		dungeon.forEach((room) => {
			let roomMaxX = (room.getPosition().getX() + room.getDimensions().getX()) * size * scaleX;
			let roomMaxY = (room.getPosition().getY() + room.getDimensions().getY()) * size * scaleY;
			if(roomMaxX > maxX.current) {
				maxX.current = roomMaxX;
				viewport.current.maxX = maxX.current;
			}
			if(roomMaxY > maxY.current) {
				maxY.current = roomMaxY;
				viewport.current.maxY = maxY.current;
			}
			
			// Store all tiles in a room in their own container.
			room.getTiles().forEach((tile) => viewport.current.addChild(getTile(tile, room.getPosition())));
		});
		
		viewport.current.resetCamera();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dungeon]);

	const getTile = (tile, roomPos) => {
		const xPos = (tile.getPosition().getX() + tile.getOffset().getX() + roomPos.getX()) * size * scaleX;
		const yPos = (tile.getPosition().getY() + tile.getOffset().getY() + roomPos.getY()) * size * scaleY;

		let sprite = Sprite.from(tileIDImageMap.get(tile.getTileID()).img);
		sprite.anchor.set(0.5);
		sprite.scale.set(scaleX * tile.getScale().getX(), scaleY * tile.getScale().getY());	
		sprite.position.set(xPos, yPos);
		sprite.angle = tile.getRotation();
		sprite.zIndex = tile.getDepth();

		return sprite;
	}

  // const [popupContent, setPopupContent] = useState('');
  // const [isPopupOpen, setIsPopupOpen] = useState(false);

  // const [clickX, setClickX] = useState(0);
  // const [clickY, setClickY] = useState(0);
  
  // const onClick = (e, tileInfo) => {
  //   setPopupContent(tileInfo);
  //   setIsPopupOpen(true);

  //   // Pass the mouse click coordinates
  //   setClickX(e.clientX);
  //   setClickY(e.clientY); 
  // };

  // useEffect(() => {
  //   if (props.zoomScaleRequest === 1) return;
  //   zoom(props.zoomScaleRequest);
  //   props.setZoomScaleRequest(1);
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props.zoomScaleRequest]);

  const size = 64
  const scaleX = 0.5
  const scaleY = 0.5
  
  // const drawProp = (prop, roomPos) => {
  //   const tileInfo = `Clicked on (${prop.getPosition().getX()}, ${prop.getPosition().getY()}) || Type: ${prop.getName()}`;
  //   const xPos = (prop.getPosition().getX() + prop.getOffset().getX() + roomPos.getX()) * size * scaleX
  //   const yPos = (prop.getPosition().getY() + prop.getOffset().getY() + roomPos.getY()) * size * scaleY
  //   return <Sprite
  //             image={"resources/props/"+prop.getPathName()+".png"}
  //             anchor={0.5}
  //             scale={{x:scaleX, y:scaleY}} 
  //             position={{x:xPos, y:yPos}}
  //             angle={prop.getRotation()}
  //             zIndex={1000}
  //             eventMode='dynamic'
  //             cursor='pointer'
  //             pointerdown={(e) => onClick(e, prop)}
  //           />
  // }

  // const drawProps = () => {
  //   return props.dungeon.map((room) => {
  //     if(room.getPropMap() === undefined) return null;
  //     return room.getPropMap().getPropList().map((prop) => drawProp(prop, room.getPosition()));
  //   })
  // }

  // const zoom = (factor) => {
  //   let viewport = stageRef.current.mountNode.containerInfo.children[0];
  //   let clampOptions = viewport.plugins.plugins["clamp-zoom"].options;
  //   let newScale = viewport.scale._x * factor;

  //   if (newScale > clampOptions.maxScale) viewport.animate({ scale: clampOptions.maxScale, time: 250 });
  //   else if (newScale < clampOptions.minScale) viewport.animate({ scale: clampOptions.minScale, time: 250 });
  //   else  viewport.animate({ scale: newScale, time: 250 });  
  // }

  // // Get the dungeon and prop sprites
  // let renderableDungeon = drawDungeon()
  // let propsList = drawProps()

  return (
    <div ref={canvasRef} />
    // <>
    //   <Stage width={width} height={height} options={stageOptions} ref={stageRef}>
    //     <Viewport
    //       maxX={maxX}
    //       maxY={maxY}
    //       screenWidth={width}
    //       screenHeight={height}
    //     >
    //      { renderableDungeon }
    //      { propsList }
    //     </Viewport>
    //   </Stage>

    //   {/*Add Popup for Tile/Item Information*/}
    //   <Popup
    //     isOpen={isPopupOpen}
    //     content={popupContent}
    //     onClose={() => setIsPopupOpen(false)}
    //     clickX={clickX}
    //     clickY={clickY}
    //   />
    // </>
  );
};

export default RendererCanvas;