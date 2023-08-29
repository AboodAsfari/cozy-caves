const Action = require("./action");

class PenAction extends Action {
    oldTiles = [];
    newTiles = [];
    encounteredPos = [];
    isPrimary;

    constructor(isPrimary) {
        super();
        this.isPrimary = isPrimary;
    }

    undo(layout, setTileMap, setMouseInfo) {
        this.fillTileMap(this.oldTiles, layout, setTileMap);
    }

    redo(layout, setTileMap, setMouseInfo) {
        this.fillTileMap(this.newTiles, layout, setTileMap);
    }
}

module.exports = PenAction;
