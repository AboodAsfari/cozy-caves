const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("../src/room/roomBuilder");
const generateHallways = require("../src/hallway/hallwayGenerator");

let rooms = [];

test("hallway generation", () => {
    let testInputs = [
        { size: new Point(18, 15), leniency: new Point(0, 0) },
        { size: new Point(10, 10), leniency: new Point(0, 0) },
        { size: new Point(8, 8), leniency: new Point(0, 0) },
        { size: new Point(13, 13), leniency: new Point(0, 0) },
        { size: new Point(11, 11), leniency: new Point(0, 0) },
        { size: new Point(9, 9), leniency: new Point(0, 0) },
        { size: new Point(6, 6), leniency: new Point(0, 0) },
    ];

    log("----------------------------------------------------------------");
    for (const key in testInputs) {
        log("Generating room with expected size: " + testInputs[key].size.toString() + ", and leniency: " + testInputs[key].leniency.toString());

        let room = new RoomBuilder().setSize(testInputs[key].size).setLeniency(testInputs[key].leniency).build();
        room.setPosition(new Point(key*20,key*20));
        rooms.push(room);
        
    }
    console.log(rooms[0].toString());
    generateHallways(rooms);
});