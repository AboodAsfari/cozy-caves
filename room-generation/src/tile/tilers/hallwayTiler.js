const Point = require("@cozy-caves/utils").Point;
const TileID = require("@cozy-caves/utils").TileID;
const TileSpacialType = require("@cozy-caves/utils").TileSpacialType;

const { getNeighbor, isWall, isFloor, chooseRandom } = require("../tilerUtils");
const { defaultFloorTiler } = require("./defaultTiler");

const hallwayWallTiler = (tile, room, numGen) => {
    let pos = tile.getPosition();
    let leftNeighbor = getNeighbor(pos, room, new Point(-1, 0));
    let rightNeighbor = getNeighbor(pos, room, new Point(1, 0));
    let topNeighbor = getNeighbor(pos, room, new Point(0, -1));
    let bottomNeighbor = getNeighbor(pos, room, new Point(0, 1)); 
    let topRightNeighbor = getNeighbor(pos, room, new Point(1, -1));
    let topLeftNeighbor = getNeighbor(pos, room, new Point(-1, -1));
    let bottomRightNeighbor = getNeighbor(pos, room, new Point(1, 1));
    let bottomLeftNeighbor = getNeighbor(pos, room, new Point(-1, 1));

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

    if (!isFloor(rightNeighbor) && !isFloor(leftNeighbor) && topNeighbor && bottomNeighbor && (isWall(rightNeighbor) || isWall(leftNeighbor)) &&
        (isWall(topLeftNeighbor) || isWall(topRightNeighbor) || isWall(bottomLeftNeighbor) || isWall(bottomRightNeighbor))) {
        if (!isFloor(topNeighbor)) {
            tile.setRotation(90);
            return getEdgeWall(TileSpacialType.TOP_EDGE_WALL);
        } else if (isWall(bottomNeighbor)) {
            tile.setRotation(-90);
            return getEdgeWall(TileSpacialType.BOTTOM_EDGE_WALL);
        }
    } else if (!isFloor(topNeighbor) && !isFloor(bottomNeighbor) && leftNeighbor && rightNeighbor && (isWall(topNeighbor) || isWall(bottomNeighbor)) &&
        (isWall(topLeftNeighbor) || isWall(topRightNeighbor) || isWall(bottomLeftNeighbor) || isWall(bottomRightNeighbor))) {
        if (!isFloor(leftNeighbor)) {
            tile.setScale(new Point(1, 1));
            return getEdgeWall(TileSpacialType.LEFT_EDGE_WALL);
        } else if (isWall(rightNeighbor)) {
            tile.setScale(new Point(-1, 1));
            return getEdgeWall(TileSpacialType.RIGHT_EDGE_WALL);
        }
    }

    if (isWall(rightNeighbor) && isWall(topNeighbor) && (isFloor(bottomLeftNeighbor) || !topRightNeighbor)) return getInnerWall(new Point(-1, -1), TileSpacialType.BOTTOM_LEFT_INNER_WALL);
    else if (isWall(rightNeighbor) && isWall(bottomNeighbor) && (isFloor(topLeftNeighbor) || !bottomRightNeighbor)) return getInnerWall(new Point(-1, 1), TileSpacialType.TOP_LEFT_INNER_WALL);
    else if (isWall(leftNeighbor) && isWall(topNeighbor) && (isFloor(bottomRightNeighbor) || !topLeftNeighbor)) return getInnerWall(new Point(1, -1), TileSpacialType.BOTTOM_RIGHT_INNER_WALL);
    else if (isWall(leftNeighbor) && isWall(bottomNeighbor) && (isFloor(topRightNeighbor) || !bottomLeftNeighbor)) return getInnerWall(new Point(1, 1), TileSpacialType.TOP_RIGHT_INNER_WALL);

    if (isWall(rightNeighbor) && isWall(bottomNeighbor) && !isFloor(topNeighbor)) return getCornerWall(new Point(1, 1), TileSpacialType.TOP_LEFT_CORNER_WALL);
    else if (isWall(leftNeighbor) && isWall(bottomNeighbor) && !isFloor(topNeighbor)) return getCornerWall(new Point(-1, 1), TileSpacialType.TOP_RIGHT_CORNER_WALL);
    else if (isWall(leftNeighbor) && isWall(topNeighbor) && !isFloor(bottomNeighbor)) return getCornerWall(new Point(-1, -1), TileSpacialType.BOTTOM_RIGHT_CORNER_WALL);
    else if (isWall(rightNeighbor) && isWall(topNeighbor) && !isFloor(bottomNeighbor)) return getCornerWall(new Point(1, -1), TileSpacialType.BOTTOM_LEFT_CORNER_WALL);
    
    if (!isWall(rightNeighbor) && !isWall(leftNeighbor) && !isWall(topNeighbor) && !isWall(bottomNeighbor)) {
        if (isFloor(topNeighbor)) {
            tile.setRotation(-90);
            return getEdgeWall(TileSpacialType.BOTTOM_EDGE_WALL);
        } else if (isFloor(bottomNeighbor)) {
            tile.setRotation(90);
            return getEdgeWall(TileSpacialType.TOP_EDGE_WALL);
        } else if (isFloor(rightNeighbor)) {
            tile.setScale(new Point(1, 1));
            return getEdgeWall(TileSpacialType.RIGHT_EDGE_WALL);
        } else if (isFloor(leftNeighbor)) {
            tile.setScale(new Point(-1, 1));
            return getEdgeWall(TileSpacialType.LEFT_EDGE_WALL);
        }
    }

    if (isWall(rightNeighbor) || isWall(leftNeighbor)) {
        if (!isFloor(topNeighbor)) {
            tile.setRotation(90);
            return getEdgeWall(TileSpacialType.TOP_EDGE_WALL);
        } else {
            tile.setRotation(-90);
            return getEdgeWall(TileSpacialType.BOTTOM_EDGE_WALL);
        }
    } else {
        if (!isFloor(rightNeighbor) && (rightNeighbor || (!isFloor(topRightNeighbor) && !isFloor(bottomRightNeighbor)))) {
            tile.setScale(new Point(-1, 1));
            return getEdgeWall(TileSpacialType.LEFT_EDGE_WALL);
        } else {
            tile.setScale(new Point(1, -1));
            return getEdgeWall(TileSpacialType.RIGHT_EDGE_WALL);
        }   
    }
}

const hallwayTileUpdater = (tile, room, numGen) => {
    let pos = tile.getPosition();
    let leftNeighbor = getNeighbor(pos, room, new Point(-1, 0));
    let rightNeighbor = getNeighbor(pos, room, new Point(1, 0));
    let topNeighbor = getNeighbor(pos, room, new Point(0, -1));
    let bottomNeighbor = getNeighbor(pos, room, new Point(0, 1)); 

    if ((isFloor(rightNeighbor) && isFloor(leftNeighbor)) || (isFloor(topNeighbor) && isFloor(bottomNeighbor))) tile.setTileType("floor");
}

module.exports = { hallwayWallTiler, hallwayTileUpdater };
