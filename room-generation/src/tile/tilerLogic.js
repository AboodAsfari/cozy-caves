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
    getID(tile, room) {
        let tileType = tile.getTileType();
        if (!this.#tileGetters.hasOwnProperty(tileType.toString())) throw new Error(`Tile type ${tileType} not found.`); 
        return this.#tileGetters[tileType.toString()](tile, room); 
    }
}

const getNeighboringWall = (pos, room, posChange) => {
    let neighbor = room.getTile(pos.add(posChange));
    if (neighbor && neighbor.getTileType() === "wall") return neighbor;
    return null; 
};

const getNeighbor = (pos, room, posChange) => {
    let neighbor = room.getTile(pos.add(posChange));
    if (neighbor) return neighbor;
    return null;
}

// Default tileset, will be moved once a proper tileset system is implemented.
const defaultTiler = new TilerLogic(
    () => TileID.FLOOR,
    (tile, room) => {
        let pos = tile.getPosition();
        let leftWallNeighbor =  getNeighboringWall(pos, room, new Point(-1, 0));
        let rightWallNeighbor = getNeighboringWall(pos, room, new Point(1, 0));
        let topWallNeighbor = getNeighboringWall(pos, room, new Point(0, -1));
        let bottomWallNeighbor = getNeighboringWall(pos, room, new Point(0, 1));
        let leftNeighbor = getNeighbor(pos, room, new Point(-1, 0));
        let rightNeighbor = getNeighbor(pos, room, new Point(1, 0));
        let topNeighbor = getNeighbor(pos, room, new Point(0, -1));
        let bottomNeighbor = getNeighbor(pos, room, new Point(0, 1)); 

        if (rightWallNeighbor && bottomWallNeighbor) {
            tile.setScale(new Point(1, 1));
            return TileID.CORNER_WALL;
        } else if (leftWallNeighbor && bottomWallNeighbor) {
            tile.setScale(new Point(-1, 1));
            return TileID.CORNER_WALL;
        } else if (leftWallNeighbor && topWallNeighbor) {
            tile.setScale(new Point(-1, -1));
            return TileID.CORNER_WALL;
        } else if (rightWallNeighbor && topWallNeighbor) {
            tile.setScale(new Point(1, -1));
            return TileID.CORNER_WALL;
        } else if (!rightNeighbor) {
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
