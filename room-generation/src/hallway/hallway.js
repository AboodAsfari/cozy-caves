const Room = require('../room/room');

class Hallway extends Room{
    #overlappingRoom;
    #possibleTiles = [];

    setOverlappingRoom(room) { this.#overlappingRoom = room; }

    getOverlappingRoom() { return this.#overlappingRoom; }
    getPossibleTiles() { return this.#possibleTiles; }

    addPossibleTile(tile) { this.#possibleTiles.push(tile); }

    clearPossibleTiles() { this.#possibleTiles = []; }

}

module.exports = Hallway;