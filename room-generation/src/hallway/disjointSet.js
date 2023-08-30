class DisjointSet {

    constructor() {
        this.parent = new Map();
    }

    makeSet(room) {
        this.parent.set(room, room);
    }

    findSet(room) {

        if (this.parent.get(room) === room) {
            return room;
        }
        return this.findSet(this.parent.get(room));
    }

    union(room, otherRoom) {

        const rootOfRoom = this.findSet(room);
        const rootOfOtherRoom = this.findSet(otherRoom);
        this.parent.set(rootOfRoom, rootOfOtherRoom);
    }

}

module.exports = DisjointSet;