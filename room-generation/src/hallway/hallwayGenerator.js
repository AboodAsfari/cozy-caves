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

var roomToRoomConnections = [];

var midPoints = {};

var hallways = [];

var map;

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

function generateCurrentMap(rooms) {
    for (room of rooms) {
        let roomWidth = room.getDimensions().getX();
        let roomHeight = room.getDimensions().getY();
        let roomPos = room.getPosition();
        let roomX = roomPos.getX();
        let roomY = roomPos.getY();

        for (let i = 0; i < roomWidth; i++) {
            for (let j = 0; j < roomHeight; j++) {
                map[roomX + i][roomY + j] = room.getTile(new Point(i, j));
            }
function mergeHallways(hallways, hallwayMap) {

    let disjointSet = new DisjointSet();

    for (key in hallways) {
        disjointSet.makeSet(key);
    }

    for (key in hallways) {
        let hallway = hallways[key];
        let hallwayPos = hallway.getPosition();
        for (let tile of hallway.getTiles()) {
            let tileX = tile.getPosition().getX() + hallwayPos.getX();
            let tileY = tile.getPosition().getY() + hallwayPos.getY();
            
            if (hallwayMap[tileX][tileY] < 0) {
                hallwayMap[tileX][tileY] = key;
            } else {
                disjointSet.union(key, hallwayMap[tileX][tileY]);
            }
        }
    }
    
    let mergedHallways = new Map();

    for (key in hallways) {
        let parent = disjointSet.findSet(key);
        if (mergedHallways.has(parent)) {
            console.log(parent);
            let currentList = mergedHallways.get(parent);
            currentList.push(hallways[key]);
            mergedHallways.set(parent, currentList);
        } else {
            let list = [hallways[key]];
            mergedHallways.set(parent, list);
        }
    }
}

function generateHallways(rooms, w, h) {
    console.log(rooms);
    midPoints = { };
    roomToRoomConnections = [];
    hallways = [];
    const midpoints = [];
    map = [...Array(w)].map(e => Array(h).fill(-1));
    generateCurrentMap(rooms);
    for (let key in rooms) {
        point = getmidPoint(rooms[key]);
        midPoints[key] = point;
        midpoints.push(point.getX());
        midpoints.push(point.getY());
    }
    console.log(midpoints);
    const delaunay = new Delaunator.default(midpoints);
    let triangles = delaunay.triangles;

    mapConnections(triangles);
    console.log(roomToRoomConnections);
    let mst = minimumSpanningTree(rooms);
    console.log(mst);
    for (key in mst) {
        createHallway(mst[key], rooms);
    }   


    let hallwayMap = [...Array(w)].map(e => Array(h).fill(-1));
    let toMergeMap = mergeHallways(hallways, hallwayMap);



    for(hallway of hallways) {
        checkOverlap(hallway, rooms);
        rooms.push(hallway);
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

    console.log(shape);
    
    console.log("From:" + conn.from + " To:" + conn.to);
    createHallwayFromShape(shape, fromRoom, toRoom);
}

function checkXPlane(fromX, fromWidth, toX, toWidth) {
    if (fromX + fromWidth-1 < toX) {
        return RelativePosX.LEFT;
    } else if (fromX > toX + toWidth-1) {
        return RelativePosX.RIGHT;
    }
    return RelativePosX.OVERLAP;
}

function checkYPlane (fromY, fromHeight, toY, toHeight) {
    if (fromY + fromHeight-1 < toY) {
        return RelativePosY.UP;
    } else if(fromY > toY + toHeight-1) {
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
        // let fromPos = midPoints[fromKey];
        // if (fromPos.getX() < toRoom.getPosition().getX()) {
        //      return HallwayShapes.DOWN_LEFT;
        // } else if (fromPos.getX() > toRoom.getPosition().getX()) {
        //     return HallwayShapes.DOWN_RIGHT;
        // } else {
        //     return HallwayShapes.DOWN_TOP;
        // }
        return HallwayShapes.DOWN_TOP;
    } else if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.DOWN) {
        return HallwayShapes.RIGHT_DOWN;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.DOWN) {
        return HallwayShapes.LEFT_DOWN;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.OVERLAP && relativeY == RelativePosY.DOWN) {
        return HallwayShapes.TOP_DOWN;
    } else if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.OVERLAP) {
        return HallwayShapes.RIGHT_LEFT;
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.OVERLAP) {
        return HallwayShapes.LEFT_RIGHT;
    } else if (relativeX == RelativePosX.OVERLAP && relativeY == RelativePosY.OVERLAP) {
        //rooms are touching
        console.log("touching");
        return HallwayShapes.null;
    } 
}

function createHallwayFromShape(shape, from, to) {
    let fromEdges = [];
    let toEdges = [];
    let middleFromTile;
    let middleToTile;

    let swapped = false;

    //can definitely optimise this code
    if (shape == HallwayShapes.RIGHT_TOP) {
        fromEdges = from.getRightEdges();
        toEdges = to.getTopEdges();
    } else if (shape == HallwayShapes.RIGHT_LEFT) {
        toEdges = from.getRightEdges();
        fromEdges = to.getLeftEdges();
        shape = HallwayShapes.LEFT_RIGHT;
        swapped = true;
    } else if (shape == HallwayShapes.RIGHT_DOWN) {
        fromEdges = from.getRightEdges();
        toEdges = to.getBottomEdges();
    } else if (shape == HallwayShapes.LEFT_RIGHT) {
        fromEdges = from.getLeftEdges();
        toEdges = to.getRightEdges();
    } else if (shape == HallwayShapes.LEFT_TOP) {
        toEdges = from.getLeftEdges();
        fromEdges = to.getTopEdges();
        shape = HallwayShapes.TOP_LEFT;
        swapped = true;
    } else if (shape == HallwayShapes.LEFT_DOWN) {
        toEdges = from.getLeftEdges();
        fromEdges = to.getBottomEdges();
        shape = HallwayShapes.DOWN_LEFT;
        swapped = true;
    } else if (shape == HallwayShapes.TOP_DOWN) {
        fromEdges = from.getTopEdges();
        toEdges = to.getBottomEdges();
    } else if (shape == HallwayShapes.TOP_RIGHT) {
        toEdges = from.getTopEdges();
        fromEdges = to.getRightEdges();
        shape = HallwayShapes.RIGHT_TOP;
        swapped = true;
    } else if (shape == HallwayShapes.TOP_LEFT) {
        fromEdges = from.getTopEdges();
        toEdges = to.getLeftEdges();
    } else if (shape == HallwayShapes.DOWN_TOP) {
        toEdges = from.getBottomEdges();
        fromEdges = to.getTopEdges();
        shape = HallwayShapes.TOP_DOWN;
        swapped = true;
    } else if (shape == HallwayShapes.DOWN_LEFT) {
        fromEdges = from.getBottomEdges();
        toEdges = to.getLeftEdges();
    } else if (shape == HallwayShapes.DOWN_RIGHT) {
        toEdges = from.getBottomEdges();
        fromEdges = to.getRightEdges();
        shape = HallwayShapes.RIGHT_DOWN;
        swapped = true;
    } else {
        return;
    }
    
    // fromEdges.splice(0, 1);
    // fromEdges.splice(fromEdges.length-1, 1);
    // toEdges.splice(0, 1);
    // toEdges.splice(toEdges.length-1, 1);

    if (swapped) {
        let temp = from;
        from = to;
        to = temp;
    }

    if (shape != HallwayShapes.LEFT_RIGHT && shape != HallwayShapes.TOP_DOWN) {
        middleFromTile = fromEdges[(Math.floor((fromEdges.length) / 2))]
        middleToTile = toEdges[(Math.floor((toEdges.length) / 2))]

    } else if (shape == HallwayShapes.TOP_DOWN) {
        let matches = [];
        for (fromEdge of fromEdges) {
            for (toEdge of toEdges) {
                if (fromEdge.getPosition().getX() + from.getPosition().getX() == toEdge.getPosition().getX() + to.getPosition().getX()) {
                    middleFromTile = fromEdge;
                    middleToTile = toEdge;
                    matches.push({
                        from: fromEdge, 
                        to: toEdge
                    });
                }
            }
        }
        middleFromTile = matches[Math.floor(matches.length / 2)].from;
        middleToTile = matches[Math.floor(matches.length / 2)].to;

    } else {
        //LEFT_RIGHT
        let matches = [];
        for (fromEdge of fromEdges) {
            for (toEdge of toEdges) {
                if (fromEdge.getPosition().getY() + from.getPosition().getY() == toEdge.getPosition().getY() + to.getPosition().getY()) {
                    middleFromTile = fromEdge;
                    middleToTile = toEdge;
                    matches.push({
                        from: fromEdge, 
                        to: toEdge
                    });
                }
            }
        }
        middleFromTile = matches[Math.floor(matches.length / 2)].from;
        middleToTile = matches[Math.floor(matches.length / 2)].to;
    }

    createFromEntryExit(from.getPosition().add(middleFromTile.getPosition()), to.getPosition().add(middleToTile.getPosition()), shape);
}

function createFromEntryExit(fromPos, toPos, shape) {
    //0,0 should be start of hallway so maybe some issues.
    console.log(shape);
    let startingX = fromPos.getX();
    let toX = toPos.getX();
    let startingY = fromPos.getY();
    let toY = toPos.getY();

    let diffX = Math.abs(toX - startingX);
    let diffY = Math.abs(toY - startingY);

    let xCompensation = 0;
    let yCompensation = 0;

    if (diffX < 3) {
        xCompensation = 3;
    }

    if (diffY < 3) {
        yCompensation = 3;
    }

    let hallway = new Room(new Point(diffX+xCompensation+2, diffY+yCompensation+2));

    if (shape == HallwayShapes.RIGHT_TOP) {
        for (let i = 1; i <= diffX+1; i++) {
            // hallway.addTile(new Tile("wall", new Point(i, 0)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(i, 2)).setTileID(TileID.EDGE_WALL));
        }
        for (let i = 1; i <= diffY; i++) {
            // hallway.addTile(new Tile("wall", new Point(diffX - 1, i)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(diffX + 1, i)).setTileID(TileID.EDGE_WALL));
        }

        for (let i = 1; i <= diffX; i++) {
            hallway.addTile(new Tile("floor", new Point(i, 1)).setTileID(TileID.FLOOR));
        }

        for (let i = 1; i <= diffY; i++) {
            hallway.addTile(new Tile("floor", new Point(diffX, i)).setTileID(TileID.FLOOR));
        }
        hallway.setPosition(new Point(startingX, startingY-1));
    } 
    
    else if (shape == HallwayShapes.DOWN_LEFT) {
        for (let i = 1; i <= diffY+1; i++) {
            // hallway.addTile(new Tile("wall", new Point(0, i)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(2, i)).setTileID(TileID.EDGE_WALL));
        }
        for (let i = 1; i <= diffX; i++) {
            // hallway.addTile(new Tile("wall", new Point(i, diffY-1)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(i, diffY+1)).setTileID(TileID.EDGE_WALL));
        }
        for (let i = 1; i <= diffY; i++) {
            hallway.addTile(new Tile("floor", new Point(1, i)).setTileID(TileID.FLOOR_2));
        }
        for (let i = 1; i <= diffX; i++) {
            hallway.addTile(new Tile("floor", new Point(i, diffY)).setTileID(TileID.FLOOR_2));
        }
        hallway.setPosition(new Point(startingX-1, startingY));
    }

    else if (shape == HallwayShapes.RIGHT_DOWN) {
        for (let i = 1; i <= diffX+1; i++) {
            // hallway.addTile(new Tile("wall", new Point(i, diffY - 1)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(i, diffY + 1)).setTileID(TileID.EDGE_WALL));
        }
        for (let i = 1; i <= diffY; i++) {
            // hallway.addTile(new Tile("wall", new Point(diffX - 1, i)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(diffX + 1, i)).setTileID(TileID.EDGE_WALL));
        }

        for (let i = 1; i <= diffX; i++) {
            hallway.addTile(new Tile("floor", new Point(i, diffY)).setTileID(TileID.FLOOR));
        }

        for (let i = 1; i <= diffY; i++) {
            hallway.addTile(new Tile("floor", new Point(diffX, i)).setTileID(TileID.FLOOR));
        }

        hallway.setPosition(new Point(startingX, toY));
    }

    else if (shape == HallwayShapes.TOP_LEFT) {
        for (let i = 0; i <= diffY; i++) {
            // hallway.addTile(new Tile("wall", new Point(0, i)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(2, i)).setTileID(TileID.EDGE_WALL));
        }

        for (let i = 1; i <= diffX; i++) {
            // hallway.addTile(new Tile("wall", new Point(i, 0)).setTileID(TileID.EDGE_WALL));
            // hallway.addTile(new Tile("wall", new Point(i, 2)).setTileID(TileID.EDGE_WALL));
        }

        for (let i = 1; i <= diffY; i++) {
            hallway.addTile(new Tile("floor", new Point(1, i)).setTileID(TileID.FLOOR));
        }

        for (let i = 1; i <= diffX; i++) {
            hallway.addTile(new Tile("floor", new Point(i, 1)).setTileID(TileID.FLOOR));
        }
        hallway.setPosition(new Point(startingX-1, toY-1));
    } 
    
    else if (shape == HallwayShapes.LEFT_RIGHT) {
        if (diffX == 1) {
            hallway.addTile(new Tile("floor", new Point(0, 0)).setTileID(TileID.FLOOR));
            hallway.addTile(new Tile("floor", new Point(1, 0)).setTileID(TileID.FLOOR));
            hallway.setPosition(new Point(toX, startingY));
        } else {
            for (let i = 1; i < diffX; i++) {
                // hallway.addTile(new Tile("wall", new Point(i, 0)).setTileID(TileID.EDGE_WALL));
                // hallway.addTile(new Tile("wall", new Point(i, 2)).setTileID(TileID.EDGE_WALL));
    
                hallway.addTile(new Tile("floor", new Point(i, 1)).setTileID(TileID.FLOOR));
            }
            hallway.setPosition(new Point(toX, startingY-1));
        }
        
    } 
    
    else if (shape == HallwayShapes.TOP_DOWN) {
        if (diffY == 1) {
            hallway.addTile(new Tile("floor", new Point(1, 0)).setTileID(TileID.FLOOR));
            hallway.addTile(new Tile("floor", new Point(1, 1)).setTileID(TileID.FLOOR));
            hallway.setPosition(new Point(startingX, toY));
        } else {
            for (let i = 1; i < diffY; i++) {
                // hallway.addTile(new Tile("wall", new Point(0, i)).setTileID(TileID.EDGE_WALL));
                // hallway.addTile(new Tile("wall", new Point(2, i)).setTileID(TileID.EDGE_WALL));
                hallway.addTile(new Tile("floor", new Point(1, i)).setTileID(TileID.FLOOR));
            }
            hallway.setPosition(new Point(startingX-1, toY));
        }
    } else {
        return;
    }

    console.log(hallway.toString());
    hallways.push(hallway);
}

module.exports = generateHallways;