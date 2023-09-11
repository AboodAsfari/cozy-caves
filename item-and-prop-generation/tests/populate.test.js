const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("@cozy-caves/room-generation").RoomBuilder;
const populateRoom = require("../src/propMap");

test('Testing toString', () => {
    const room = new RoomBuilder().setSize(new Point(7,7)).setLeniency(new Point(0,0)).build();
    log(room.toString());
    
    const populatedRoom = populateRoom(room);
    log("-------------------------------");
    log(populatedRoom.toString());

});

test('Testing PathName', () => {
    const room = new RoomBuilder().setSize(new Point(7,7)).setLeniency(new Point(0,0)).build();
    
    const populatedRoom = populateRoom(room);
    log("-------------------------------");
    const propList = populatedRoom.getPropList();

    for (var prop of propList) {
        log(prop.getPathName());
    }
});