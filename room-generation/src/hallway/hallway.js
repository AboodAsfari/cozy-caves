const Room = require('../room/room');

class Hallway 
{
    #overlappingRoom;
    #possibleTiles = [];
    #tilesToOpen = new Map();
    #room = new Room();

    setOverlappingRoom(room) { this.#overlappingRoom = room; }
    setRoom(room) { this.#room = room; }

    getOverlappingRoom() { return this.#overlappingRoom; }
    getPossibleTiles() { return this.#possibleTiles; }
    getTilesToOpen() { return this.#tilesToOpen; }
    getRoom() { return this.#room; }
    
    addPossibleTile(tile) { this.#possibleTiles.push(tile); }

    clearPossibleTiles() { this.#possibleTiles = []; }

    addTilesToOpen(roomIndex, worldPositions) {
        if (this.#tilesToOpen.has(roomIndex)) {
            let current = this.#tilesToOpen.get(roomIndex);
            this.#tilesToOpen.set(roomIndex, [current, worldPositions]);
        } else {
            this.#tilesToOpen.set(roomIndex, [worldPositions]);
        }
    }

    merge(hallways) {
        this.#room = this.#room.merge(hallways.map((hallway) => {
            return hallway.getRoom();
        }));
        return this;
    }
}

module.exports = Hallway;