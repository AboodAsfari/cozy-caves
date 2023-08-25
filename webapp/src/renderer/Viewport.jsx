import React from "react";
import { EventSystem } from "@pixi/events"; 
import { PixiComponent, useApp } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";

// create and instantiate the viewport component
// we share the ticker and interaction from app
const PixiViewportComponent = PixiComponent("Viewport", { 
    create(props) {
        const { app, ...viewportProps } = props;

        const viewport = new PixiViewport({
        ticker: props.app.ticker,
        events: props.app.renderer.events,
        interaction: props.app.renderer.plugins.interaction,
        disableOnContextMenu: true,
        ...viewportProps
        });
        viewport.drag().pinch().wheel()
        .decelerate({
            friction: 0.90,
        })
        .clampZoom({
            minScale: 0.1,
            maxScale: 8,
        });

        return viewport;
    }
});


const Viewport = (props) => {
    return <PixiViewportComponent app={useApp()} {...props} />
};

export default Viewport;