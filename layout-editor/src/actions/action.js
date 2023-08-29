class Action {
    undo(layout, setTileMap, setMouseInfo, setCurrTool) { }
    redo(layout, setTileMap, setMouseInfo, setCurrTool) { }
    
    fillTileMap(list, layout, setTileMap) {
        list.forEach(tilePair => {
            let tile = tilePair.tile;
            let pos = tilePair.pos;
            if (!tile) {
                layout.removeTile(pos);
                setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
            } else {
                if (tilePair.partitionNum) tile.setPartitionNum(tilePair.partitionNum);
                layout.addTile(tile);
                setTileMap(prev => ({...prev, [pos.toString()]: tile}));
            }
        });
    }
}

module.exports = Action;
