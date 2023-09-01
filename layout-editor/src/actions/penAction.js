const Action = require("./action");

class PenAction extends Action {
    oldTiles = [];
    newTiles = [];
    encounteredPos = [];
    isPrimary;
    desiredTool;

    constructor(isPrimary, desiredTool) {
        super();
        this.isPrimary = isPrimary;
        this.desiredTool = desiredTool;
    }

    undo(layout, setTileMap, setMouseInfo, setCurrTool) {
        this.fillTileMap(this.oldTiles, layout, setTileMap);
    }

    redo(layout, setTileMap, setMouseInfo, setCurrTool) {
        if (this.desiredTool) setCurrTool(this.desiredTool);
        this.fillTileMap(this.newTiles, layout, setTileMap);
    }
}

module.exports = PenAction;
