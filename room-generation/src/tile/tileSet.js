const Point = require("../../../utils/point");
const TileSource = require("./tileSource");

class TileSet {
    #tileSources = {};

    constructor(floorSource, wallSource) {
        if (!floorSource || !wallSource) throw new Error('Invalid source provided.');
        this.#tileSources["floor"] = floorSource.toString();
        this.#tileSources["wall"] = wallSource.toString();
    }

    getTile(tileType) {
        if (!this.#tileSources.hasOwnProperty(tileType.toString())) throw new Error(`Tile type ${tileType} not found.`); 
        return this.#tileSources[tileType.toString()]; 
    }
}

const defaultSet = new TileSet(
    new TileSource("NONREAL_FLOOR", new Point(32, 32)),
    new TileSource("NONREAL_WALL", new Point(32, 32))
);

module.exports = { defaultSet };
