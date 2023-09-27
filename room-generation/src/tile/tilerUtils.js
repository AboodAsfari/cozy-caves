const getNeighbor = (pos, room, posChange, adjacentRoom, adjacentTileGlobalPositions) => {
    let targetPos = pos.add(posChange);
    if (adjacentTileGlobalPositions && adjacentRoom) {
        for (let adjacentPos of adjacentTileGlobalPositions) {
            let localPos = adjacentPos.subtract(room.getPosition());
            if (localPos.toString() !== targetPos.toString()) continue;
            let localAdjacentPos = adjacentPos.subtract(adjacentRoom.getPosition());
            let adjacentTile = adjacentRoom.getTile(localAdjacentPos);
            if (adjacentTile) return adjacentTile;
        }
    }

    let neighbor = room.getTile(targetPos);
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

module.exports = {
    getNeighbor,
    isWall,
    isFloor,
    chooseRandom
}