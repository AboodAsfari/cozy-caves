const Delaunator = require('delaunator');
const Room = require('../room/room');
const Point = require("@cozy-caves/utils").Point;
const DisjointSet = require("./disjointSet");

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

const midPoints = [];

const hallways = [];

function getmidPoint(room) {
    let point = room.getPosition();
    let x = point.getX();
    let y = point.getY();
    let dims = room.getDimensions();
    let w = dims.getX();
    let h = dims.getY();
    let midpoint = new Point(x + Math.round((w/2)), y + Math.round(h/2));
    midPoints.push(midpoint);
    return midpoint;
}

function generateHallways(rooms) {
    const midpoints = [];
    for (let key in rooms) {
        if(rooms[key] instanceof Room) {
            point = getmidPoint(rooms[key]);
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
    let fromWidth = fromRoom.getDimensions().getX();fromRoom
    let fromHeight = fromRoom.getDimensions().getY();

    let toRoom = rooms[conn.to];
    let toX = toRoom.getPosition().getX();
    let toY = toRoom.getPosition().getY();
    let toWidth = toRoom.getDimensions().getX(); 
    let toHeight = toRoom.getDimensions().getY();
    

    let relativeX = checkXPlane(fromX, fromWidth, toX, toWidth);
    let relativeY = checkYPlane(fromY, fromHeight, toY, toHeight);

    let shape = determineShape(relativeX, relativeY);
    
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

function determineShape(relativeX, relativeY) {
    if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.UP) {
        return HallwayShapes.RIGHT_TOP;
        //other options can be randomly done later    console.log(conn.to);
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.UP) {
        return HallwayShapes.LEFT_TOP;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.OverlappedX && relativeY == RelativePosY.UP) {
        //requires more calculation
        return null;
    } else if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.DOWN) {
        return HallwayShapes.RIGHT_DOWN;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.DOWN) {
        return HallwayShapes.LEFT_DOWN;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.OverlappedX && relativeY == RelativePosY.DOWN) {
        //requires more calculation
        return HallwayShapes.null;    console.log(conn.to);
    } else if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.OverlappedY) {
        //requires more calculation
        return HallwayShapes.null;
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.OverlappedY) {
        //requires more calculation
        return HallwayShapes.null;
    } else if (relativeX == RelativePosX.OverlappedX && relativeY == RelativePosY.OverlappedY) {
        //requires more calculation
        return HallwayShapes.null;
    } 

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
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.RIGHT_LEFT) {
        fromEdges = from.getRightEdges();
        toEdges = to.getLeftEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.RIGHT_DOWN) {
        fromEdges = from.getRightEdges();
        toEdges = to.getBottomEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.LEFT_RIGHT) {
        fromEdges = from.getLeftEdges();
        toEdges = to.getRightEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.LEFT_TOP) {
        fromEdges = from.getRightEdges();
        toEdges = to.getTopEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.LEFT_DOWN) {
        fromEdges = from.getLeftEdges();
        toEdges = to.getBottomEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.TOP_DOWN) {
        fromEdges = from.getTopEdges();
        toEdges = to.getBottomEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.TOP_RIGHT) {
        fromEdges = from.getTopEdges();
        toEdges = to.getRightEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.TOP_LEFT) {
        fromEdges = from.getTopEdges();
        toEdges = to.getLeftEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.DOWN_TOP) {
        fromEdges = from.getBottomEdges();
        toEdges = to.getTopEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.DOWN_LEFT) {
        fromEdges = from.getBottomEdges();
        toEdges = to.getLeftEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } else if (shape == HallwayShapes.DOWN_RIGHT) {
        fromEdges = from.getBottomEdges();
        toEdges = to.getRightEdges();
        middleFromTile = fromEdges[(Math.floor(fromEdges.length / 2))];
        middleToTile = toEdges[(Math.floor(toEdges.length / 2))];
    } 

    createFromEntryExit(from.getPosition().add(middleFromTile.getPosition()), to.getPosition().add(middleToTile.getPosition()));
}

function createFromEntryExit(fromPos, toPos) {
    
}




module.exports = generateHallways;

