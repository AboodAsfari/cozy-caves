const log = require("console").log;
const Point = require("../../utils/src/point");
const RoomBuilder = require("../../room-generation/src/roomBuilder");
const populateRoom = require("../src/randomGenerator");

test('Testing toString', () => {
    const room = new RoomBuilder().setSize(new Point(7,7)).setLeniency(new Point(0,0)).build();
    const populatedRoom = populateRoom(room);
    populatedRoom.getPopulatedRoom(5);
    log("-------------------------------");
    log(populatedRoom.toString());

});

