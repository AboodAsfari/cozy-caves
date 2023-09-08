const Delaunator = require('delaunator');
const Room = require('../room/room');
const Point = require("@cozy-caves/utils").Point;
const DisjointSet = require("./disjointSet");
const Tile = require("../tile/tile");
const { TileID } = require('@cozy-caves/utils');

//fromRoom relative to toRoom
const RelativePosX = Object.freeze({
    LEFT: 'left',
    RIGHT: 'right',
    OVERLAP: 'overlappedX'
})

//fromRoom relative to toRoom
const RelativePosY = Object.freeze({
    UP : 'up',
    DOWN : 'down',
    OVERLAP: 'overlappedY'
})

const HallwayShapes = Object.freeze({
    LEFT_TOP : 'LT',
    LEFT_RIGHT : 'LR',
    LEFT_DOWN : 'LD',
    RIGHT_TOP : 'RT',
    RIGHT_DOWN : 'RD',
    RIGHT_LEFT : 'RL',
    TOP_DOWN : 'TD',
    TOP_RIGHT : 'TR',
    TOP_LEFT : 'TL',
    DOWN_TOP : 'DT',
    DOWN_RIGHT : 'DR',
    DOWN_LEFT : 'DL',
})

const roomToRoomConnections = [];

const midPoints = {};

const hallways = [];

function getmidPoint(room) {
    let point = room.getPosition();
    let x = point.getX();
    let y = point.getY();
    let dims = room.getDimensions();
    let w = dims.getX();
    let h = dims.getY();
    let midpoint = new Point(x + Math.round((w/2)), y + Math.round(h/2));
    return midpoint;
}

function generateHallways(rooms) {
    const midpoints = [];
    for (let key in rooms) {
        if(rooms[key] instanceof Room) {
            point = getmidPoint(rooms[key]);
            midPoints[key] = point;
            midpoints.push(point.getX());
            midpoints.push(point.getY());
        }
    }
    console.log(midpoints);
    const delaunay = new Delaunator(midpoints);
    let triangles = delaunay.triangles;
    //console.log(triangles);fromRoom

    mapConnections(triangles);
    console.log(roomToRoomConnections);
    let mst = minimumSpanningTree(rooms);
    console.log(mst);
    for (key in mst) {
        createHallway(mst[key], rooms);
    }
}

function mapConnections(triangles) {
    for (let i = 0; i < triangles.length; i += 3) {
        addToConnections(triangles[i], triangles[i+1]);
        addToConnections(triangles[i], triangles[i+2]); 
        addToConnections(triangles[i+1], triangles[i]);
        addToConnections(triangles[i+1], triangles[i+2]);
        addToConnections(triangles[i+2], triangles[i]);
        addToConnections(triangles[i+2], triangles[i+1]);
    }
}

function addToConnections(room, otherRoom) {
    roomToRoomConnections.push({
        from: room,
        to: otherRoom
    });
}

function minimumSpanningTree(rooms) {
    const mst = [];
    const disjointSet = new DisjointSet();

    for (const room in rooms) {
        disjointSet.makeSet(room);
    }

    console.log(disjointSet);

    for (const conn of roomToRoomConnections) {

        const from = conn.from;
        const to = conn.to;

        if (disjointSet.findSet(String(from)) !== disjointSet.findSet(String(to))) {
            mst.push(conn);
            disjointSet.union(String(from), String(to));
            if(mst.length >= rooms.length - 1) {
                return mst;
            }
        }
    }
    throw new Error("MST Failed");
}

function createHallway(conn, rooms) {
    let fromRoom = rooms[conn.from];
    let fromX = fromRoom.getPosition().getX();
    let fromY = fromRoom.getPosition().getY();
    let fromWidth = fromRoom.getDimensions().getX();
    let fromHeight = fromRoom.getDimensions().getY();

    let toRoom = rooms[conn.to];
    let toX = toRoom.getPosition().getX();
    let toY = toRoom.getPosition().getY();
    let toWidth = toRoom.getDimensions().getX(); 
    let toHeight = toRoom.getDimensions().getY();
    

    let relativeX = checkXPlane(fromX, fromWidth, toX, toWidth);
    let relativeY = checkYPlane(fromY, fromHeight, toY, toHeight);

    let shape = determineShape(relativeX, relativeY, conn.from, toRoom);
    
    console.log("From:" + conn.from + " To:" + conn.to);
    createHallwayFromShape(shape, fromRoom, toRoom);
}

function checkXPlane(fromX, fromWidth, toX, toWidth) {
    if (fromX + fromWidth < toX) {
        return RelativePosX.LEFT;
    } else if (fromX > toX + toWidth) {
        return RelativePosX.RIGHT;
    }
    return RelativePosX.OVERLAP;
}

function checkYPlane (fromY, fromHeight, toY, toHeight) {
    if (fromY + fromHeight < toY) {
        return RelativePosY.UP;
    } else if(fromY > toY + toHeight) {
        return RelativePosY.DOWN;
    }
    return RelativePosY.OVERLAP;
}

function determineShape(relativeX, relativeY, fromKey, toRoom) {
    console.log("SHAPE!");
    if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.UP) {
        return HallwayShapes.RIGHT_TOP;
        //other options can be randomly done later    console.log(conn.to);
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.UP) {
        return HallwayShapes.LEFT_TOP;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.OVERLAP && relativeY == RelativePosY.UP) {
        console.log("UP");
        //requires more calculation
        let fromPos = midPoints[fromKey];
        if (fromPos.getX() < toRoom.getPosition().getX()) {
             return HallwayShapes.DOWN_LEFT;
        } else if (fromPos.getX() > toRoom.getPosition().getX()) {
            return HallwayShapes.DOWN_RIGHT;
        } else {
            return HallwayShapes.DOWN_TOP;
        }
    } else if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.DOWN) {
        return HallwayShapes.RIGHT_DOWN;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.DOWN) {
        return HallwayShapes.LEFT_DOWN;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.OVERLAP && relativeY == RelativePosY.DOWN) {
        console.log("DOWN");
        //requires more calculation
        let fromPos = midPoints[fromKey];
        if (fromPos.getX() < toRoom.getPosition().getX()) {
             return HallwayShapes.TOP_LEFT;
        } else if (fromPos.getX() > toRoom.getPosition().getX()) {
            return HallwayShapes.TOP_RIGHT;
        } else {
            return HallwayShapes.TOP_DOWN;
        }
    } else if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.OVERLAP) {
        //requires more calculation
        console.log("LEFT");
        let fromPos = midPoints[fromKey];
        if (fromPos.getY() < toRoom.getPosition().getY()) {
             return HallwayShapes.DOWN_LEFT;
        } else if (fromPos.getY() > toRoom.getPosition().getY()) {
            return HallwayShapes.TOP_LEFT;
        } else {
            return HallwayShapes.RIGHT_LEFT;
        }
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.OVERLAP) {
        console.log("RIGHT");
        let fromPos = midPoints[fromKey];
        if (fromPos.getY() < toRoom.getPosition().getY()) {
             return HallwayShapes.DOWN_RIGHT;
        } else if (fromPos.getX() > toRoom.getPosition().getX()) {
            return HallwayShapes.TOP_RIGHT;
        } else {
            return HallwayShapes.LEFT_RIGHT;
        }
    } else if (relativeX == RelativePosX.OVERLAP && relativeY == RelativePosY.OVERLAP) {
        //might throw error instead - rooms should not be inside each other
        console.log("???");
        throw new Error();
        return HallwayShapes.null;
    } 

    console.log("x: " + relativeX);
    console.log("y: " + relativeY);

}

function createHallwayFromShape(shape, from, to) {
    let fromEdges = [];
    let toEdges = [];
    let middleFromTile;
    let middleToTile;

    //can definitely optimise this code
    //can flip from/to as they are the same (eg RT is same as TR)
    if (shape == HallwayShapes.RIGHT_TOP) {
        fromEdges = from.getRightEdges();
        toEdges = to.getTopEdges();
    } else if (shape == HallwayShapes.RIGHT_LEFT) {
        toEdges = from.getRightEdges();
        fromEdges = to.getLeftEdges();
        shape = HallwayShapes.LEFT_RIGHT;
    } else if (shape == HallwayShapes.RIGHT_DOWN) {
        fromEdges = from.getRightEdges();
        toEdges = to.getBottomEdges();
    } else if (shape == HallwayShapes.LEFT_RIGHT) {
        fromEdges = from.getLeftEdges();
        toEdges = to.getRightEdges();
    } else if (shape == HallwayShapes.LEFT_TOP) {
        toEdges = from.getRightEdges();
        fromEdges = to.getTopEdges();
        shape = HallwayShapes.TOP_LEFT;
    } else if (shape == HallwayShapes.LEFT_DOWN) {
        toEdges = from.getLeftEdges();
        fromEdges = to.getBottomEdges();
        shape = HallwayShapes.DOWN_LEFT;
    } else if (shape == HallwayShapes.TOP_DOWN) {
        fromEdges = from.getTopEdges();
        toEdges = to.getBottomEdges();
    } else if (shape == HallwayShapes.TOP_RIGHT) {
        toEdges = from.getTopEdges();
        fromEdges = to.getRightEdges();
        shape = HallwayShapes.RIGHT_TOP;
    } else if (shape == HallwayShapes.TOP_LEFT) {
        fromEdges = from.getTopEdges();
        toEdges = to.getLeftEdges();
    } else if (shape == HallwayShapes.DOWN_TOP) {
        toEdges = from.getBottomEdges();
        fromEdges = to.getTopEdges();
        shape = HallwayShapes.TOP_DOWN;
    } else if (shape == HallwayShapes.DOWN_LEFT) {
        fromEdges = from.getBottomEdges();
        toEdges = to.getLeftEdges();
    } else if (shape == HallwayShapes.DOWN_RIGHT) {
        toEdges = from.getBottomEdges();
        fromEdges = to.getRightEdges();
        shape = HallwayShapes.RIGHT_DOWN;
    } 
    middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
    middleToTile = toEdges[(Math.floor(toEdges.length / 2))];

    createFromEntryExit(from.getPosition().add(middleFromTile.getPosition()), to.getPosition().add(middleToTile.getPosition()), shape);
}

function createFromEntryExit(fromPos, toPos, shape) {
    //0,0 should be start of hallway so maybe some issues.
    console.log(shape);
    let startingX = fromPos.getX();
    let toX = toPos.getX();
    let startingY = fromPos.getY();
    let toY = toPos.getY();

    let diffX = Math.abs(toX - startingX) + 3;
    let diffY = Math.abs(toY - startingY) + 3;



    let hallway = new Room(new Point(diffX + 3, diffY + 3));
    hallway.setPosition(new Point(startingX, startingY));

    if (shape == HallwayShapes.RIGHT_TOP) {
        for (let i = 0; i < diffX; i++) {
            hallway.addTile(new Tile("wall", new Point(0 + i, 0)));
            hallway.addTile(new Tile("wall", new Point(0 + i, 2)));
        }
        for (let i = 0; i < diffY; i++) {
            hallway.addTile(new Tile("wall", new Point(diffX - 1, 0 + i)));
            hallway.addTile(new Tile("wall", new Point(diffX - 3, 0 + i)));
        }

        for (let i = 0; i < diffX-1; i++) {
            hallway.addTile(new Tile("floor", new Point(0 + i, 1)));
        }

        for (let i = 0; i < diffY-1; i++) {
            hallway.addTile(new Tile("floor", new Point(diffX - 2, 1 + i)));
        }
        hallway.setPosition(new Point(startingX, startingY));
    } 
    
    else if (shape == HallwayShapes.DOWN_LEFT) {
        for (let i = 0; i < diffY; i++) {
            hallway.addTile(new Tile("wall", new Point(0, 0 + i)));
            hallway.addTile(new Tile("wall", new Point(0, 2 + i)));
        }
        for (let i = 0; i < diffX; i++) {
            hallway.addTile(new Tile("wall", new Point(0 + i, diffY - 1)));
            hallway.addTile(new Tile("wall", new Point(0 + i, diffY - 3)));
        }
        for (let i = 0; i < diffY-1; i++) {
            hallway.addTile(new Tile("floor", new Point(1, 0 + i)));
        }
        for (let i = 0; i < diffX-1; i++) {
            hallway.addTile(new Tile("floor", new Point(1 + i, diffY - 2)));
        }
        hallway.setPosition(new Point(startingX, startingY));
    }

    else if (shape == HallwayShapes.RIGHT_DOWN) {
        for (let i = 0; i < diffX; i++) {
            hallway.addTile(new Tile("wall", new Point(0 + i, diffY - 1)));
            hallway.addTile(new Tile("wall", new Point(0 + i, diffY - 3)));
        }
        for (let i = 0; i < diffY; i++) {
            hallway.addTile(new Tile("wall", new Point(diffX - 1, 0 + i)));
            hallway.addTile(new Tile("wall", new Point(diffX - 3, 0 + i)));
        }

        for (let i = 0; i < diffX-1; i++) {
            hallway.addTile(new Tile("floor", new Point(0 + i, diffY - 2)));
        }

        for (let i = 0; i < diffY-1; i++) {
            hallway.addTile(new Tile("floor", new Point(diffX - 2, 0 + i)));
        }
        hallway.setPosition(new Point(startingX, toY));
    }

    else if (shape == HallwayShapes.TOP_LEFT) {
        for (let i = 0; i < diffY; i++) {
            hallway.addTile(new Tile("wall", new Point(0, 0 + i)));
            hallway.addTile(new Tile("wall", new Point(2, 0 + i)));
        }

        for (let i = 0; i < diffX; i++) {
            hallway.addTile(new Tile("wall", new Point(0 + i, 0)));
            hallway.addTile(new Tile("wall", new Point(0 + i, 2)));
        }

        for (let i = 0; i < diffY-1; i++) {
            hallway.addTile(new Tile("floor", new Point(1, 1 + i)));
        }

        for (let i = 0; i < diffX-1; i++) {
            hallway.addTile(new Tile("floor", new Point(0 + i, 1)));
        }

        hallway.setPosition(new Point(startingX, toY));
    } else if (shape == HallwayShapes.LEFT_RIGHT) {
        for (let i = 0; i < diffX; i++) {
            hallway.addTile(new Tile("wall", new Point(0 + i, 0)));
            hallway.addTile(new Tile("wall", new Point(0 + i, 2)));

            hallway.addTile(new Tile("floor", new Point(0 + i, 1)));
            hallway.setPosition(new Point(startingX, startingY));
        }
    } else if (shape == HallwayShapes.TOP_DOWN) {
        for (let i = 0; i < diffY; i++) {
            hallway.addTile(new Tile("wall", new Point(0, 0 + i)));
            hallway.addTile(new Tile("wall", new Point(2, 0 + i)));

            hallway.addTile(new Tile("floor", new Point(1, 1 + i)));
            hallway.setPosition(new Point(startingX, startingY));
        }
    }
    console.log(hallway.toString());
    hallways.push(hallway);
}




module.exports = generateHallways;

