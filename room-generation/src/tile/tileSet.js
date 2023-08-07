const TileSource = require("./tileSource");

class TileSet {
    #tileSources = {};

    constructor(floorSource, wallSource) {
        if (!floorSource || !wallSource) throw new Error('Invalid source provided.');
        this.#tileSources["floor"] = floorSource.toString();
        this.#tileSources["wall"] = wallSource.toString();
    }

    getTile(tileType) {
        if (!this.#tileSources.hasOwnProperty(tileType)) throw new Error(`Tile type ${tileType} not found.`); 
        return this.#tileSources[tileType]; 
    }
}

const defaultSet = new TileSet(
    new TileSource("NONREAL_FLOOR", 32, 32),
    new TileSource("NONREAL_WALL", 32, 32)
);

module.exports = { defaultSet };
