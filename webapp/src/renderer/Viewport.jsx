import React from "react";
import { EventSystem } from "@pixi/events"; 
import { PixiComponent, useApp } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";

// create and instantiate the viewport component
// we share the ticker and interaction from app
const PixiViewportComponent = PixiComponent("Viewport", { 
    create(props) {
        const { app, ...viewportProps } = props;
        
        // comes from github issue: https://github.com/davidfig/pixi-viewport/issues/438
        // Install EventSystem, if not already
        // (PixiJS 6 doesn't add it by default)
        const events = new EventSystem(props.app.renderer);
        events.domElement = props.app.renderer.view;

        const viewport = new PixiViewport({
        ticker: props.app.ticker,
        events: events,
        disableOnContextMenu: true,
        sortableChildren: true,
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
    },

    // comes from github issue: https://github.com/davidfig/pixi-viewport/issues/438
    willUnmount(instance, parent) {
        // workaround because the ticker is already destroyed by this point by the stage
        instance.options.noTicker = true;
        instance.destroy({children: true, texture: true, baseTexture: true})

    }
});


const Viewport = (props) => {
    return <PixiViewportComponent app={useApp()} {...props} />
};

export default Viewport;