const Point = require("@cozy-caves/utils").Point;

/**
 * Represents a tile in the room.
 * 
 * @author Abdulrahman Asfari
 */
class Tile {
    #tileType; // Type of tile to display.
    #tileID; // ID of tile to display.
    #partitionNum = -1; // Index of the partition this tile belongs in.
    #position; // Position of the tile in the room.
    #offset = new Point(0, 0); // Rendering offset.
    #scale = new Point(1, 1); // Image scale.
    #rotation = 0; // Rendering rotation.
    #depth = 0; // Rendering depth.

    /**
     * Creates an instance of Tile.
     *
     * @constructor
     * @param tileType Type of tile, e.g. "floor".
     * @param position Position of the tile in the room.
     */
    constructor(tileType, position, partitionNum = -1) {
        if (!tileType || !(position instanceof Point)) throw new Error('Invalid tile provided.');
        if (!Number.isInteger(partitionNum) || partitionNum < -2) throw new Error('Invalid partition number provided.');
        this.#tileType = tileType.toString();
        this.#position = position;
        this.#partitionNum = partitionNum;
    }

    // Setters.
    setTileID(tileID) { this.#tileID = tileID; }
    setPartitionNum(partitionNum) { this.#partitionNum = partitionNum; }
    setOffset(offset) { this.#offset = offset; }
    setScale(scale) { this.#scale = scale; }
    setRotation(rotation) { this.#rotation = rotation; }
    setDepth(depth) { this.#depth = depth; }

    // Getters.
    getTileType() { return this.#tileType; }
    getTileID() { return this.#tileID; }
    getPartitionNum() { return this.#partitionNum; }
    getPosition() { return this.#position; }
    getOffset() { return this.#offset; }
    getScale() { return this.#scale; }
    getRotation() { return this.#rotation; }
    getDepth() { return this.#depth; }
    

    /**
     * Creates a clone of the tile, optionally
     * at a new position
     *
     * @param pos New position to clone tile at.
     * @returns Cloned tile.
     */
    clone(pos = this.#position) { return new Tile(this.#tileType, pos.clone(), this.#partitionNum); }
}

module.exports = Tile;
