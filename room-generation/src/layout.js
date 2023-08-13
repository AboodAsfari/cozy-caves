const Point = require("../../utils/point");
const Tile = require("./tile/tile");

class Layout {
    #tags = [];
    #excludedTiles = new Map();
    #unscaledTiles = new Map();
    #scalePartitions = [];

    scaleRoom(dimensions, leniency) {
        for (let partition of this.#scalePartitions) {
            partition.resetScaling();
        }

        let oldDimensions = new Point(0, 0);

        console.log("WIDTH BEFORE SCALE: " + this.#getDimensions().getX());
        
        while (!this.#isValidX(dimensions, leniency, this.#getDimensions())) {
            let currDimensions = this.#getDimensions();
            if ((!this.#isValidX (dimensions, leniency, currDimensions) && currDimensions.getX() === oldDimensions.getX()) ||
                currDimensions.getX() > dimensions.getX() + leniency.getX()) return "BAD X";
            
            oldDimensions = currDimensions;
            
            for (let partition of this.#scalePartitions) {
                partition.scaleX(this);
            }
        }

        console.log("WIDTH AFTER SCALE: " + this.#getDimensions().getX());
        console.log("HEIGHT BEFORE SCALE: " + this.#getDimensions().getY());
        oldDimensions = new Point(0, 0);
        while (!this.#isValidY(dimensions, leniency, this.#getDimensions())) {
            let currDimensions = this.#getDimensions();
            if ((!this.#isValidY (dimensions, leniency, currDimensions) && currDimensions.getY() === oldDimensions.getY()) ||
                currDimensions.getY() > dimensions.getY() + leniency.getY()) return "BAD Y";
            oldDimensions = currDimensions;
            
            for (let partition of this.#scalePartitions) {
                partition.scaleY(this);
            }
        }
        console.log("HEIGHT AFTER SCALE: " + this.#getDimensions().getY());

        return this.#generateRoom();
        // Each loop, if width/height hasnt changed and still isnt valid, then room is invalid.

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

    #generateRoom() {
        return "ROOM!";
    }

    #isValid(goalDimensions, leniency, dimensions) {
        return this.#isValidX(goalDimensions, leniency, dimensions) && this.#isValidY(goalDimensions, leniency, dimensions);
    }

    #isValidX(goalDimensions, leniency, dimensions) {
        return dimensions.getX() >= goalDimensions.getX() - leniency.getX() && dimensions.getX() <= goalDimensions.getX() + leniency.getX();
    }

    #isValidY(goalDimensions, leniency, dimensions) {
        return dimensions.getY() >= goalDimensions.getY() - leniency.getY() && dimensions.getY() <= goalDimensions.getY() + leniency.getY();
    }

    #getDimensions() {
        let maxEncountered = new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        let minEncountered = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        for (let tile of this.#unscaledTiles.values()) {
            if (tile.getPosition().getX() > maxEncountered.getX()) maxEncountered.setX(tile.getPosition().getX());
            if (tile.getPosition().getX() < minEncountered.getX()) minEncountered.setX(tile.getPosition().getX());
            if (tile.getPosition().getY() > maxEncountered.getY()) maxEncountered.setY(tile.getPosition().getY());
            if (tile.getPosition().getY() < minEncountered.getY()) minEncountered.setY(tile.getPosition().getY());
        }
        for (let tile of this.#excludedTiles.values()) {
            if (tile.getPosition().getX() > maxEncountered.getX()) maxEncountered.setX(tile.getPosition().getX());
            if (tile.getPosition().getX() < minEncountered.getX()) minEncountered.setX(tile.getPosition().getX());
            if (tile.getPosition().getY() > maxEncountered.getY()) maxEncountered.setY(tile.getPosition().getY());
            if (tile.getPosition().getY() < minEncountered.getY()) minEncountered.setY(tile.getPosition().getY());
        }
        for (let partition of this.#scalePartitions) {
            if (partition.getMaxEncountered().getX() > maxEncountered.getX()) maxEncountered.setX(partition.getMaxEncountered().getX());
            if (partition.getMinEncountered().getX() < minEncountered.getX()) minEncountered.setX(partition.getMinEncountered().getX());
            if (partition.getMaxEncountered().getY() > maxEncountered.getY()) maxEncountered.setY(partition.getMaxEncountered().getY());
            if (partition.getMinEncountered().getY() < minEncountered.getY()) minEncountered.setY(partition.getMinEncountered().getY());
        }
        let width = maxEncountered.getX() - minEncountered.getX() + 1;
        let height = maxEncountered.getY() - minEncountered.getY() + 1;
        return new Point(width, height);
    }

    addTile(tile, partitionNum) { 
        if (!(tile instanceof Tile)) throw new Error('Invalid tile provided.');
        else if (partitionNum < -2) throw new Error('Invalid partition number provided.');
        else if (partitionNum === -2) this.#excludedTiles.set(tile.getPosition().toString(), tile);
        else if (partitionNum === -1) this.#unscaledTiles.set(tile.getPosition().toString(), tile);
        else this.#scalePartitions[partitionNum].addTile(tile);  
    }

    removeTile(pos, deleteExcluded = false) {
        if (!(pos instanceof Point)) throw new Error('Invalid position provided.');

        if (deleteExcluded) this.#excludedTiles.delete(pos);
        this.#unscaledTiles.delete(pos);
        for (let i = this.#scalePartitions.length - 1; i >= 0; i--) {
            this.#scalePartitions[i].removeTile(pos);
        }
    }

    addTag(tag) { this.#tags.push(tag.toString()); }
    removeTag(tag) { this.#tags.splice(this.#tags.indexOf(tag.toString()), 1); }
    newPartition() { this.#scalePartitions.push(new ScalePartition()); }

    getTags() { return this.#tags; }
    getPartition(index) {
        if (index < 0 || index >= this.#scalePartitions.length) return null;
        return this.#scalePartitions[index]; 
    }
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

    #scaledCountX;
    #scaledCountY;
    #maxEncountered;
    #minEncountered;
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
        this.#maxEncountered = new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        this.#minEncountered = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        this.#edgesRight.clear();
        this.#edgesLeft.clear();
        this.#edgesTop.clear();
        this.#edgesBottom.clear();
        this.#scaledTiles.clear();

        for (const [key, value] of this.#tiles.entries()) {
            this.#scaledTiles.set(key, value);
            this.#evaluatePoint(value.getPosition());
        }
    }

    scaleX(layout) {
        // SCALING LOGIC HERE
        this.#scaledCountX++;
        if (this.#scaleInMultiplesX) {

        } else {
            switch (this.#xDir) {
                case 1:
                    // console.log("ENCOUNTERED BEFORE X: " + this.#maxEncountered.getX())
                    for (const [key, value] of this.#edgesRight.entries()) {
                        let edgePos = new Point(value, key);
                        let edgeTile = this.#scaledTiles.get(edgePos.toString());
                        for (let i = 1; i <= this.#incrementAmtX; i++) {
                            let newPos = new Point(edgePos.getX() + i, edgePos.getY());
                            let newTile = new Tile(edgeTile.getTileType(), newPos);
                            layout.removeTile(newTile.getPosition());
                            this.#scaledTiles.set(newPos.toString(), newTile);
                            this.#evaluatePoint(newTile.getPosition());
                        }
                    }
                    // console.log("ENCOUNTERED AFTER X: " + this.#maxEncountered.getX())
                    // console.log("EDGES RIGHT AFTER X: " + this.#edgesRight.size);
                    break;
                default: 
                    throw new Error("Invalid scaling direction used");
            }
        }
    }

    scaleY(layout) {
        // SCALING LOGIC HERE
        this.#scaledCountY++;
        if (this.#scaleInMultiplesY) {

        } else {
            switch (this.#yDir) {
                case 1:
                    // console.log("ENCOUNTERED BEFORE X: " + this.#maxEncountered.getX())
                    for (const [key, value] of this.#edgesBottom.entries()) {
                        let edgePos = new Point(key, value);
                        let edgeTile = this.#scaledTiles.get(edgePos.toString());
                        for (let i = 1; i <= this.#incrementAmtY; i++) {
                            let newPos = new Point(edgePos.getX(), edgePos.getY() + i);
                            let newTile = new Tile(edgeTile.getTileType(), newPos);
                            layout.removeTile(newTile.getPosition());
                            this.#scaledTiles.set(newPos.toString(), newTile);
                            this.#evaluatePoint(newTile.getPosition());
                        }
                    }
                    // console.log("ENCOUNTERED AFTER X: " + this.#maxEncountered.getX())
                    // console.log("EDGES RIGHT AFTER X: " + this.#edgesRight.size);
                    break;
                default: 
                    throw new Error("Invalid scaling direction used");
            }
        }
    }    

    #evaluatePoint(pos) {
        if (!this.#edgesLeft.has(pos.getY()) || this.#edgesLeft.get(pos.getY()) > pos.getX()) this.#edgesLeft.set(pos.getY(), pos.getX());
        if (!this.#edgesRight.has(pos.getY()) || this.#edgesRight.get(pos.getY()) < pos.getX()) this.#edgesRight.set(pos.getY(), pos.getX());
        if (!this.#edgesTop.has(pos.getX()) || this.#edgesTop.get(pos.getX()) > pos.getY()) this.#edgesTop.set(pos.getX(), pos.getY());
        if (!this.#edgesBottom.has(pos.getX()) || this.#edgesBottom.get(pos.getX()) < pos.getY()) this.#edgesBottom.set(pos.getX(), pos.getY());
        if (this.#maxEncountered.getX() < pos.getX()) this.#maxEncountered.setX(pos.getX());
        if (this.#maxEncountered.getY() < pos.getY()) this.#maxEncountered.setY(pos.getY());
        if (this.#minEncountered.getX() > pos.getX()) this.#minEncountered.setX(pos.getX());
        if (this.#minEncountered.getY() > pos.getY()) this.#minEncountered.setY(pos.getY());
    }

    setLockRatio(lockRatio) { this.#lockRatio = !!lockRatio; }
    setLockX(lockX) { this.#lockX = !!lockX; }
    setLockY(lockY) { this.#lockY = !!lockY; }
    setScaleInMultiplesX(scaleInMultiplesX) { this.#scaleInMultiplesX = !!scaleInMultiplesX; }
    setScaleInMultiplesY(scaleInMultiplesY) { this.#scaleInMultiplesY = !!scaleInMultiplesY; }
    setIncrementAmtX(incrementAmtX) { 
        if (!Number.isInteger(incrementAmtX) || incrementAmtX <= 0) throw new Error('Invalid increment amount provided.');
        this.#incrementAmtX = incrementAmtX; 
    }
    setIncrementAmtY(incrementAmtY) { 
        if (!Number.isInteger(incrementAmtY) || incrementAmtY <= 0) throw new Error('Invalid increment amount provided.');
        this.#incrementAmtY = incrementAmtY; 
    }
    setXDir(xDir) {
        if (!Number.isInteger(xDir) || xDir < -1 || xDir > 1) throw new Error('Invalid X direction provided.');
        this.#xDir = xDir; 
    }
    setYDir(yDir) {
        if (!Number.isInteger(yDir) || yDir < -1 || yDir > 1) throw new Error('Invalid Y direction provided.');
        this.#yDir = yDir; 
    }

    getLockRatio() { return this.#lockRatio; }
    getLockX() { return this.#lockX; }
    getLockY() { return this.#lockY; }
    getScaleInMultiplesX() { return this.#scaleInMultiplesX; }
    getScaleInMultiplesY() { return this.#scaleInMultiplesY; }
    getIncrementAmtX() { return this.#incrementAmtX; }
    getIncrementAmtY() { return this.#incrementAmtY; }
    getXDir() { return this.#xDir; }
    getYDir() { return this.#yDir; }
    getMaxEncountered() { return this.#maxEncountered.clone(); }
    getMinEncountered() { return this.#minEncountered.clone(); }
    getTiles() { return this.#tiles; }

    addTile(tile) { 
        if (!(tile instanceof Tile)) throw new Error('Invalid tile provided.');
        this.#tiles.set(tile.getPosition().toString(), tile); 
    }

    removeTile(pos) {
        if (!(pos instanceof Point)) throw new Error('Invalid position provided.');
        this.#tiles.delete(pos.toString());
    }
}

// VERY TEMP, there should be a layout editor and a layout loader!
const exampleLayout = new Layout();
exampleLayout.newPartition();
exampleLayout.newPartition();
exampleLayout.newPartition();
exampleLayout.getPartition(0).setLockY(true);
exampleLayout.getPartition(0).setXDir(1);
exampleLayout.getPartition(0).setScaleInMultiplesX(false);
exampleLayout.getPartition(0).setIncrementAmtX(1);

exampleLayout.getPartition(1).setXDir(1);
exampleLayout.getPartition(1).setYDir(1);
exampleLayout.getPartition(1).setScaleInMultiplesX(false);
exampleLayout.getPartition(1).setScaleInMultiplesY(false);
exampleLayout.getPartition(1).setLockRatio(false);
exampleLayout.getPartition(1).setIncrementAmtX(1);

exampleLayout.getPartition(2).setXDir(1);
exampleLayout.getPartition(2).setYDir(1);
exampleLayout.getPartition(2).setScaleInMultiplesX(false);
exampleLayout.getPartition(2).setScaleInMultiplesY(false);
exampleLayout.getPartition(2).setLockRatio(false);
exampleLayout.getPartition(1).setIncrementAmtX(1);

exampleLayout.addTile(new Tile("floor", new Point(0, 0)), 2);
exampleLayout.addTile(new Tile("wall", new Point(-1, 0)), -1);
exampleLayout.addTile(new Tile("wall", new Point(1, 0)), 0);
exampleLayout.addTile(new Tile("wall", new Point(0, 1)), 1);
exampleLayout.addTile(new Tile("wall", new Point(0, -1)), -1);
exampleLayout.addTile(new Tile("wall", new Point(1, -1)), 0);
exampleLayout.addTile(new Tile("wall", new Point(-1, -1)), -1);
exampleLayout.addTile(new Tile("wall", new Point(-1, 1)), 1);
exampleLayout.addTile(new Tile("wall", new Point(1, 1)), 1);

// exampleLayout.addTile(new Tile("wall", new Point(1, 0)), 0);
// exampleLayout.addTile(new Tile("wall", new Point(0, 0)), 0);
// Temp layout ends here.

module.exports = { Layout, exampleLayout }
