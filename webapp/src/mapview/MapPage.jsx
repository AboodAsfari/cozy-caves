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

	return ( <>
		<RendererCanvas dungeon={dungeon} viewport={viewport} pixiApp={pixiApp} />
		<ToolBar mapSettings={mapSettings} setMapSettings={setMapSettings} dungeon={dungeon} 
			setDungeon={setDungeon} viewport={viewport} pixiApp={pixiApp} />
    </> );
};

export default MapPage;