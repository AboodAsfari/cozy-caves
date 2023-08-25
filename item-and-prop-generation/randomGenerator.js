const ItemGenerator = require('itemGenerator.js');
const PropGenerator = require('propGenerator.js');
const Room = require('../room-generation/src/room');


function itemSelection() {

}


function populateRoom(room, maxItems) {
    // simplest logic for now
    if (!(room instanceof Room)) throw new Error("Invalid room class");

    const tiles = room.getTiles();

    // randomly generate items in the rom

    // think of a way to be able to test this

}

module.exports = populateRoom;
