const Delaunator = require('delaunator');
const Hallway = require('./hallway');
const Point = require("@cozy-caves/utils").Point;
const DisjointSet = require("./disjointSet");
const Tile = require("../tile/tile");
const { TileID } = require('@cozy-caves/utils');
const { tilerChooser } = require("../tile/tilerLogic");
const seedrandom = require('seedrandom');
const { hallwayTileUpdater } = require('../tile/tilers/hallwayTiler');

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
    MERGED: 'M',
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
function findHallwayOverlap(hallways, hallwayMap) {

    let disjointSet = new DisjointSet();

    for (key in hallways) {
        disjointSet.makeSet(key);
    }

    for (key in hallways) {
        let hallway = hallways[key].getRoom();
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
            currentList.push(hallways[key]);
            mergedHallways.set(parent, currentList);
        } else {
            let list = [hallways[key]];
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
    let toMergeMap = findHallwayOverlap(hallways, hallwayMap);

    let finalHallways = [];
    toMergeMap.forEach((hallwayArray) => {
        let hallway = hallwayArray[0];
        if (hallwayArray.length > 1) { 
            hallway = hallwayArray[0].merge(hallwayArray.slice(1));
            hallway.setShape(HallwayShapes.MERGED);
        }
        rooms.push(hallway.getRoom());
        finalHallways.push(hallway);
    });


    for(hallway of finalHallways) {
        hallway.getRoom().getTiles().forEach(tile => tilerChooser.getTiler("hallway").updateTile(tile, hallway.getRoom(), seedrandom(Math.random())));
        hallway.getRoom().getTiles().forEach(tile => tilerChooser.getTiler("hallway").updateTile(tile, hallway.getRoom(), seedrandom(Math.random())));
        hallway.getRoom().getTiles().forEach((tile) => tile.setTileID(tilerChooser.getTiler("hallway").getID(tile, hallway.getRoom(), seedrandom(Math.random()))));
        hallway.getTilesToOpen().forEach((value, key) => {
            value.forEach((item) => {
                rooms[key].openTiles(item.roomTilesToOpen, item.hallwayTilesToOpen, hallway, seedrandom(Math.random()));
            });
        });
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
    mstFailHandler(mst);
    return mst;
}

function mstFailHandler(mst) {
    for (let i = 0; i < rooms.length-1; i++) {
        mst.push({
            from: i,
            to: i+1
        });
    }
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
        //other options can be randomly done later
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

    let hallway = new Hallway();

    if (shape == HallwayShapes.RIGHT_TOP) {
        hallway.setShape(HallwayShapes.RIGHT_TOP);
        hallway.getRoom().setPosition(new Point(startingX, startingY-1));
        hallway.setPreviousPosition(new Point(0, 1));
        addTilesFloor(1, diffX, hallway, true, 1);
        addTilesFloor(2, diffY, hallway, false, diffX);
        addTilesWall(0, diffX + 1, hallway, true, 1);
        addTilesWall(1, diffY + 1, hallway, false, diffX);
        openPositions(hallway, fromPos, 1, false);
        openPositions(hallway, toPos, -1, true);
    } 
    
    else if (shape == HallwayShapes.DOWN_LEFT) {
        hallway.setShape(HallwayShapes.DOWN_LEFT);
        hallway.getRoom().setPosition(new Point(startingX-1, startingY));
        hallway.setPreviousPosition(new Point(1, 0));
        addTilesFloor(1, diffY, hallway, false, 1);
        addTilesFloor(2, diffX, hallway, true, diffY);
        addTilesWall(0, diffY + 1, hallway, false, 1);
        addTilesWall(1, diffX + 1, hallway, true, diffY);
        openPositions(hallway, fromPos, 1, true);
        openPositions(hallway, toPos, -1, false);
    }

    else if (shape == HallwayShapes.RIGHT_DOWN) {
        hallway.setShape(HallwayShapes.RIGHT_DOWN);
        hallway.getRoom().setPosition(new Point(startingX, toY));
        hallway.setPreviousPosition(new Point(0, diffY));
        addTilesFloor(1, diffX, hallway, true, diffY);
        addTilesFloor(diffY-1, 1, hallway, false, diffX);
        addTilesWall(0, diffX, hallway, true, diffY);
        addTilesWall(diffY + 1, 0, hallway, false, diffX);
        openPositions(hallway, fromPos, 1, false);
        openPositions(hallway, toPos, 1, true);
    }

    else if (shape == HallwayShapes.TOP_LEFT) {
        hallway.setShape(HallwayShapes.TOP_LEFT);
        hallway.getRoom().setPosition(new Point(startingX-1, toY-1));
        hallway.setPreviousPosition(new Point(1, diffY+1));
        addTilesFloor(diffY, 1, hallway, false, 1);
        addTilesFloor(2, diffX, hallway, true, 1);
        addTilesWall(diffY + 1, 0, hallway, false, 1);
        addTilesWall(1, diffX + 1, hallway, true, 1);
        openPositions(hallway, fromPos, -1, true);
        openPositions(hallway, toPos, -1, false);
    } 
    
    else if (shape == HallwayShapes.LEFT_RIGHT) {
        hallway.setShape(HallwayShapes.LEFT_RIGHT);
        if (diffX == 1) {
            hallway.getRoom().addTile(new Tile("floor", new Point(0, 0)));
            hallway.getRoom().addTile(new Tile("floor", new Point(1, 0)));
            hallway.getRoom().setPosition(new Point(toX, startingY));
            //special open positions 
        } else {
            hallway.getRoom().setPosition(new Point(toX, startingY-1));
            hallway.setPreviousPosition(new Point(diffX, 1));
            addTilesFloor(diffX-1, 1, hallway, true, 1);
            addTilesWall(diffX, 0, hallway, true, 1);
            openPositions(hallway, fromPos, -1, false);
            openPositions(hallway, toPos, 1, false);
        }
    } 
    
    else if (shape == HallwayShapes.TOP_DOWN) {
        hallway.setShape(HallwayShapes.TOP_DOWN);
        if (diffY == 1) {
            hallway.getRoom().addTile(new Tile("floor", new Point(1, 0)));
            hallway.getRoom().addTile(new Tile("floor", new Point(1, 1)));
            hallway.getRoom().setPosition(new Point(startingX-1, toY));
            //special open positions
        } else {
            hallway.getRoom().setPosition(new Point(startingX-1, toY));
            hallway.setPreviousPosition(new Point(1, diffY));
            addTilesFloor(diffY-1, 1, hallway, false, 1);
            addTilesWall(diffY, 0, hallway, false, 1);
            openPositions(hallway, fromPos, -1, true);
            openPositions(hallway, toPos, 1, true);
        }
    } else {
        return;
    }
    for(entryPosition of hallway.getRoomEntryPositions()) {
        let globalPosition = entryPosition.position.add(hallway.getRoom().getPosition());
        let direction = entryPosition.direction.getX() == 0 ? entryPosition.direction.getY() : entryPosition.direction.getX();
        let horizontal = entryPosition.direction.getX() == 0;
        openPositions(hallway, globalPosition, direction, horizontal);
    }
    hallways.push(hallway);
}

function openPositions(hallway, pos, offset, horizontal) {
    let roomsMap = new Map();
    let hallwayPositions = [];
    
    for (let i = 0; i <= 1; i++) {
        let pointAbove;
        let pointAt;
        let pointBelow;
        if (horizontal) {
            pointAbove = new Point(pos.getX() - 1, pos.getY() + (i*offset));
            pointAt = new Point(pos.getX(), pos.getY() + (i*offset));
            pointBelow = new Point(pos.getX() + 1, pos.getY() + (i*offset));
        } else {
            pointAbove = new Point(pos.getX() + (i*offset), pos.getY() - 1);
            pointAt = new Point(pos.getX() + (i*offset), pos.getY());
            pointBelow = new Point(pos.getX() + (i*offset), pos.getY() + 1);
        }
        
        let indexAbove = map[pointAbove.getX()][pointAbove.getY()];
        let indexAt = map[pointAt.getX()][pointAt.getY()];
        let indexBelow = map[pointBelow.getX()][pointBelow.getY()];
        if (indexAbove >= 0) {
            if (!roomsMap.get(indexAbove)) {
                roomsMap.set(indexAbove, [pointAbove]);
            } else {
                roomsMap.get(indexAbove).push(pointAbove);
            }
        } else {
            let localHallwayPoint = pointAbove.subtract(hallway.getRoom().getPosition());
            if (hallway.getRoom().getTile(localHallwayPoint)) { 
                hallwayPositions.push(pointAbove);
            }
        }
        if (indexAt >= 0) {
            if (!roomsMap.get(indexAt)) {
                roomsMap.set(indexAt, [pointAt]);
            } else {
                roomsMap.get(indexAt).push(pointAt);
            }
        } else {
            hallwayPositions.push(pointAt);
        }
        if (indexBelow >= 0) {
            if (!roomsMap.get(indexBelow)) {
                roomsMap.set(indexBelow, [pointBelow]);
            } else {
                roomsMap.get(indexBelow).push(pointBelow);
            }
        } else {
            let localHallwayPoint = pointBelow.subtract(hallway.getRoom().getPosition());
            if (hallway.getRoom().getTile(localHallwayPoint)) {
                hallwayPositions.push(pointBelow); 
            }
        }
    }

    

    for(let [key, value] of roomsMap.entries()) {    
        hallway.addTilesToOpen(key, {
            roomTilesToOpen: value,
            hallwayTilesToOpen: hallwayPositions,
        });
    }    
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
    let hallwayPos = hallway.getRoom().getPosition();
    let tileGlobalPos = tile.getPosition().add(hallwayPos);
    let roomIndex = map[tileGlobalPos.getX()][tileGlobalPos.getY()];

    if (tileAnchorPositions) {
        let foundAnchor = false;
        for (let tileAnchorPos of tileAnchorPositions) {
            let tileAnchor = hallway.getRoom().getTile(tileAnchorPos);
            if (tileAnchor) foundAnchor = true;
        }

        if (!foundAnchor) return;
        if (roomIndex < 0) hallway.getRoom().addTile(tile);
    } else {
        if (roomIndex < 0) hallway.addPossibleTile(tile);
        else {
            // Check if the room index is stored -> return
            // Store the room index
            if (hallway.getEnteredRooms().has(roomIndex)) {
                //return;
            } else {
                hallway.addEnteredRoomIndex(roomIndex);
                hallway.addRoomEntryPosition({position:tile.getPosition(), direction:hallway.getPreviousPosition().subtract(tile.getPosition())});
                hallway.getRoom().addTile(new Tile('floor', tile.getPosition()));
            }
            hallway.clearPossibleTiles();
        }

        if (roomIndex < 0 && hallway.getOverlappingRoom()) {
            let roomMinimumPos = hallway.getOverlappingRoom().getPosition();
            let roomMaximumPos = roomMinimumPos.add(hallway.getOverlappingRoom().getDimensions()).subtract(new Point(1, 1));
            let overlappingX = tileGlobalPos.getX() >= roomMinimumPos.getX() && tileGlobalPos.getX() <= roomMaximumPos.getX();
            let overlappingY = tileGlobalPos.getY() >= roomMinimumPos.getY() && tileGlobalPos.getY() <= roomMaximumPos.getY();
            if(!overlappingX || !overlappingY) {
                //exit room
                hallway.setOverlappingRoom(undefined);
                hallway.getPossibleTiles().forEach(tile => hallway.getRoom().addTile(tile));
            }
        }
        
        if (roomIndex < 0 && !hallway.getOverlappingRoom()) hallway.getRoom().addTile(tile);
        else if (roomIndex > 0) hallway.setOverlappingRoom(rooms[roomIndex]);
        hallway.setPreviousPosition(tile.getPosition());
    }
}

module.exports = generateHallways;