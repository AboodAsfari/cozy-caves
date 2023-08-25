const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("../src/room/roomBuilder");
const generateHallways = require("../src/hallway/hallwayGenerator");

let rooms = [];

test("hallway generation", () => {
    let testInputs = [
        { size: new Point(55, 32), leniency: new Point(0, 0) },
        { size: new Point(97, 97), leniency: new Point(0, 0) },
        { size: new Point(61, 61), leniency: new Point(0, 0) },
        { size: new Point(8, 8), leniency: new Point(0, 0) },
        { size: new Point(43, 43), leniency: new Point(0, 0) },
        { size: new Point(21, 21), leniency: new Point(0, 0) },
        { size: new Point(77, 77), leniency: new Point(0, 0) },
    ];

    log("----------------------------------------------------------------");
    for (const testInput of testInputs) {
        log("Generating room with expected size: " + testInput.size.toString() + ", and leniency: " + testInput.leniency.toString());

        let room = new RoomBuilder().setSize(testInput.size).setLeniency(testInput.leniency).build();
        room.setPosition(new Point(0,0));
        rooms.push(room);
        
    }
    console.log(rooms[0].toString());
    generateHallways(rooms);
});