const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("@cozy-caves/room-generation").RoomBuilder;
const populateRoom = require("../src/populate");

test('Testing toString', () => {
    const room = new RoomBuilder().setSize(new Point(7,7)).setLeniency(new Point(0,0)).build();
    log(room.toString());
    
    const populatedRoom = populateRoom(room, 5);
    log("-------------------------------");
    log(populatedRoom.toString());

});