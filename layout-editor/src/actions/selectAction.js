import Tools from "../Tools";

const { Point } = require("@cozy-caves/utils");
const Action = require("./action");

class SelectAction extends Action {
    #selectStart;
    #selectEnd;
    redoSelectStart;
    redoSelectEnd;

    constructor(selectStart, selectEnd) {
        super();
        this.#selectStart = selectStart;
        this.#selectEnd = selectEnd;
    }

    undo(layout, setTileMap, setMouseInfo, setCurrTool) {
        if (this.#selectEnd.toString() !== "-1,-1") setCurrTool(Tools.SELECTOR);

        setMouseInfo(prev => ({
            ...prev,
            selectStart: this.#selectStart,
            selectEnd: this.#selectEnd,
            selectDragStart: new Point(-1, -1),
            selectDragEnd: new Point(-1, -1)
        }));
    }

    redo(layout, setTileMap, setMouseInfo, setCurrTool) {
        setCurrTool(Tools.SELECTOR);

        setMouseInfo(prev => ({
            ...prev,
            selectStart: this.redoSelectStart,
            selectEnd: this.redoSelectEnd,
            selectDragStart: new Point(-1, -1),
            selectDragEnd: new Point(-1, -1)
        }));
    }
}

export default SelectAction;
