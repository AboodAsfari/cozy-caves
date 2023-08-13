const Point = require("../../utils/point");
const Tile = require("./tile/tile");

class Layout {
    #tags = [];
    #excludedTiles = new Map();
    #unscaledTiles = new Map();
    #scalePartitions = [];

    scaleRoom(maxDimensions, leniency) {
        // Each loop, if width/height hasnt changed and still usbt valid, then room is invalid.

        // Keep scaling X in every partition, track how many times scaled.
        // X SCALING LOGIC HERE.
        // If width meets min valid width, stop scaling X.
        // If width over max valid width, room is invalid

        // Keep scaling Y in every partition, track how many times scaled.
        // Y SCALING LOGIC HERE.
        // If height meets min valid height, stop scaling Y.
        // If height over max valid height, room is invalid.

        // Make sure all partitions with locked ratio have equal scaling, and are still valid.
    }

    addTile(tile, partitionNum) { 
        if (partitionNum === -1) this.#unscaledTiles.set(tile.getPosition().toString(), tile);
        else if (partitionNum === -2) this.#excludedTiles.set(tile.getPosition().toString(), tile);
        else this.#scalePartitions[partitionNum].set(tile.getPosition().toString(), tile);  
    }

    removeTile(pos, deleteExcluded = false) {
        if (deleteExcluded) this.#excludedTiles.delete(pos);
        this.#unscaledTiles.delete(pos);
        for (let i = this.#scalePartitions.length - 1; i >= 0; i--) {
            this.#scalePartitions[i].delete(pos);
        }
    }

    addTag(tag) { this.#tags.push(tag); }
    removeTag(tag) { this.#tags.splice(this.#tags.indexOf(tag), 1); }
    newPartition() { this.#scalePartitions.push(new ScalePartition()); }

    getTags() { return this.#tags; }
    getPartition(index) { return this.#scalePartitions[index]; }
}

class ScalePartition {
    #lockRatio = true;
    #lockX = false;
    #lockY = false;
    #scaleInMultiplesX = true;
    #scaleInMultiplesY = true;
    #incrementAmtX = 1;
    #incrementAmtY = 1;
    #xDir = 1;
    #yDir = 1;

    #scaledCountX = 0;
    #scaledCountY = 0;
    #maxEncountered = { x: 0, y: 0 };
    #minEncountered = { x: 0, y: 0 };
    #edgesRight = new Map(); 
    #edgesLeft = new Map();
    #edgesTop = new Map();
    #edgesBottom = new Map();
    #tiles = new Map();
    #scaledTiles = new Map();

    constructor() {
        this.resetScaling();
    }

    resetScaling() {
        this.#scaledCountX = 0;
        this.#scaledCountY = 0;
        this.#maxEncountered = { x: 0, y: 0 };
        this.#minEncountered = { x: 0, y: 0 };
        this.#edgesRight.clear();
        this.#edgesLeft.clear();
        this.#edgesTop.clear();
        this.#edgesBottom.clear();
        this.#scaledTiles.clear();

        for (const [key, value] of this.#tiles.entries()) {
            this.#scaledTiles.set(key, value);
        }
    }

    scale(layout, selfIndex) {
        // SCALING LOGIC HERE
    }

    setLockRatio(lockRatio) { this.#lockRatio = lockRatio; }
    setLockX(lockX) { this.#lockX = lockX; }
    setLockY(lockY) { this.#lockY = lockY; }
    setScaleByOneX(scaleInMultiplesX) { this.#scaleInMultiplesX = scaleInMultiplesX; }
    setScaleByOneY(scaleInMultiplesY) { this.#scaleInMultiplesY = scaleInMultiplesY; }
    setIncrementAmtX(incrementAmtX) { this.#incrementAmtX = incrementAmtX; }
    setIncrementAmtY(incrementAmtY) { this.#incrementAmtY = incrementAmtY; }
    setXDir(xDir) { this.#xDir = xDir; }
    setYDir(yDir) { this.#yDir = yDir; }

    getLockRatio() { return this.#lockRatio; }
    getLockX() { return this.#lockX; }
    getLockY() { return this.#lockY; }
    getScaleInMultiplesX() { return this.#scaleInMultiplesX; }
    getScaleInMultiplesY() { return this.#scaleInMultiplesY; }
    getIncrementAmtX() { return this.#incrementAmtX; }
    getIncrementAmtY() { return this.#incrementAmtY; }
    getXDir() { return this.#xDir; }
    getYDir() { return this.#yDir; }

    addTile(tile) { this.#tiles.set(tile.getPosition().toString(), tile); }
}

// VERY TEMP, there should be a layout editor and a layout loader!
const exampleLayout = new Layout();
exampleLayout.addPartition();
exampleLayout.addPartition();
exampleLayout.addPartition();
exampleLayout.getPartition(0).setLockY(true);
exampleLayout.getPartition(0).setXDir(1);
exampleLayout.getPartition(0).setScaleByIncrementX(false);

exampleLayout.getPartition(1).setXDir(1);
exampleLayout.getPartition(1).setYDir(1);
exampleLayout.getPartition(1).setScaleByIncrementX(false);
exampleLayout.getPartition(1).setScaleByIncrementY(false);
exampleLayout.getPartition(1).setLockRatio(false);

exampleLayout.getPartition(2).setXDir(1);
exampleLayout.getPartition(2).setYDir(1);
exampleLayout.getPartition(2).setScaleByIncrementX(false);
exampleLayout.getPartition(2).setScaleByIncrementY(false);
exampleLayout.getPartition(2).setLockRatio(false);

exampleLayout.addTile(new Tile("floor", new Point(0, 0)), 2);
exampleLayout.addTile(new Tile("wall", new Point(-1, 0)), -1);
exampleLayout.addTile(new Tile("wall", new Point(1, 0)), 0);
exampleLayout.addTile(new Tile("wall", new Point(0, 1)), 1);
exampleLayout.addTile(new Tile("wall", new Point(0, -1)), -1);
exampleLayout.addTile(new Tile("wall", new Point(1, -1)), 0);
exampleLayout.addTile(new Tile("wall", new Point(-1, -1)), -1);
exampleLayout.addTile(new Tile("wall", new Point(-1, 1)), 1);
exampleLayout.addTile(new Tile("wall", new Point(1, 1)), 1);
// Temp layout ends here.

module.exports = { Layout, exampleLayout }
