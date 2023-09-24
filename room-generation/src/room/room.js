const Tile = require("../tile/tile");

const Point = require("@cozy-caves/utils").Point;

class Room {
    #tiles = new Map();
    #dimensions = new Point(0, 0);
    #position;
    #propMap;

    setPosition(pos) {
        this.#position = pos; 
    }

    setPropMap(propMap) {
        this.#propMap = propMap;
    }

    merge(rooms) {
        let finalRoom = new Room();
        rooms.push(this);
        
        let minX = Number.MAX_SAFE_INTEGER;
        let minY = Number.MAX_SAFE_INTEGER;
        for (let room of rooms) {
            minX = Math.min(minX, room.getDimensions().getX());
            minY = Math.min(minY, room.getDimensions().getY());
        }
        finalRoom.setPosition(new Point(minX, minY));

        for (let room of rooms) {
            for (let tile of room.getTiles()) {
                let globalPos = tile.getPosition().add(room.getPosition());
                let newLocalPos = globalPos.subtract(finalRoom.getPosition());
                if (!finalRoom.getTile(newLocalPos) || finalRoom.getTile(newLocalPos).getTileType() === "wall") finalRoom.addTile(tile.clone(newLocalPos));
            }
        }

        return finalRoom;
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

    addTile(tile) { 
        this.#tiles.set(tile.getPosition().toString(), tile); 
        let maxEncountered = new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        let minEncountered = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        for (let tile of this.#tiles.values()) {
            if (tile.getPosition().getX() > maxEncountered.getX()) maxEncountered.setX(tile.getPosition().getX());
            if (tile.getPosition().getX() < minEncountered.getX()) minEncountered.setX(tile.getPosition().getX());
            if (tile.getPosition().getY() > maxEncountered.getY()) maxEncountered.setY(tile.getPosition().getY());
            if (tile.getPosition().getY() < minEncountered.getY()) minEncountered.setY(tile.getPosition().getY());
        }

        let width = maxEncountered.getX() - minEncountered.getX() + 1;
        let height = maxEncountered.getY() - minEncountered.getY() + 1;
        this.#dimensions = new Point(width, height);
    }
    getTile(pos) { return this.#tiles.get(pos.toString()); }
    getTiles() { return Array.from(this.#tiles.values()).sort((a, b) => a.getDepth() - b.getDepth()); }
    getPosition() { return this.#position; }
    getDimensions() { return this.#dimensions; }
    getPropMap() { return this.#propMap; }

    getSerializableRoom() {
        return {
            position: this.#position.toString(),
            tiles: Array.from(this.#tiles.values()).map(tile => tile.getSerializableTile())
        };
    }

    static fromSerializableRoom(serializableRoom) {
        let room = new Room();
        let posArray = serializableRoom.position.split(',');
        room.#position = new Point(parseInt(posArray[0]), parseInt(posArray[1]));
        serializableRoom.tiles.forEach(tile => room.addTile(Tile.fromSerializableTile(tile)));
        return room;
    }

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
