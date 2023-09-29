const Room = require('../room/room');

class Hallway 
{
    #overlappingRoom;
    #possibleTiles = [];
    #tilesToOpen = new Map();
    #room = new Room();
    #shape;
    #previousPosition;
    #enteredRooms = new Set();
    #roomEntryPositions = [];

    setOverlappingRoom(room) { this.#overlappingRoom = room; }
    setRoom(room) { this.#room = room; }
    setShape(shape) { this.#shape = shape; }
    setPreviousPosition(position) { this.#previousPosition = position; }

    getOverlappingRoom() { return this.#overlappingRoom; }
    getRoom() { return this.#room; }
    getShape() { return this.#shape; }
    getPossibleTiles() { return this.#possibleTiles; }
    getTilesToOpen() { return this.#tilesToOpen; }
    getPreviousPosition() { return this.#previousPosition; }
    getEnteredRooms() { return this.#enteredRooms; }
    getRoomEntryPositions() { return this.#roomEntryPositions; }
    
    addPossibleTile(tile) { this.#possibleTiles.push(tile); }
    addEnteredRoomIndex(roomIndex) { this.#enteredRooms.add(roomIndex); }
    addRoomEntryPosition(position) { this.#roomEntryPositions.push(position); }

    clearPossibleTiles() { this.#possibleTiles = []; }

    addTilesToOpen(roomIndex, worldPositions) {
        if (this.#tilesToOpen.has(roomIndex)) {
            let updatedArray = this.#tilesToOpen.get(roomIndex).push(worldPositions);
            this.#tilesToOpen.set(roomIndex, updatedArray);
        } else {
            this.#tilesToOpen.set(roomIndex, [worldPositions]);
        }
    }

    merge(hallways) {
        this.#room = this.#room.merge(hallways.map((hallway) => {
            return hallway.getRoom();
        }));
        hallways.forEach(hallway => {
            let otherTilesToOpen = hallway.getTilesToOpen();
            for (const [key, value] of otherTilesToOpen.entries()) {
                if (this.#tilesToOpen.has(key)) {
                    let updated = this.#tilesToOpen.get(key).concat(value);
                    this.#tilesToOpen.set(key, updated);
                } else {
                    this.#tilesToOpen.set(key, value);
                }
            }
        });
        return this;
    }

    toString() {
        return this.#room.toString();
    }
}

module.exports = Hallway;