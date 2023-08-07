const Tile = require("./tile/tile");

class Layout {
    #tags = [];
    #tiles = {};
    #scalePartitions = [];

    addTag(tag) { this.#tags.push(tag); }
    removeTag(tag) { this.#tags.splice(this.#tags.indexOf(tag), 1); }
    addTile(tile, partitionNum) { this.#tiles[tile.x + "," + tile.y] = { tile, partitionNum }; }
    addPartition() { this.#scalePartitions.push(new ScalePartition()); }

    getTags() { return this.#tags; }
    getTile() { return this.#tiles; }
    getPartition(index) { return this.#scalePartitions[index]; }
}

class ScalePartition {
    #lockRatio = true;
    #lockX = false;
    #lockY = false;
    #scaleByOneX = true;
    #scaleByOneY = true;
    #xDir = 1;
    #yDir = 1;

    setLockRatio(lockRatio) { this.#lockRatio = lockRatio; }
    setLockX(lockX) { this.#lockX = lockX; }
    setLockY(lockY) { this.#lockY = lockY; }
    setScaleByOneX(scaleByOneX) { this.#scaleByOneX = scaleByOneX; }
    setScaleByOneY(scaleByOneY) { this.#scaleByOneY = scaleByOneY; }
    setXDir(xDir) { this.#xDir = xDir; }
    setYDir(yDir) { this.#yDir = yDir; }

    getLockRatio() { return this.#lockRatio; }
    getLockX() { return this.#lockX; }
    getLockY() { return this.#lockY; }
    getScaleByOneX() { return this.#scaleByOneX; }
    getScaleByOneY() { return this.#scaleByOneY; }
    getXDir() { return this.#xDir; }
    getYDir() { return this.#yDir; }
}

// VERY TEMP, there should be a layout editor and a layout loader!
const exampleLayout = new Layout();
exampleLayout.addPartition();
exampleLayout.addPartition();
exampleLayout.getPartition(0).setLockY(true);
exampleLayout.getPartition(0).setXDir(1);
exampleLayout.getPartition(0).setScaleByOneX(true);

exampleLayout.getPartition(1).setXDir(1);
exampleLayout.getPartition(1).setYDir(1);
exampleLayout.getPartition(1).setScaleByOneX(true);
exampleLayout.getPartition(1).setScaleByOneY(true);
exampleLayout.getPartition(1).setLockRatio(false);

exampleLayout.getPartition(2).setXDir(1);
exampleLayout.getPartition(2).setYDir(1);
exampleLayout.getPartition(2).setScaleByOneX(true);
exampleLayout.getPartition(2).setScaleByOneY(true);
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

module.exports = { Layout, }
