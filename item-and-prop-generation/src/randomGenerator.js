const PropGenerator = require('./propGenerator.js');
const Room = require('../../room-generation/src/room');

class RandomGenerator {
    #populatedRoom = new Map();
    #room;

    constructor (room) {
        if (!(room instanceof Room)) throw new Error("Invalid type. Expecting a room object.");
        this.#room = room;
    }

    getProp(pos) {
        return this.#populatedRoom.get(pos.toString());
    }
    
    getRandomRarity() {
        const rand = Math.random() * 100 + 1;
    
        if (rand <= 60) { // common
            return PropGenerator.rarityList[0];
        } else if (rand <= 90) { // uncommon
            return PropGenerator.rarityList[1];
        } else if (rand <= 100) { // rare
            return PropGenerator.rarityList[2];
        } else { // just in case something goes wrong, go with common
            return PropGenerator.rarityList[0];
        }
    }
    
    getPopulatedRoom(maxProp) {
        for (let i=0; i<this.#room.getDimensions().getX(); i++) {
            for (let j=0; j<this.#room.getDimensions().getY(); j++) {
                let pos = new Point(i, j).toString();
                let tile = this.#room.getTile(pos);

                // makes sure to generate props only on the floor not wall
                if (tile.getTileType() === "floor") {
                    let rand = Math.random();

                    // will put props 40% of the time in the room
                    if (rand < 0.4 && this.#populatedRoom.size() <= maxProp) { 
                        this.#populatedRoom.set(pos, PropGenerator.getPropByRarity(getRandomRarity()));
                    }
                }
            }
        }
        return this.#room;
    }

    toString() {
        let roomArray = [];
        let dimensions = this.#room.getDimensions();

        for (let i = 0; i < dimensions.getY(); i++) {
            roomArray.push("");
            for (let j = 0; j < dimensions.getX(); j++) {
                let tile = this.#room.getTile(new Point(j, i).toString());
                let prop = this.getProp(new Point(j, i).toString());
                if (prop !== null) roomArray[i] += "P";
                else if (!tile) roomArray[i] += "X";
                else if (tile.getTileType() === "floor") roomArray[i] += "O";
                else roomArray[i] += "I";
                roomArray[i] += "  ";
            }
        }
        let finalString = roomArray.join("\n");
        return finalString.substring(0, finalString.length - 1);
    }

}

function populateRoom(room) {
    return new RandomGenerator(room);
}

module.exports = populateRoom;