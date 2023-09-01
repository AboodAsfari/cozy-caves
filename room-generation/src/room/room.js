const Point = require("@cozy-caves/utils").Point;

class Room {
    #tiles = new Map();
    #dimensions;
    #position;
    #propMap;

    constructor(dimensions) {
        if (!Point.isPositivePoint(dimensions)) throw new Error('Invalid dimensions provided.');
        this.#dimensions = dimensions;
    }

    setPosition(pos) {
        if (!(pos instanceof Point)) throw new Error('Invalid position provided.');
        this.#position = pos; 
    }

    setPropMap(propMap) {
        this.#propMap = propMap;
    }

    getRightEdges() { return this.#edgeFetcher(true, false); }
    getLeftEdges() { return this.#edgeFetcher(false, false); }
    getTopEdges() { return this.#edgeFetcher(false, true); }
    getBottomEdges() { return this.#edgeFetcher(true, true); }

    #edgeFetcher(lookingForHigher, verticalEdges) {
        let edges = {};
        for (let tile of this.getTiles()) {
            let pos = tile.getPosition();
            let xComparison = lookingForHigher ? edges[pos.getY()] < pos.getX() : edges[pos.getY()] > pos.getX();
            let yComparison = lookingForHigher ? edges[pos.getX()] < pos.getY() : edges[pos.getX()] > pos.getY();
            if (verticalEdges && (edges[pos.getX()] === undefined || yComparison)) edges[pos.getX()] = pos.getY();
            else if (!verticalEdges && (edges[pos.getY()] === undefined || xComparison)) edges[pos.getY()] = pos.getX();
        }

        let finalList = [];
        for (let keyPos in edges) {
            let pos = verticalEdges ? new Point(parseInt(keyPos), parseInt(edges[keyPos])) : new Point(parseInt(edges[keyPos]), parseInt(keyPos));
            finalList.push(this.getTile(pos));
        }
        return finalList;
    }

    addTile(tile) { this.#tiles.set(tile.getPosition().toString(), tile); }
    getTile(pos) { return this.#tiles.get(pos.toString()); }
    getTiles() { return Array.from(this.#tiles.values()).sort((a, b) => a.getDepth() - b.getDepth()); }
    getPosition() { return this.#position; }
    getDimensions() { return this.#dimensions; }
    getPropMap() { return this.#propMap; }

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
