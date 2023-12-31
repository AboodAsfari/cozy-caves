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
    #roomExitPositions = new Map();
    #extraIndex = -1;

    setOverlappingRoom(room) { this.#overlappingRoom = room; }
    setRoom(room) { this.#room = room; }
    setShape(shape) { this.#shape = shape; }
    setPreviousPosition(position) { this.#previousPosition = position; }
    setExtraIndex(index) { this.#extraIndex = index; }

    getOverlappingRoom() { return this.#overlappingRoom; }
    getRoom() { return this.#room; }
    getShape() { return this.#shape; }
    getPossibleTiles() { return this.#possibleTiles; }
    getTilesToOpen() { return this.#tilesToOpen; }
    getPreviousPosition() { return this.#previousPosition; }
    getEnteredRooms() { return this.#enteredRooms; }
    getRoomEntryPositions() { return this.#roomEntryPositions; }
    getRoomExitPositions() { return this.#roomExitPositions; }
    getExtraIndex() { return this.#extraIndex; }

    
    addPossibleTile(tile) { this.#possibleTiles.push(tile); }
    addEnteredRoomIndex(roomIndex) { this.#enteredRooms.add(roomIndex); }
    addRoomEntryPosition(position) { this.#roomEntryPositions.push(position); }
    addRoomExitPosition(index, position) { this.#roomExitPositions.set(index, position); }

    clearPossibleTiles() { this.#possibleTiles = []; }

    addTilesToOpen(roomIndex, tilesToOpen) {
        if (this.#tilesToOpen.has(roomIndex)) {
            this.#tilesToOpen.get(roomIndex).push(tilesToOpen);
        } else {
            this.#tilesToOpen.set(roomIndex, [tilesToOpen]);
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