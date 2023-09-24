const Delaunator = require('delaunator');
const Hallway = require('./hallway');
const Point = require("@cozy-caves/utils").Point;
const DisjointSet = require("./disjointSet");
const Tile = require("../tile/tile");
const { TileID } = require('@cozy-caves/utils');
const { tilerChooser } = require("../tile/tilerLogic");
const seedrandom = require('seedrandom');

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

var rooms = [];

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

function generateCurrentMap() {
    for (room of rooms) {
        let roomPos = room.getPosition();
        let roomX = roomPos.getX();
        let roomY = roomPos.getY();

        for (let tile of room.getTiles()) {
            map[roomX + tile.getPosition().getX()][roomY + tile.getPosition().getY()] = rooms.indexOf(room);
        }
    }
}
function mergeHallways(hallways, hallwayMap) {

    let disjointSet = new DisjointSet();

    for (key in hallways) {
        disjointSet.makeSet(key);
    }

    for (key in hallways) {
        let hallway = hallways[key].room;
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
            let currentList = mergedHallways.get(parent);
            currentList.push(hallways[key].room);
            mergedHallways.set(parent, currentList);
        } else {
            let list = [hallways[key].room];
            mergedHallways.set(parent, list);
        }
    }

    return mergedHallways;
}

function generateHallways(roomsList, w, h) {
    midPoints = { };
    roomToRoomConnections = [];
    hallways = [];
    rooms = roomsList;
    const midpoints = [];
    map = [...Array(w)].map(e => Array(h).fill(-1));
    generateCurrentMap();
    for (let key in rooms) {
        point = getmidPoint(rooms[key]);
        midPoints[key] = point;
        midpoints.push(point.getX());
        midpoints.push(point.getY());
    }
    const delaunay = new Delaunator.default(midpoints);
    let triangles = delaunay.triangles;

    mapConnections(triangles);
    let mst = minimumSpanningTree();
    for (key in mst) {
        createHallway(mst[key]);
    }   


    let hallwayMap = [...Array(w)].map(e => Array(h).fill(-1));
    let toMergeMap = mergeHallways(hallways, hallwayMap);

    let finalHallways = [];
    toMergeMap.forEach((hallwayArray) => {
        let hallway = hallwayArray[0];
        if (hallwayArray.length > 1) hallway = hallwayArray[0].merge(hallwayArray.slice(1));
        rooms.push(hallway);
        finalHallways.push(hallway);
    });


    for(hallway of finalHallways) {
        hallway.getTiles().forEach(tile => tilerChooser.getTiler("hallway").updateTile(tile, hallway, seedrandom(Math.random())));
        hallway.getTiles().forEach(tile => tilerChooser.getTiler("hallway").updateTile(tile, hallway, seedrandom(Math.random())));
        hallway.getTiles().forEach((tile) => tile.setTileID(tilerChooser.getTiler("hallway").getID(tile, hallway, seedrandom(Math.random()))));
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

function minimumSpanningTree() {
    const mst = [];
    const disjointSet = new DisjointSet();

    for (const room in rooms) {
        disjointSet.makeSet(room);
    }

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

function createHallway(conn) {
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
    if (relativeX == RelativePosX.LEFT && relativeY == RelativePosY.UP) {
        return HallwayShapes.RIGHT_TOP;
        //other options can be randomly done later    console.log(conn.to);
    } else if (relativeX == RelativePosX.RIGHT && relativeY == RelativePosY.UP) {
        return HallwayShapes.LEFT_TOP;
        //other options can be randomly done later
    } else if (relativeX == RelativePosX.OVERLAP && relativeY == RelativePosY.UP) {
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
    
    //FOR CORNER CONNECTIONS
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

    let hallway = new Hallway();

    if (shape == HallwayShapes.RIGHT_TOP) {
        hallway.room.setPosition(new Point(startingX, startingY-1));
        addTilesFloor(1, diffX, hallway, true, 1);
        addTilesFloor(1, diffY, hallway, false, diffX);
        addTilesWall(0, diffX + 1, hallway, true, 1);
        addTilesWall(1, diffY + 1, hallway, false, diffX);
    } 
    
    else if (shape == HallwayShapes.DOWN_LEFT) {
        hallway.room.setPosition(new Point(startingX-1, startingY));
        addTilesFloor(1, diffY, hallway, false, 1);
        addTilesFloor(1, diffX, hallway, true, diffY);
        addTilesWall(0, diffY + 1, hallway, false, 1);
        addTilesWall(1, diffX + 1, hallway, true, diffY);
    }

    else if (shape == HallwayShapes.RIGHT_DOWN) {
        hallway.room.setPosition(new Point(startingX, toY));
        addTilesFloor(1, diffX, hallway, true, diffY);
        addTilesFloor(diffY, 1, hallway, false, diffX);
        addTilesWall(0, diffX, hallway, true, diffY);
        addTilesWall(diffY + 1, 0, hallway, false, diffX);
    }

    else if (shape == HallwayShapes.TOP_LEFT) {
        hallway.room.setPosition(new Point(startingX-1, toY-1));
        addTilesFloor(diffY, 1, hallway, false, 1);
        addTilesFloor(1, diffX, hallway, true, 1);
        addTilesWall(diffY + 1, 0, hallway, false, 1);
        addTilesWall(1, diffX + 1, hallway, true, 1);
    } 
    
    else if (shape == HallwayShapes.LEFT_RIGHT) {
        if (diffX == 1) {
            hallway.room.addTile(new Tile("floor", new Point(0, 0)));
            hallway.room.addTile(new Tile("floor", new Point(1, 0)));
            hallway.room.setPosition(new Point(toX, startingY));
        } else {
            hallway.room.setPosition(new Point(toX, startingY-1));
            addTilesFloor(1, diffX-1, hallway, true, 1);
            addTilesWall(0, diffX, hallway, true, 1);
        }
        
    } 
    
    else if (shape == HallwayShapes.TOP_DOWN) {
        if (diffY == 1) {
            hallway.room.addTile(new Tile("floor", new Point(1, 0)));
            hallway.room.addTile(new Tile("floor", new Point(1, 1)));
            hallway.room.setPosition(new Point(startingX-1, toY));
        } else {
            hallway.room.setPosition(new Point(startingX-1, toY));
            addTilesFloor(1, diffY-1, hallway, false, 1);
            addTilesWall(0, diffY, hallway, false, 1);
        }
    } else {
        return;
    }

    hallways.push(hallway);
}

function addTilesWall(start, end, hallway, isOnX, floorPos) {
    if(start < end) {
        for (let i = start; i <= end; i++) {
            let floorPoint = isOnX ? new Point(i, floorPos) : new Point(floorPos, i);
            let previousFloor = isOnX ? new Point(i - 1, floorPos) : new Point(floorPos, i - 1);
            let nextFloor = isOnX ? new Point(i + 1, floorPos) : new Point(floorPos, i + 1);
            let point = isOnX ? new Point(i, floorPos-1) : new Point(floorPos - 1, i);
            let otherPoint = isOnX ? new Point(i, floorPos+1) : new Point(floorPos+1, i);

            let anchors = [floorPoint];
            if (i !== end) anchors.push(nextFloor);
            if (i !== start) anchors.push(previousFloor);

            addTileHallway(hallway, new Tile("wall", point), anchors);
            addTileHallway(hallway, new Tile("wall", otherPoint), anchors);
        }
    } else {
        for (let i = start; i >= end; i--) {
            let floorPoint = isOnX ? new Point(i, floorPos) : new Point(floorPos, i);
            let previousFloor = isOnX ? new Point(i + 1, floorPos) : new Point(floorPos, i + 1);
            let nextFloor = isOnX ? new Point(i - 1, floorPos) : new Point(floorPos, i - 1);
            let point = isOnX ? new Point(i, floorPos-1) : new Point(floorPos - 1, i);
            let otherPoint = isOnX ? new Point(i, floorPos+1) : new Point(floorPos+1, i);

            let anchors = [floorPoint];
            if (i !== end) anchors.push(nextFloor);
            if (i !== start) anchors.push(previousFloor);

            addTileHallway(hallway, new Tile("wall", point), anchors);
            addTileHallway(hallway, new Tile("wall", otherPoint), anchors);
        }
    }
}

function addTilesFloor(start, end, hallway, isOnX, floorPos) {
    if(start < end) {
        for (let i = start; i <= end; i++) {
            let point = isOnX ? new Point(i, floorPos) : new Point(floorPos, i);
            addTileHallway(hallway, new Tile("floor", point));
        }
    } else {
        for (let i = start; i >= end; i--) {
            let point = isOnX ? new Point(i, floorPos) : new Point(floorPos, i);
            addTileHallway(hallway, new Tile("floor", point));
        }
    }
}

function addTileHallway(hallway, tile, tileAnchorPositions) {
    let hallwayPos = hallway.room.getPosition();
    let tileGlobalPos = tile.getPosition().add(hallwayPos);
    let roomIndex = map[tileGlobalPos.getX()][tileGlobalPos.getY()];

    if (tileAnchorPositions) {
        let foundAnchor = false;
        for (let tileAnchorPos of tileAnchorPositions) {
            let tileAnchor = hallway.room.getTile(tileAnchorPos);
            if (tileAnchor) foundAnchor = true;
        }

        if (!foundAnchor) return;

        if (roomIndex < 0) {
            hallway.room.addTile(tile);
        } 
    } else {
        if (roomIndex < 0 && hallway.overlappingRoom) {
            let roomMinimumPos = hallway.overlappingRoom.getPosition();
            let roomMaximumPos = roomMinimumPos.add(hallway.overlappingRoom.getDimensions()).subtract(new Point(1, 1));
            let overlappingX = tileGlobalPos.getX() >= roomMinimumPos.getX() && tileGlobalPos.getX() <= roomMaximumPos.getX();
            let overlappingY = tileGlobalPos.getY() >= roomMinimumPos.getY() && tileGlobalPos.getY() <= roomMaximumPos.getY();
            if(!overlappingX || !overlappingY) hallway.overlappingRoom = undefined;
        }
    
        if (roomIndex < 0 && !hallway.overlappingRoom) {
            hallway.room.addTile(tile);
        } else if (roomIndex > 0) {
            hallway.overlappingRoom = rooms[roomIndex];   
        }
    }
}

module.exports = generateHallways;