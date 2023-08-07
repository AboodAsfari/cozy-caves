class Tile {
    #tileType;
    #position;
    #offset = { x: 0, y: 0 };
    #rotation = 0;
    #depth = 0;

    constructor(tileType, position) {
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
