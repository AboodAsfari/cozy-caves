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

module.exports = {
    getNeighbor,
    isWall,
    isFloor,
    chooseRandom
}