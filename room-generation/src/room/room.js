const Point = require("@cozy-caves/utils").Point;

class Room {
    #tiles = new Map();
    #dimensions;

    constructor(dimensions) {
        if (!Point.isPositivePoint(dimensions)) throw new Error('Invalid dimensions provided.');
        this.#dimensions = dimensions;
    }

    addTile(tile) { this.#tiles.set(tile.getPosition().toString(), tile); }
    getTile(pos) { return this.#tiles.get(pos.toString()); }
    getTiles() { return Array.from(this.#tiles.values()).sort((a, b) => a.getDepth() - b.getDepth()); }

    getDimensions() { return this.#dimensions; }

    toString() {
        let tileArray = [];
        for (let i = 0; i < this.#dimensions.getY(); i++) {
            tileArray.push("");
            for (let j = 0; j < this.#dimensions.getX(); j++) {
                let tile = this.getTile(new Point(j, i).toString());
                if (!tile) tileArray[i] += "X";
                else if (tile.getTileType() === "floor") tileArray[i] += "O";
                else tileArray[i] += "I";
                tileArray[i] += "  ";
            }
        }
        let finalString = tileArray.join("\n");
        return finalString.substring(0, finalString.length - 1);
    }
}

module.exports = Room;
