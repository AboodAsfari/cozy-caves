class Action {
    undo(layout, setTileMap, setMouseInfo) { }
    redo(layout, setTileMap, setMouseInfo) { }
    
    fillTileMap(list, layout, setTileMap) {
        list.forEach(tilePair => {
            let tile = tilePair.tile;
            let pos = tilePair.pos;
            if (!tile) {
                layout.removeTile(pos);
                setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
            } else {
                layout.addTile(tile);
                setTileMap(prev => ({...prev, [pos.toString()]: tile}));
            }
        });
    }
}

module.exports = Action;
