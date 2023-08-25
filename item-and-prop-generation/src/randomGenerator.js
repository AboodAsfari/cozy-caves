const PropGenerator = require('./propGenerator.js');
const Room = require('../../room-generation/src/room');


function getRandomRarity() {
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


function populateRoom(room, maxProp) {
    const populatedRoom = new Map();
    // simplest logic for now
    if (!(room instanceof Room)) throw new Error("Invalid type. Expecting a room object.");

    const tiles = room.getTiles();
    
    for (let i=0; i<room.getDimensions().getX(); i++) {
        for (let j=0; j<room.getDimensions().getY(); j++) {
            let pos = new Point(i, j).toString();
            let tile = room.getTile(pos);
            if (tile.getTileType() === "floor") {
                let rand = Math.random();

                // will put props 40% of the time in the room
                if (rand < 0.4 && populatedRoom.size() <= maxProp) { 
                    populatedRoom.set(pos, PropGenerator.getPropByRarity(getRandomRarity()));
                }
            }
        }
    }
    return populatedRoom;
}
module.exports = populateRoom;
