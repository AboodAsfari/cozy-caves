const Point = require("../../../utils/point");

class Tile {
    #tileType;
    #position;
    #offset = new Point(0, 0);
    #rotation = 0;
    #depth = 0;

    constructor(tileType, position) {
        if (!tileType || !(position instanceof Point)) throw new Error('Invalid tile provided.');
        this.#tileType = tileType;
        this.#position = position;
    }

    getTileType() { return this.#tileType; }
    getPosition() { return this.#position; }
    getOffset() { return this.#offset; }
    getRotation() { return this.#rotation; }
    getDepth() { return this.#depth; }
}

module.exports = Tile;
