const Delaunator = require('delaunator');
const Room = require('../room/room');
const Point = require("@cozy-caves/utils").Point;

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

    let coordinates = [];
    for (let i = 0; i < triangles.length; i += 3) {
        let points = [];
        coordinates.push([
            points[triangles[i]],
            points[triangles[i + 1]],
            points[triangles[i + 2]]
        ]);
    }
    console.log(coordinates);
}

module.exports = generateHallways;

