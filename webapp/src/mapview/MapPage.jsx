import React from 'react';
import RendererCanvas from '../renderer/RendererCanvas';
import ToolBar from './ToolBar';
/* 
This needs to be split into multiple components
some of the boxes can probably 
*/

const MapPage = (props) => {
  const [zoomScaleRequest, setZoomScaleRequest] = React.useState(1);

  return (
    <>
    <RendererCanvas dungeon={props.dungeon} zoomScaleRequest={zoomScaleRequest} setZoomScaleRequest={setZoomScaleRequest} />
    <ToolBar zoom={setZoomScaleRequest} />
    </>
  );
};

export default MapPage;