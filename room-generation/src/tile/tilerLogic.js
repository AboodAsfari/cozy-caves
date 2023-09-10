const Point = require("@cozy-caves/utils").Point;
const TileID = require("@cozy-caves/utils").TileID;

/**
 * Represents a map of tile getters, accessible by preset tile types.
 * 
 * @author Abdulrahman Asfari
 */
class TilerLogic {
    #tileGetters = {}; // Maps tile types to tile getters.

    /**
     * Creates an instance of TileSet.
     *
     * @constructor
     * @param floorGetter Callback method to get floor ID.
     * @param wallGetter Callback method to get wall ID.
     */
    constructor(floorGetter, wallGetter) {
        if (typeof floorGetter !== "function" || typeof wallGetter !== "function") throw new Error('Invalid getter provided.'); 
        this.#tileGetters["floor"] = floorGetter;
        this.#tileGetters["wall"] = wallGetter;
    }

    // Getters.
    getID(tile, room, numGen) {
        let tileType = tile.getTileType();
        if (!this.#tileGetters.hasOwnProperty(tileType.toString())) throw new Error(`Tile type ${tileType} not found.`); 
        return this.#tileGetters[tileType.toString()](tile, room, numGen); 
    }
}

const getNeighbor = (pos, room, posChange) => {
    let neighbor = room.getTile(pos.add(posChange));
    if (neighbor) return neighbor;
    return null;
}

const isWall = (tile) => tile && tile.getTileType() === "wall";
const isFloor = (tile) => tile && tile.getTileType() === "floor";

// Default tileset, will be moved once a proper tileset system is implemented.
const defaultTiler = new TilerLogic(
    (tile, room, numGen) => {
        let random = 0;
        return TileID.FLOOR;
    },
    (tile, room, numGen) => {
        let pos = tile.getPosition();
        let leftNeighbor = getNeighbor(pos, room, new Point(-1, 0));
        let rightNeighbor = getNeighbor(pos, room, new Point(1, 0));
        let topNeighbor = getNeighbor(pos, room, new Point(0, -1));
        let bottomNeighbor = getNeighbor(pos, room, new Point(0, 1)); 
        let topRightNeighbor = getNeighbor(pos, room, new Point(1, -1));
        let topLeftNeighbor = getNeighbor(pos, room, new Point(-1, -1));
        let bottomRightNeighbor = getNeighbor(pos, room, new Point(1, 1));
        let bottomLeftNeighbor = getNeighbor(pos, room, new Point(-1, 1));

        if (isWall(rightNeighbor) && isWall(topNeighbor) && isFloor(bottomLeftNeighbor)) {
            tile.setScale(new Point(-1, -1));
            return TileID.INNER_WALL;
        } else if (isWall(rightNeighbor) && isWall(bottomNeighbor) && isFloor(topLeftNeighbor)) {
            tile.setScale(new Point(-1, 1));
            return TileID.INNER_WALL;
        } else if (isWall(leftNeighbor) && isWall(topNeighbor) && isFloor(bottomRightNeighbor)) {
            tile.setScale(new Point(1, -1));
            return TileID.INNER_WALL;
        } else if (isWall(leftNeighbor) && isWall(bottomNeighbor) && isFloor(topRightNeighbor)) {
            tile.setScale(new Point(1, 1));
            return TileID.INNER_WALL;
        }

        if (isWall(rightNeighbor) && isWall(bottomNeighbor)) {
            tile.setScale(new Point(1, 1));
            return TileID.CORNER_WALL;
        } else if (isWall(leftNeighbor) && isWall(bottomNeighbor)) {
            tile.setScale(new Point(-1, 1));
            return TileID.CORNER_WALL;
        } else if (isWall(leftNeighbor) && isWall(topNeighbor)) {
            tile.setScale(new Point(-1, -1));
            return TileID.CORNER_WALL;
        } else if (isWall(rightNeighbor) && isWall(topNeighbor)) {
            tile.setScale(new Point(1, -1));
            return TileID.CORNER_WALL;
        } 
        
        if (!rightNeighbor) {
            tile.setScale(new Point(-1, 1));
            return TileID.EDGE_WALL;
        } else if (!topNeighbor) {
            tile.setRotation(90);
            return TileID.EDGE_WALL;
        } else if (!bottomNeighbor) {
            tile.setRotation(-90);
            return TileID.EDGE_WALL;
        }
        
        return TileID.EDGE_WALL;
    }
);

const tilerChooser = {
    getTiler(tiler) {
        if (!tiler || this.hasOwnProperty(tiler.toString())) return defaultTiler;
        return this[tiler.toString() + "Tiler"];
    }, 
    defaultTiler
}

module.exports = { tilerChooser };
