const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("../src/room/roomBuilder");

test("Rect room generation", () => {
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

        let room = new RoomBuilder(3).setSize(testInput.size).setLeniency(testInput.leniency).setPopulateWithItems(false).build();
        log(room.toString());
        log("----------------------------------------------------------------");

        let expectedSize = new Point(testInput.size.getX() - testInput.leniency.getX(), testInput.size.getY() - testInput.leniency.getY());
        expect(room.toString()).toBe(rectRoomString(expectedSize));
    }
});

test("Edge fetching", () => {
    let room = new RoomBuilder(3).setSize(new Point(3, 3)).setPopulateWithItems(false).build();

    let bottomEdges = room.getBottomEdges();
    expect(bottomEdges[0].getPosition().toString()).toBe("0,2");
    expect(bottomEdges[1].getPosition().toString()).toBe("1,2");
    expect(bottomEdges[2].getPosition().toString()).toBe("2,2");

    let leftEdges = room.getLeftEdges();
    expect(leftEdges[0].getPosition().toString()).toBe("0,0");
    expect(leftEdges[1].getPosition().toString()).toBe("0,1");
    expect(leftEdges[2].getPosition().toString()).toBe("0,2");

    let topEdges = room.getTopEdges();
    expect(topEdges[0].getPosition().toString()).toBe("0,0");
    expect(topEdges[1].getPosition().toString()).toBe("1,0");
    expect(topEdges[2].getPosition().toString()).toBe("2,0");

    let rightEdges = room.getRightEdges();
    expect(rightEdges[0].getPosition().toString()).toBe("2,0");
    expect(rightEdges[1].getPosition().toString()).toBe("2,1");
    expect(rightEdges[2].getPosition().toString()).toBe("2,2");
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
