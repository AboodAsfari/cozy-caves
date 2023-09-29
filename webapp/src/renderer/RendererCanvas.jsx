import  React from 'react';
import { Application, BaseTexture, Container, SCALE_MODES, Sprite } from 'pixi.js';
import { EventSystem } from "@pixi/events"; 
import { TileID } from '@cozy-caves/utils';
import { Viewport } from "pixi-viewport";
import Popup from '../mapview/Popup';
import PropHoverView from '../mapview/PropHoverView';
import { Fade } from 'hamburger-react';
import { Box, Collapse, Slide, Typography } from '@mui/material';

const RendererCanvas = (props) => {
	const {
		dungeon,
		pixiApp,
		viewport
	} = props;

	const canvasRef = React.useRef();

	const maxX = React.useRef(0);
	const maxY = React.useRef(0);

	const [hoverProp, setHoverProp] = React.useState(null);
	const [dialogProp, setDialogProp] = React.useState(null);
	const dialogPropRef = React.useRef();
	dialogPropRef.current = dialogProp;
	const [mouseX, setMouseX] = React.useState(0);
	const [mouseY, setMouseY] = React.useState(0);

	const tileIDImageMap = new Map( Object.entries(TileID).map(([k, v]) => [v, { id: k, img: `resources/tiles/${k}.png` }]));
	const size = 64;

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

		viewport.resetCamera = function(animate = false, animateTime = 500, callbackOnComplete = null) {
			const fitYAxis = maxY.current / maxX.current > this.screenHeight / this.screenWidth;
		
			this.updateClamp();

			let position = { x: maxX.current / 2, y: (this.screenHeight / ((this.screenHeight + 70) / maxY.current)) / 2 };
			let scale = (fitYAxis ? (this.screenHeight - 70) / maxY.current : this.screenWidth / maxX.current) / 1.5;
			if (animate) {
				if (this.animating) return;
				if (this.center.x === position.x && this.center.y === position.y && this.scale._x === scale) {
					if (callbackOnComplete) callbackOnComplete();
					return;
				}

				this.animating = true;
				this.animate({
					position: position, 
					scale: scale, 
					time: animateTime, 
					ease: "easeInOutCubic", 
					callbackOnComplete: () => {
						this.animating = false;
						if (callbackOnComplete) callbackOnComplete();
					}
				});
			} else {
				this.moveCenter(position.x, position.y);
				this.setZoom(scale, true, true, true);
			}
		}

		viewport.scaleZoom = function(factor) {
			let clampOptions = this.plugins.plugins["clamp-zoom"].options;
			let newScale = this.scale._x * factor;

			if (newScale > clampOptions.maxScale) this.animate({ scale: clampOptions.maxScale, time: 250, ease: "easeInOutCubic" });
			else if (newScale < clampOptions.minScale) this.animate({ scale: clampOptions.minScale, time: 250, ease: "easeInOutCubic" });
			else  this.animate({ scale: newScale, time: 250 });  
		} 

		viewport.drag().pinch().wheel().decelerate({ friction: 0.90 });

		return viewport;
	}

	React.useEffect(() => {
		while (viewport.current.children[0]) viewport.current.removeChild(viewport.current.children[0]);

		maxX.current = 0;
		maxY.current = 0;
		let toAdd = [];
		dungeon.forEach((room) => {
			let roomMaxX = (room.getPosition().getX() + room.getDimensions().getX()) * size;
			let roomMaxY = (room.getPosition().getY() + room.getDimensions().getY()) * size;
			if (roomMaxX > maxX.current) {
				maxX.current = roomMaxX;
				viewport.current.maxX = maxX.current;
			}
			if (roomMaxY > maxY.current) {
				maxY.current = roomMaxY;
				viewport.current.maxY = maxY.current;
			}
			
			let roomContainer = new Container();
			let tilesContainer = new Container();
			let propsContainer = new Container();
			roomContainer.position.set(room.getPosition().getX() * size, room.getPosition().getY() * size);
			propsContainer.zIndex = 1000;

			room.getTiles().forEach((tile) => tilesContainer.addChild(getTile(tile)));
			if(room.getPropMap()) room.getPropMap().getPropList().forEach((prop) => propsContainer.addChild(getProp(prop)));

			roomContainer.addChild(tilesContainer);
			roomContainer.addChild(propsContainer);
			toAdd.push(roomContainer);
		});

		viewport.current.resetCamera();
		if (viewport.current.initialLoaded) viewport.current.moveCenter(viewport.current.worldScreenWidth * 2, viewport.current.center.y);

		viewport.current.addChild(...toAdd);

		if (viewport.current.initialLoaded) {
			requestAnimationFrame(() => {
				viewport.current.animate({
					position: { x: maxX.current / 2, y: viewport.current.center.y }, 
					time: 500, 
					ease: "easeOutCubic"
				});
			});
		} else viewport.current.initialLoaded = true;
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dungeon]);

	const getTile = (tile) => {
		const xPos = (tile.getPosition().getX() + tile.getOffset().getX()) * size;
		const yPos = (tile.getPosition().getY() + tile.getOffset().getY()) * size;

		let sprite = Sprite.from(tileIDImageMap.get(tile.getTileID()).img);
		sprite.anchor.set(0.5);
		sprite.scale.set(tile.getScale().getX(), tile.getScale().getY());	
		sprite.position.set(xPos, yPos);
		sprite.angle = tile.getRotation();
		sprite.zIndex = tile.getDepth();

		return sprite;
	}

	const getProp = (prop) => {
		const xPos = (prop.getPosition().getX() + prop.getOffset().x) * size;
		const yPos = (prop.getPosition().getY() + prop.getOffset().y) * size;

		let sprite = Sprite.from("resources/props/" + prop.getPathName() + ".png");
		sprite.anchor.set(0.5, 0.5);
		sprite.scale.set(prop.getScale().getX(), prop.getScale().getY());	
		sprite.position.set(xPos, yPos);
		sprite.angle = prop.getRotation();
		sprite.eventMode = "dynamic";
		sprite.cursor = "pointer";
		sprite.on("pointerdown", () => setDialogProp(prop));
		sprite.on("pointermove", e => onPropHover(e, prop));
		sprite.on("pointerenter", e => onPropHover(e, prop));
		sprite.on("pointerleave", () => setHoverProp(null));

		return sprite;
	}

	const onPropHover = (e, prop) => {
		setHoverProp(prop);

		setMouseX(e.clientX);
		setMouseY(e.clientY); 
	}

	return ( <>
		<div ref={canvasRef} />
		<Popup
			prop={dialogProp}
			onClose={() => setDialogProp(null)}
			clickX={mouseX}
			clickY={mouseY}
		/>

		<PropHoverView menuOpen={!!dialogProp} prop={hoverProp} mouseX={mouseX} mouseY={mouseY} />
	</> );
};

export default RendererCanvas;