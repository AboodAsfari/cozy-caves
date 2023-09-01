import React, { useState } from 'react';
import RendererCanvas from '../renderer/RendererCanvas';

const InformationViewer = (props) => {
    const [selectedTileInfo, setSelectedTileInfo] = useState(null);

    const displayTileInfo = (tileInfo) => {
        setSelectedTileInfo(tileInfo);
    };

    return (
        <div>
            <RendererCanvas dungeon={props.dungeon} displayTileInfo={displayTileInfo} />
            {selectedTileInfo && (
                <div className="tile-info">
                    <h2>Tile Information</h2>
                    <p>{selectedTileInfo}</p>
                </div>
            )}
        </div>
    );
};

export default InformationViewer;
