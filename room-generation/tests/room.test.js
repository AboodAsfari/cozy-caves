const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("../src/room/roomBuilder");

test('Rect room generation', () => {
    let testInputs = [
        { size: new Point(3, 3), leniency: new Point(0, 0) },
        { size: new Point(4, 4), leniency: new Point(0, 0) },
        { size: new Point(4, 4), leniency: new Point(1, 0) },
        { size: new Point(5, 4), leniency: new Point(0, 0) },
        { size: new Point(7, 7), leniency: new Point(0, 0) },
        { size: new Point(7, 7), leniency: new Point(1, 1) },
        { size: new Point(7, 7), leniency: new Point(0, 0) },
    ];

    log("----------------------------------------------------------------");
    for (const testInput of testInputs) {
        log("Generating room with expected size: " + testInput.size.toString() + ", and leniency: " + testInput.leniency.toString());

        let room = new RoomBuilder().setSize(testInput.size).setLeniency(testInput.leniency).build();
        log(room.toString());
        log("----------------------------------------------------------------");

        let expectedSize = new Point(testInput.size.getX() - testInput.leniency.getX(), testInput.size.getY() - testInput.leniency.getY());
        expect(room.toString()).toBe(rectRoomString(expectedSize));
    }
});

const rectRoomString = (dimensions) => {
    let tileArray = [];
    for (let i = 0; i < dimensions.getY(); i++) {
        tileArray.push("");
        for (let j = 0; j < dimensions.getX(); j++) {
            if (i === 0 || i === dimensions.getY() - 1 || j === 0 || j === dimensions.getX() - 1) tileArray[i] += "I";
            else tileArray[i] += "O";
            tileArray[i] += "  ";
        }
    }
    let finalString = tileArray.join("\n");
    return finalString.substring(0, finalString.length - 1);
}
