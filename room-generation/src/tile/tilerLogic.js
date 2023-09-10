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

const chooseRandom = (optionMap, defaultOption, numGen) => {
    let chooser = numGen();
    let chanceAccumulator = 0;
    for (let option in optionMap) {
        chanceAccumulator += optionMap[option];
        if (chooser < chanceAccumulator) return option;
    }
    return defaultOption;
}

const defaultTiler = new TilerLogic(
    (tile, room, numGen) => {
        tile.setRotation(chooseRandom({
            0: 0.25,
            90: 0.5,
            180: 0.75
        }, 270, numGen));

        return parseInt(chooseRandom({
            [TileID.FLOOR_2]: 0.1,
            [TileID.FLOOR_3]: 0.1,
            [TileID.FLOOR_4]: 0.1
        }, TileID.FLOOR, numGen));
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

        function getEdgeWall() {
            return parseInt(chooseRandom({
                [TileID.EDGE_WALL_2]: 0.1,
                [TileID.EDGE_WALL_3]: 0.1,
                [TileID.EDGE_WALL_4]: 0.1
            }, TileID.EDGE_WALL, numGen));
        } 

        function getCornerWall(scale) {
            tile.setScale(scale);

            return parseInt(chooseRandom({
                [TileID.CORNER_WALL_2]: 0.1,
                [TileID.CORNER_WALL_3]: 0.1,
                [TileID.CORNER_WALL_4]: 0.1
            }, TileID.CORNER_WALL, numGen));
        } 

        function getInnerWall(scale) {
            tile.setScale(scale);

            return parseInt(chooseRandom({
                [TileID.INNER_WALL_2]: 0.1,
                [TileID.INNER_WALL_3]: 0.1,
                [TileID.INNER_WALL_4]: 0.1
            }, TileID.INNER_WALL, numGen));
        } 

        if (isWall(rightNeighbor) && isWall(topNeighbor) && isFloor(bottomLeftNeighbor)) return getInnerWall(new Point(-1, -1));
        else if (isWall(rightNeighbor) && isWall(bottomNeighbor) && isFloor(topLeftNeighbor)) return getInnerWall(new Point(-1, 1));
        else if (isWall(leftNeighbor) && isWall(topNeighbor) && isFloor(bottomRightNeighbor)) return getInnerWall(new Point(1, -1));
        else if (isWall(leftNeighbor) && isWall(bottomNeighbor) && isFloor(topRightNeighbor)) return getInnerWall(new Point(1, 1));

        if (isWall(rightNeighbor) && isWall(bottomNeighbor)) return getCornerWall(new Point(1, 1));
        else if (isWall(leftNeighbor) && isWall(bottomNeighbor)) return getCornerWall(new Point(-1, 1));
        else if (isWall(leftNeighbor) && isWall(topNeighbor)) return getCornerWall(new Point(-1, -1));
        else if (isWall(rightNeighbor) && isWall(topNeighbor)) return getCornerWall(new Point(1, -1));
        
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
