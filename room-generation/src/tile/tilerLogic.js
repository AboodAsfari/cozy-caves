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
        let rotationChooser = numGen();
        if (rotationChooser < 0.25) tile.setRotation(0);
        else if (rotationChooser < 0.5) tile.setRotation(90);
        else if (rotationChooser < 0.75) tile.setRotation(180);
        else tile.setRotation(270);

        let floorChooser = numGen();
        let altOneChance = 0.1;
        let altTwoChance = 0.1;
        let altThreeChance = 0.1;

        if (floorChooser < altOneChance) return TileID.FLOOR_2;
        if (floorChooser < altOneChance + altTwoChance) return TileID.FLOOR_3;
        if (floorChooser < altOneChance + altTwoChance + altThreeChance) return TileID.FLOOR_4;
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

        function getInnerWall() {
            let wallChooser = numGen();
            let altOneChance = 0.1;
            let altTwoChance = 0.1;
            let altThreeChance = 0.1;

            if (wallChooser < altOneChance) return TileID.INNER_WALL_2;
            if (wallChooser < altOneChance + altTwoChance) return TileID.INNER_WALL_3;
            if (wallChooser < altOneChance + altTwoChance + altThreeChance) return TileID.INNER_WALL_4;
            return TileID.INNER_WALL;
        } 

        if (isWall(rightNeighbor) && isWall(topNeighbor) && isFloor(bottomLeftNeighbor)) {
            tile.setScale(new Point(-1, -1));
            return getInnerWall();
        } else if (isWall(rightNeighbor) && isWall(bottomNeighbor) && isFloor(topLeftNeighbor)) {
            tile.setScale(new Point(-1, 1));
            return getInnerWall();
        } else if (isWall(leftNeighbor) && isWall(topNeighbor) && isFloor(bottomRightNeighbor)) {
            tile.setScale(new Point(1, -1));
            return getInnerWall();
        } else if (isWall(leftNeighbor) && isWall(bottomNeighbor) && isFloor(topRightNeighbor)) {
            tile.setScale(new Point(1, 1));
            return getInnerWall();
        }


        function getCornerWall() {
            let wallChooser = numGen();
            let altOneChance = 0.1;
            let altTwoChance = 0.1;
            let altThreeChance = 0.1;

            if (wallChooser < altOneChance) return TileID.CORNER_WALL_2;
            if (wallChooser < altOneChance + altTwoChance) return TileID.CORNER_WALL_3;
            if (wallChooser < altOneChance + altTwoChance + altThreeChance) return TileID.CORNER_WALL_4;
            return TileID.CORNER_WALL;
        } 

        if (isWall(rightNeighbor) && isWall(bottomNeighbor)) {
            tile.setScale(new Point(1, 1));
            return getCornerWall();
        } else if (isWall(leftNeighbor) && isWall(bottomNeighbor)) {
            tile.setScale(new Point(-1, 1));
            return getCornerWall();
        } else if (isWall(leftNeighbor) && isWall(topNeighbor)) {
            tile.setScale(new Point(-1, -1));
            return getCornerWall();
        } else if (isWall(rightNeighbor) && isWall(topNeighbor)) {
            tile.setScale(new Point(1, -1));
            return getCornerWall();
        } 
        
        function getEdgeWall() {
            let wallChooser = numGen();
            let altOneChance = 0.1;
            let altTwoChance = 0.1;
            let altThreeChance = 0.1;

            if (wallChooser < altOneChance) return TileID.EDGE_WALL_2;
            if (wallChooser < altOneChance + altTwoChance) return TileID.EDGE_WALL_3;
            if (wallChooser < altOneChance + altTwoChance + altThreeChance) return TileID.EDGE_WALL_4;
            return TileID.EDGE_WALL;
        } 

        if (!rightNeighbor) {
            tile.setScale(new Point(-1, 1));
            return getEdgeWall();
        } else if (!topNeighbor) {
            tile.setRotation(90);
            return getEdgeWall();
        } else if (!bottomNeighbor) {
            tile.setRotation(-90);
            return getEdgeWall();
        }
        
        return getEdgeWall();
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
