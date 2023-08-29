const { Point } = require("@cozy-caves/utils");
const Action = require("./action");

class DragAction extends Action {
    #selectStart;
    #selectEnd;
    redoSelectStart;
    redoSelectEnd;
    oldTiles = [];
    newTiles = [];

    constructor(selectStart, selectEnd) {
        super();
        this.#selectStart = selectStart;
        this.#selectEnd = selectEnd;
    }

    undo(layout, setTileMap, setMouseInfo) {
        setMouseInfo(prev => ({...prev,
            selectStart: this.#selectStart,
            selectEnd: this.#selectEnd,
            selectDragStart: new Point(-1, -1),
            selectDragEnd: new Point(-1, -1)
        }));

        this.fillTileMap(this.oldTiles, layout, setTileMap);
    }

    redo(layout, setTileMap, setMouseInfo) {
        setMouseInfo(prev => ({...prev,
            selectStart: this.redoSelectStart,
            selectEnd: this.redoSelectEnd,
            selectDragStart: new Point(-1, -1),
            selectDragEnd: new Point(-1, -1)
        }));

        this.fillTileMap(this.newTiles, layout, setTileMap);
    }
}

export default DragAction;
