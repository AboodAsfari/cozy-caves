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

// Default tileset, will be moved once a proper tileset system is implemented.
const defaultTiler = new TilerLogic(
    () => TileID.FLOOR,
    (tile, room) => {
        let pos = tile.getPosition();
        let leftNeighbor =  getNeighboringWall(pos, room, new Point(-1, 0));
        let rightNeighbor = getNeighboringWall(pos, room, new Point(1, 0));
        let topNeighbor = getNeighboringWall(pos, room, new Point(0, -1));
        let bottomNeighbor = getNeighboringWall(pos, room, new Point(0, 1));

        if (rightNeighbor && bottomNeighbor) {
            tile.setScale(new Point(1, 1));
            return TileID.CORNER_WALL;
        } else if (leftNeighbor && bottomNeighbor) {
            tile.setScale(new Point(-1, 1));
            return TileID.CORNER_WALL;
        } else if (leftNeighbor && topNeighbor) {
            tile.setScale(new Point(-1, -1));
            return TileID.CORNER_WALL;
        } else if (rightNeighbor && topNeighbor) {
            tile.setScale(new Point(1, -1));
            return TileID.CORNER_WALL;
        } else return TileID.EDGE_WALL;
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
