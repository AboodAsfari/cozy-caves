const { Point } = require("@cozy-caves/utils");
const Action = require("./action");

class SelectAction extends Action {
    #selectStart;
    #selectEnd;

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
    }
}

export default SelectAction;
