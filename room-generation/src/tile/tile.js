const Point = require("@cozy-caves/utils").Point;

/**
 * Represents a tile in the room.
 * 
 * @author Abdulrahman Asfari
 */
class Tile {
    #tileType; // Type of tile to display.
    #tileID; // ID of tile to display.
    #tileSpacialType; // Spacial type of tile logically.
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
        if (!tileType) throw new Error('Invalid tile provided.');
        if (!Number.isInteger(partitionNum) || partitionNum < -2) throw new Error('Invalid partition number provided.');
        this.#tileType = tileType.toString();
        this.#position = position;
        this.#partitionNum = partitionNum;
    }

    // Setters.
    setTileType(tileType) { this.#tileType = tileType; }
    setTileID(tileID) { this.#tileID = tileID; }
    setTileSpacialType(tileSpacialType) { this.#tileSpacialType = tileSpacialType; }
    setPartitionNum(partitionNum) { this.#partitionNum = partitionNum; }
    setOffset(offset) { this.#offset = offset; }
    setScale(scale) { this.#scale = scale; }
    setRotation(rotation) { this.#rotation = rotation; }
    setDepth(depth) { this.#depth = depth; }

    // Getters.
    getTileType() { return this.#tileType; }
    getTileID() { return this.#tileID; }
    getTileSpacialType() { return this.#tileSpacialType; }
    getPartitionNum() { return this.#partitionNum; }
    getPosition() { return this.#position; }
    getOffset() { return this.#offset; }
    getScale() { return this.#scale; }
    getRotation() { return this.#rotation; }
    getDepth() { return this.#depth; }
    
    /**
     * Creates a new object with information needed to save the tile.
     * 
     * @returns Serializable tile object.
     */
    getSerializableTile() {
        return {
            tileType: this.#tileType,
            tileID: this.#tileID,
            tileSpacialType: this.#tileSpacialType,
            position: this.#position.toString(),
            partitionNum: this.#partitionNum,
            offset: this.#offset.toString(),
            scale: this.#scale.toString(),
            rotation: this.#rotation,
            depth: this.#depth
        };
    }

    /**
     * Reads a stringified serializable tile and converts it 
     * to a full tile object.
     * 
     * @returns Tile.
     */
    static fromSerializableTile(serializedTile) {
        let posArray = serializedTile.position.split(',');
        let pos = new Point(parseInt(posArray[0]), parseInt(posArray[1]));
        let tile = new Tile(serializedTile.tileType, pos, serializedTile.partitionNum);

        if (serializedTile.tileID !== 0 && !serializedTile.tileID) return tile;

        tile.setTileID(serializedTile.tileID);
        tile.setTileSpacialType(serializedTile.tileSpacialType);
        let offsetArray = serializedTile.offset.split(',');
        tile.setOffset(new Point(parseInt(offsetArray[0]), parseInt(offsetArray[1])));
        let scaleArray = serializedTile.scale.split(',');
        tile.setScale(new Point(parseInt(scaleArray[0]), parseInt(scaleArray[1])));
        tile.setRotation(serializedTile.rotation);
        tile.setDepth(serializedTile.depth);

        return tile;
    }

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
