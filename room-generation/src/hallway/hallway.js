const Room = require('../room/room');

class Hallway 
{
    #overlappingRoom;
    #possibleTiles = [];
    #tilesToOpen = new Map();
    #room = new Room();
    #shape;

    setOverlappingRoom(room) { this.#overlappingRoom = room; }
    setRoom(room) { this.#room = room; }
    setShape(shape) { this.#shape = shape; }

    getOverlappingRoom() { return this.#overlappingRoom; }
    getPossibleTiles() { return this.#possibleTiles; }
    getTilesToOpen() { return this.#tilesToOpen; }
    getRoom() { return this.#room; }
    getShape() { return this.#shape; }
    
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
        hallways.forEach(hallway => {
            let otherTilesToOpen = hallway.getTilesToOpen();
             for (const [key, value] of otherTilesToOpen.entries()) {
                 if (this.#tilesToOpen.has(key)) {
                   this.#tilesToOpen.get(key).push(...value);
                 } else {
                   this.#tilesToOpen.set(key, [...value]);
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