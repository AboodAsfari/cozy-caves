import React from 'react';
import RendererCanvas from '../renderer/RendererCanvas';
import ToolBar from './ToolBar';

const MapPage = (props) => {
	const {
		dungeon,
		mapSettings,
		setDungeon,
		setMapSettings
	} = props;

	const pixiApp = React.useRef();
	const viewport = React.useRef();
  // const [zoomScaleRequest, setZoomScaleRequest] = React.useState(1);
  // const stageRef = React.createRef();

	return ( <>
		<RendererCanvas dungeon={dungeon} viewport={viewport} pixiApp={pixiApp} />
		<ToolBar mapSettings={mapSettings} setMapSettings={setMapSettings} dungeon={dungeon} setDungeon={setDungeon} 
			intialRender={props.intialRender} setIntialRender={props.setIntialRender} viewport={viewport} pixiApp={pixiApp} />
    </> );
};

export default MapPage;