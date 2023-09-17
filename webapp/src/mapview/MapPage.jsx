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

	const viewport = React.useRef();
  // const [zoomScaleRequest, setZoomScaleRequest] = React.useState(1);
  // const stageRef = React.createRef();

	return ( <>
		<RendererCanvas dungeon={dungeon} viewport={viewport} />
		<ToolBar mapSettings={mapSettings} setMapSettings={setMapSettings} dungeon={dungeon} setDungeon={setDungeon} 
			intialRender={props.intialRender} setIntialRender={props.setIntialRender} viewport={viewport} />
    </> );
};

export default MapPage;