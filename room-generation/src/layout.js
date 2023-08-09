const Tile = require("./tile/tile");

class Layout {
    #tags = [];
    #tiles = new Map();;
    #scalePartitions = [];

    getRoom() {
        console.log("MAKING ROOM");
        console.log(this.#tags.length);
        for (const [key, value] of this.#tiles.entries()) {
            console.log(value.tile.getTileType());
        }
    }

    scaleRoom() {
        // each scale, if width/height hasnt changed and still not valid, then room not valid

        // keep scaling x every partition by 1, track how many times scaled
        // X SCALING LOGIC HERE
        // if width meets min valid width, stop scaling x
        // if width over max valid width, room is invalid

        // keep scaling y every partition by 1, track how many times scaled
        // y SCALING LOGIC HERE
        // if width meets min valid width, stop scaling y
        // if width over max valid width, room is invalid

        // after all done, make sure all partitions with locked ratio have equal scaling, and are still valid

        // LOGIC SPECIFICS

        // scaling by one
        // track edges on x and y, for both directions
        // for each edge in direction, add increment number of tiles in that direction
        // if direction is center,  then for both dirs but half the increment amount (must be even)

        // normal scaling
        // find origin x or y depending on if scaling x or y as well as dir, if center then find all axis values and get median (can have 2 origins if even)
        // put gap along axis starting from origin, going towards dir, or both dirs if center
        // fill gaps and outer edges with tile in opposite dir.
    }

    addTag(tag) { this.#tags.push(tag); }
    removeTag(tag) { this.#tags.splice(this.#tags.indexOf(tag), 1); }
    addTile(tile, partitionNum) { this.#tiles.set(tile.getPosition().x + "," + tile.getPosition().y, { tile, partitionNum });  }
    addPartition() { this.#scalePartitions.push(new ScalePartition()); }

    getTags() { return this.#tags; }
    getTile() { return this.#tiles; }
    getPartition(index) { return this.#scalePartitions[index]; }
}

class ScalePartition {
    #lockRatio = true;
    #lockX = false;
    #lockY = false;
    #scaleByIncrementX = true;
    #scaleByIncrementY = true;
    #incrementAmtX = 1;
    #incrementAmtY = 1;
    #xDir = 1;
    #yDir = 1;

    setLockRatio(lockRatio) { this.#lockRatio = lockRatio; }
    setLockX(lockX) { this.#lockX = lockX; }
    setLockY(lockY) { this.#lockY = lockY; }
    setScaleByOneX(scaleByIncrementX) { this.#scaleByIncrementX = scaleByIncrementX; }
    setScaleByOneY(scaleByIncrementY) { this.#scaleByIncrementY = scaleByIncrementY; }
    setIncrementAmtX(incrementAmtX) { this.#incrementAmtX = incrementAmtX; }
    setIncrementAmtY(incrementAmtY) { this.#incrementAmtY = incrementAmtY; }
    setXDir(xDir) { this.#xDir = xDir; }
    setYDir(yDir) { this.#yDir = yDir; }

    getLockRatio() { return this.#lockRatio; }
    getLockX() { return this.#lockX; }
    getLockY() { return this.#lockY; }
    getScaleByIncrementX() { return this.#scaleByIncrementX; }
    getScaleByIncrementY() { return this.#scaleByIncrementY; }
    getIncrementAmtX() { return this.#incrementAmtX; }
    getIncrementAmtY() { return this.#incrementAmtY; }
    getXDir() { return this.#xDir; }
    getYDir() { return this.#yDir; }
}

// VERY TEMP, there should be a layout editor and a layout loader!
const exampleLayout = new Layout();
exampleLayout.addPartition();
exampleLayout.addPartition();
exampleLayout.addPartition();
exampleLayout.getPartition(0).setLockY(true);
exampleLayout.getPartition(0).setXDir(1);
exampleLayout.getPartition(0).setScaleByIncrementX(true);

exampleLayout.getPartition(1).setXDir(1);
exampleLayout.getPartition(1).setYDir(1);
exampleLayout.getPartition(1).setScaleByIncrementX(true);
exampleLayout.getPartition(1).setScaleByIncrementY(true);
exampleLayout.getPartition(1).setLockRatio(false);

exampleLayout.getPartition(2).setXDir(1);
exampleLayout.getPartition(2).setYDir(1);
exampleLayout.getPartition(2).setScaleByIncrementX(true);
exampleLayout.getPartition(2).setScaleByIncrementY(true);
exampleLayout.getPartition(2).setLockRatio(false);

exampleLayout.addTile(new Tile("floor", { x: 0, y: 0 }), 2);
exampleLayout.addTile(new Tile("wall", { x: -1, y: 0 }), -1);
exampleLayout.addTile(new Tile("wall", { x: 1, y: 0 }), 0);
exampleLayout.addTile(new Tile("wall", { x: 0, y: 1 }), 1);
exampleLayout.addTile(new Tile("wall", { x: 0, y: -1 }), -1);
exampleLayout.addTile(new Tile("wall", { x: 1, y: -1 }), 0);
exampleLayout.addTile(new Tile("wall", { x: -1, y: -1 }), -1);
exampleLayout.addTile(new Tile("wall", { x: -1, y: 1 }), 1);
exampleLayout.addTile(new Tile("wall", { x: 1, y: 1 }), 1);
// Temp layout ends here.

module.exports = { Layout, exampleLayout }
