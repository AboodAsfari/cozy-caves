const Delaunator = require('delaunator');
const Room = require('../room/room');
const Point = require("@cozy-caves/utils").Point;

const roomToRoomConnections = { };

function getmidPoint(room) {
    let point = room.getPosition();
    let x = point.getX();
    let y = point.getY();
    let dims = room.getDimensions();
    let w = dims.getX();
    let h = dims.getY();
    return new Point(x + Math.round((w/2)), y + Math.round(h/2));
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
    console.log(triangles);

    mapConnections(triangles);
    console.log(roomToRoomConnections);

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
    if (!roomToRoomConnections[room]) {
        roomToRoomConnections[room] = new Set();
    }
    roomToRoomConnections[room].add(otherRoom);
}

module.exports = generateHallways;

