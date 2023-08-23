const Point = require("@cozy-caves/utils").Point;

/**
 * Represents a map of tile getters, accessible by preset tile types.
 * 
 * @author Abdulrahman Asfari
 */
class TileSet {
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
    getTile(tile, room) {
        let tileType = tile.getTileType();
        if (!this.#tileGetters.hasOwnProperty(tileType.toString())) throw new Error(`Tile type ${tileType} not found.`); 
        return this.#tileGetters[tileType.toString()](tile, room); 
    }
}

// Default tileset, will be moved once a proper tileset system is implemented.
const defaultTileset = new TileSet(
    () => 0,
    (tile, room) => tile.getTileType()
);

module.exports = { defaultTileset };
