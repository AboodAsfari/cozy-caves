const Point = require("@cozy-caves/utils").Point;
const TileID = require("@cozy-caves/utils").TileID;
const TileSpacialType = require("@cozy-caves/utils").TileSpacialType;

const Tile = require("../tile");
const { getNeighbor, isWall, isFloor, chooseRandom } = require("../tilerUtils");

const defaultFloorTiler = (tile, room, numGen) => {
    tile.setRotation(chooseRandom({
        0: 0.25,
        90: 0.5,
        180: 0.75
    }, 270, numGen));

    tile.setTileSpacialType(TileSpacialType.FLOOR);

    return parseInt(chooseRandom({
        [TileID.FLOOR_2]: 0.1,
        [TileID.FLOOR_3]: 0.1,
        [TileID.FLOOR_4]: 0.1
    }, TileID.FLOOR, numGen));
}

const defaultWallTiler = (tile, room, numGen, adjacentRoom, adjacentTileGlobalPositions) => {
    tile.setRotation(0);
    tile.setScale(new Point(1, 1));

    let pos = tile.getPosition();
    let leftNeighbor = getNeighbor(pos, room, new Point(-1, 0), adjacentRoom, adjacentTileGlobalPositions);
    let rightNeighbor = getNeighbor(pos, room, new Point(1, 0), adjacentRoom, adjacentTileGlobalPositions);
    let topNeighbor = getNeighbor(pos, room, new Point(0, -1), adjacentRoom, adjacentTileGlobalPositions);
    let bottomNeighbor = getNeighbor(pos, room, new Point(0, 1), adjacentRoom, adjacentTileGlobalPositions); 
    let topRightNeighbor = getNeighbor(pos, room, new Point(1, -1), adjacentRoom, adjacentTileGlobalPositions);
    let topLeftNeighbor = getNeighbor(pos, room, new Point(-1, -1), adjacentRoom, adjacentTileGlobalPositions);
    let bottomRightNeighbor = getNeighbor(pos, room, new Point(1, 1), adjacentRoom, adjacentTileGlobalPositions);
    let bottomLeftNeighbor = getNeighbor(pos, room, new Point(-1, 1), adjacentRoom, adjacentTileGlobalPositions);

    function getEdgeWall(spacialType) {
        tile.setTileSpacialType(spacialType);

        return parseInt(chooseRandom({
            [TileID.EDGE_WALL_2]: 0.1,
            [TileID.EDGE_WALL_3]: 0.1,
            [TileID.EDGE_WALL_4]: 0.1
        }, TileID.EDGE_WALL, numGen));
    } 

    function getCornerWall(scale, spacialType) {
        tile.setScale(scale);
        tile.setTileSpacialType(spacialType);

        return parseInt(chooseRandom({
            [TileID.CORNER_WALL_2]: 0.1,
            [TileID.CORNER_WALL_3]: 0.1,
            [TileID.CORNER_WALL_4]: 0.1
        }, TileID.CORNER_WALL, numGen));
    } 

    function getInnerWall(scale, spacialType) {
        tile.setScale(scale);
        tile.setTileSpacialType(spacialType);

        return parseInt(chooseRandom({
            [TileID.INNER_WALL_2]: 0.1,
            [TileID.INNER_WALL_3]: 0.1,
            [TileID.INNER_WALL_4]: 0.1
        }, TileID.INNER_WALL, numGen));
    } 

    if (isWall(rightNeighbor) && isWall(topNeighbor) && ((isFloor(bottomLeftNeighbor) && bottomRightNeighbor && topLeftNeighbor) || !topRightNeighbor)) return getInnerWall(new Point(-1, -1), TileSpacialType.BOTTOM_LEFT_INNER_WALL);
    else if (isWall(rightNeighbor) && isWall(bottomNeighbor) && ((isFloor(topLeftNeighbor) && topRightNeighbor && bottomLeftNeighbor) || !bottomRightNeighbor)) return getInnerWall(new Point(-1, 1), TileSpacialType.TOP_LEFT_INNER_WALL);
    else if (isWall(leftNeighbor) && isWall(topNeighbor) && ((isFloor(bottomRightNeighbor) && bottomLeftNeighbor && topRightNeighbor) || !topLeftNeighbor)) return getInnerWall(new Point(1, -1), TileSpacialType.BOTTOM_RIGHT_INNER_WALL);
    else if (isWall(leftNeighbor) && isWall(bottomNeighbor) && ((isFloor(topRightNeighbor) && topLeftNeighbor && bottomRightNeighbor) || !bottomLeftNeighbor)) return getInnerWall(new Point(1, 1), TileSpacialType.TOP_RIGHT_INNER_WALL);

    if (isWall(rightNeighbor) && isWall(bottomNeighbor)) return getCornerWall(new Point(1, 1), TileSpacialType.TOP_LEFT_CORNER_WALL);
    else if (isWall(leftNeighbor) && isWall(bottomNeighbor)) return getCornerWall(new Point(-1, 1), TileSpacialType.TOP_RIGHT_CORNER_WALL);
    else if (isWall(leftNeighbor) && isWall(topNeighbor)) return getCornerWall(new Point(-1, -1), TileSpacialType.BOTTOM_RIGHT_CORNER_WALL);
    else if (isWall(rightNeighbor) && isWall(topNeighbor)) return getCornerWall(new Point(1, -1), TileSpacialType.BOTTOM_LEFT_CORNER_WALL);
    
    if (!rightNeighbor) {
        tile.setScale(new Point(-1, 1));
        return getEdgeWall(TileSpacialType.LEFT_EDGE_WALL);
    } else if (!topNeighbor) {
        tile.setRotation(90);
        return getEdgeWall(TileSpacialType.TOP_EDGE_WALL);
    } else if (!bottomNeighbor) {
        tile.setRotation(-90);
        return getEdgeWall(TileSpacialType.BOTTOM_EDGE_WALL);
    }
    
    tile.setTileSpacialType(TileSpacialType.RIGHT_EDGE_WALL);
    return getEdgeWall();
}

module.exports = { defaultFloorTiler, defaultWallTiler };
