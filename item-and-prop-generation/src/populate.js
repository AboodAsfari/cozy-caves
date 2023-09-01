const PropGenerator = require('./propGenerator.js');
const Point = require('@cozy-caves/utils').Point;
const propGenerator = new PropGenerator();


class Populate {
    #populatedRoom = new Map();
    #room;

    constructor (room, maxProp) {
        this.#room = room;
        this.#populateMap(maxProp);
    }
    
    #getRandomRarity() {
        const rand = Math.random() * 100 + 1;
    
        if (rand <= 60) { // common
            return propGenerator.rarityList[0];
        } else if (rand <= 90) { // uncommon
            return propGenerator.rarityList[1];
        } else if (rand <= 100) { // rare
            return propGenerator.rarityList[2];
        } else { // just in case something goes wrong, go with common
            return propGenerator.rarityList[0];
        }
    }
    
    #populateMap(maxProp) {
        outer: for (let i=0; i<this.#room.getDimensions().getX(); i++) {
            for (let j=0; j<this.#room.getDimensions().getY(); j++) {
                let pos = new Point(i, j);
                let tile = this.#room.getTile(pos);

                // makes sure to generate props only on the floor not wall
                if (tile.getTileType() === "floor") {
                    let rand = Math.random();
                    // will put props 40% of the time in the room
                    if (rand < 0.4) { 
                        const prop = propGenerator.getPropByRarity(this.#getRandomRarity());
                        prop.setPosition(pos);
                        this.#populatedRoom.set(pos.toString(), prop);
                    }
                }
                if (this.#populatedRoom.size >= 5) break outer;
            }
        }
    }

    getProp(pos) {
        return this.#populatedRoom.get(pos.toString());
    }

    getPropList(){
        return this.#populatedRoom.values();
    }

    toString() {
        let roomArray = [];
        let dimensions = this.#room.getDimensions();

        for (let i = 0; i < dimensions.getY(); i++) {
            roomArray.push("");
            for (let j = 0; j < dimensions.getX(); j++) {
                let tile = this.#room.getTile(new Point(j, i));
                let prop = this.getProp(new Point(j, i));

                if (prop !== null && prop !== undefined) roomArray[i] += "P";
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

// this it inefficient
function populateRoom(room, maxProp) {
    return new Populate(room, maxProp);
}

module.exports = populateRoom;