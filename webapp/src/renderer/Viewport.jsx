import React from "react";
import { EventSystem } from "@pixi/events"; 
import { PixiComponent, useApp } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";

// create and instantiate the viewport component
// we share the ticker and interaction from app
const PixiViewportComponent = PixiComponent("Viewport", { 
    create(props) {
        const { app, maxX, maxY,...viewportProps } = props;
        
        // comes from github issue: https://github.com/davidfig/pixi-viewport/issues/438
        // Install EventSystem, if not already
        // (PixiJS 6 doesn't add it by default)
        const events = new EventSystem(props.app.renderer);
        events.domElement = app.renderer.view;

        const viewport = new PixiViewport({
        ticker: app.ticker,
        events: events,
        disableOnContextMenu: true,
        sortableChildren: true,
        ...viewportProps
        });
        // Check if the image is taller than it is wide
        const fitYAxis = maxY/maxX > viewportProps.screenHeight/viewportProps.screenWidth;

        viewport.drag().pinch().wheel()
        .decelerate({
            friction: 0.90,
        })
        .clampZoom({
            // Clamps the amount the user can zoom out by
            // Dependent on the aspect ratio of the image
            minScale: (fitYAxis ? (viewportProps.screenHeight-70)/maxY : viewportProps.screenWidth/maxX) / 1.5,
            // Clamps the amount the user can zoom in by
            maxScale: 8,
        });
        
        viewport.moveCenter(maxX/2, (viewportProps.screenHeight/((viewportProps.screenHeight+70)/maxY))/2);
        if(fitYAxis){
            viewport.setZoom(((viewportProps.screenHeight-70)/maxY)/1.1, true, true, true);
        } else {
            viewport.fitWidth(maxX*1.1, true, true, true);
        }

        return viewport;
    },

    // comes from github issue: https://github.com/davidfig/pixi-viewport/issues/438
    willUnmount(instance) {
        // workaround because the ticker is already destroyed by this point by the stage
        instance.options.noTicker = true;
        instance.destroy({children: true, texture: true, baseTexture: true})

    }
});


const Viewport = (props) => {
    return <PixiViewportComponent app={useApp()} {...props} />
};

export default Viewport;