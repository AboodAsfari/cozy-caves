const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("../src/room/roomBuilder");
const generateHallways = require("../src/hallway/hallwayGenerator");

let rooms;

test("hallway generation", () => {
    test('Rect room generation', () => {
        let testInputs = [
            { size: new Point(5, 5), leniency: new Point(0, 0) },
            { size: new Point(7, 7), leniency: new Point(0, 0) },
            { size: new Point(6, 6), leniency: new Point(0, 0) },
            { size: new Point(8, 8), leniency: new Point(0, 0) },
            { size: new Point(8, 8), leniency: new Point(0, 0) },
            { size: new Point(6, 6), leniency: new Point(0, 0) },
            { size: new Point(5, 5), leniency: new Point(0, 0) },
        ];
    
        log("----------------------------------------------------------------");
        for (const testInput of testInputs) {
            log("Generating room with expected size: " + testInput.size.toString() + ", and leniency: " + testInput.leniency.toString());
    
            let room = new RoomBuilder().setSize(testInput.size).setLeniency(testInput.leniency).build();
            rooms.push(room);
            
        }
        generateHallways(rooms);
    });
});