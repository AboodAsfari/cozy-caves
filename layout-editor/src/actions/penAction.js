const Action = require("./action");

class PenAction extends Action {
    oldTiles = [];
    encounteredPos = [];
    isPrimary;

    constructor(isPrimary) {
        super();
        this.isPrimary = isPrimary;
    }

    undo(layout, setTileMap) {
        this.oldTiles.forEach(tilePair => {
            let tile = tilePair.tile;
            let pos = tilePair.pos;
            if (!tile) {
                layout.removeTile(pos);
                setTileMap(prev => ({...prev, [pos.toString()]: undefined}));
            } else {
                layout.addTile(tile, -1);
                setTileMap(prev => ({...prev, [pos.toString()]: tile}));
            }
        });
    }
}

module.exports = PenAction;
