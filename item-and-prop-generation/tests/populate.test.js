const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("@cozy-caves/room-generation").RoomBuilder;
const PropGenerator = require("../src/propGenerator");
const populateRoom = require("../src/propMap");

test('Testing Prop Generation', () => {
    log("TESTING PROP GENERATION\n");

    const room = new RoomBuilder("abo").setSize(new Point(7,7)).setLeniency(new Point(0,0)).build();
    const populatedRoom = populateRoom(room, "abo");
    log(populatedRoom.toString());
    log("-------------------------------");

});

test('Testing PathName', () => {
    log("TESTING PATHNAME\n");

    const room = new RoomBuilder().setSize(new Point(7,7)).setLeniency(new Point(0,0)).build();
    
    const populatedRoom = populateRoom(room);
    const propList = populatedRoom.getPropList();

    for (var prop of propList) {
        log(prop.getPathName());
    }
    log("-------------------------------");
});


test('Testing Props that can store items', () => {
    log("TESTING PROPS THAT CAN STORE ITEMS\n");

    const generator = new PropGenerator(Math.random());
    
    for (let i=0; i<5; i++) {
        const prop = generator.getPropByCategory("Storages");
        log(prop.toString() + "\n");
    }
    log("-------------------------------");
});