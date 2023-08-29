const { Point } = require("@cozy-caves/utils");
const Action = require("./action");

class DragAction extends Action {
    #selectStart;
    #selectEnd;
    oldTiles = [];

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

export default DragAction;
