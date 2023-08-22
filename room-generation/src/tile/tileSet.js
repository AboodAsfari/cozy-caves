const Point = require("../../../utils/point");
const TileSource = require("./tileSource");

/**
 * Represents a map of tile sources, accessible by preset tile types.
 * 
 * @author Abdulrahman Asfari
 */
class TileSet {
    #tileSources = {}; // Maps tile types to tile sources.

    /**
     * Creates an instance of TileSet.
     *
     * @constructor
     * @param floorSource Tile source for floor.
     * @param wallSource Tile source for wall.
     */
    constructor(floorSource, wallSource) {
        if (!floorSource || !wallSource) throw new Error('Invalid source provided.');
        this.#tileSources["floor"] = floorSource.toString();
        this.#tileSources["wall"] = wallSource.toString();
    }

    // Getters.
    getTile(tileType) {
        if (!this.#tileSources.hasOwnProperty(tileType.toString())) throw new Error(`Tile type ${tileType} not found.`); 
        return this.#tileSources[tileType.toString()]; 
    }
}

// Default tileset, will be moved once a proper tileset system is implemented.
const defaultTileset = new TileSet(
    new TileSource("NONREAL_FLOOR", new Point(32, 32)),
    new TileSource("NONREAL_WALL", new Point(32, 32))
);

module.exports = { defaultTileset };
