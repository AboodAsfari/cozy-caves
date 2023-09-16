import React from 'react';
import RendererCanvas from '../renderer/RendererCanvas';
import ToolBar from './ToolBar';
/* 
This needs to be split into multiple components
some of the boxes can probably 
*/

const MapPage = (props) => {
  const {
    dungeon
  } = props;

  // const [zoomScaleRequest, setZoomScaleRequest] = React.useState(1);
  // const stageRef = React.createRef();

  return (
    <>
    {/* <RendererCanvas dungeon={props.dungeon} zoomScaleRequest={zoomScaleRequest} setZoomScaleRequest={setZoomScaleRequest} stageRef={stageRef} /> */}
    <RendererCanvas dungeon={dungeon} />
    {/* <ToolBar zoom={setZoomScaleRequest} mapSettings={props.mapSettings} setMapSettings={props.setMapSettings} dungeon={props.dungeon} setDungeon={props.setDungeon} 
      stageRef={stageRef} intialRender={props.intialRender} setIntialRender={props.setIntialRender} /> */}
    </>
  );
};

export default MapPage;