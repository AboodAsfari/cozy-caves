import  React from 'react';
import { Point } from "@cozy-caves/utils";
import { Stage, Sprite, PixiComponent, useApp } from '@pixi/react';
import { BaseTexture, SCALE_MODES } from 'pixi.js';
import { EventSystem } from "@pixi/events"; 
import { RoomBuilder } from "@cozy-caves/room-generation";

const { useState, useEffect, useRef, forwardRef } = React;
const Viewport = require('pixi-viewport');

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

  // create and instantiate the viewport component
  // we share the ticker and interaction from app
  const PixiViewportComponent = PixiComponent("Viewport", { 
    create(props) {
      const { app, ...viewportProps } = props;

      const viewport = new Viewport.Viewport({
        ticker: props.app.ticker,
        events: app.renderer.events,
        interaction: props.app.renderer.plugins.interaction,
        ...viewportProps
      });

      // activate plugins
      (props.plugins || []).forEach((plugin) => {
        viewport[plugin]();
      });

      return viewport;
    },
    applyProps(viewport, _oldProps, _newProps) {
      const { plugins: oldPlugins, children: oldChildren, ...oldProps } = _oldProps;
      const { plugins: newPlugins, children: newChildren, ...newProps } = _newProps;

      Object.keys(newProps).forEach((p) => {
        if (oldProps[p] !== newProps[p]) {
          viewport[p] = newProps[p];
        }
      });
    },
    didMount() {
      console.log("viewport mounted");
    }
  });

  // create a component that can be consumed
  // that automatically pass down the app
  const PixiViewport = forwardRef((props, ref) => (
    <PixiViewportComponent ref={ref} app={useApp()} {...props} />
  ));

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

  // get the actual viewport instance
  const viewportRef = useRef();

  // get the current window size
  const [width, height] = useResize();

  return (
    <>
      <Stage width={width} height={height} options={stageOptions}>
        <PixiViewport
          ref={viewportRef}
          plugins={["drag", "pinch", "wheel", "decelerate"]}
          screenWidth={width}
          screenHeight={height}
          worldWidth={width * 4}
          worldHeight={height * 4}
        >
        { room.getTiles().map((tile) => drawTile(tile)) }
        </PixiViewport>
      </Stage>
    </>
  );
};

export default RendererCanvas;