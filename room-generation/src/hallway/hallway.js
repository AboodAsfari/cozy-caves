const Room = require('../room/room');

class Hallway{
    overlappingRoom;
    room = new Room();

    setOverlappingRoom(overlappingRoom) {     
        this.overlappingRoom = overlappingRoom;
    }
}

module.exports = Hallway;