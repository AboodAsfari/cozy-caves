const { defaultFloorTiler, defaultWallTiler } = require("./tilers/defaultTiler");
const { hallwayWallTiler } = require("./tilers/hallwayTiler");

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

const tilerChooser = {
    getTiler(tiler) {
        if (!tiler || this.hasOwnProperty(tiler.toString())) return defaultTiler;
        return this[tiler.toString() + "Tiler"];
    }, 
    defaultTiler: new TilerLogic(defaultFloorTiler, defaultWallTiler),
    hallwayTiler: new TilerLogic(defaultFloorTiler, hallwayWallTiler),
}

module.exports = { tilerChooser };
