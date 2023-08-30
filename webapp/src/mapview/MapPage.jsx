import React from 'react';
import RendererCanvas from '../renderer/RendererCanvas';
/* 
This needs to be split into multiple components
some of the boxes can probably 
*/

const MapPage = (props) => {
  return (
    <RendererCanvas dungeon={props.dungeon}/>
  );
};

export default MapPage;