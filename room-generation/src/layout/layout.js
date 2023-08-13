const Point = require("../../../utils/point");
const Tile = require("../tile/tile");
const Partition = require("./partition");

class Layout {
    #tags = [];
    #excludedTiles = new Map();
    #unscaledTiles = new Map();
    #scalePartitions = [];

    #maxSize;
    #leniency;
    #allowOvergrow;

    #generateRoom() {
        return "ROOM!";
    }

    scaleRoom(maxSize, leniency, allowOvergrow) {
        if (!(maxSize instanceof Point) || !(leniency instanceof Point)) throw new Error('Invalid size or leniency provided.');
        this.#maxSize = maxSize;
        this.#leniency = leniency;
        this.#allowOvergrow = !!allowOvergrow;

        this.#scalePartitions.forEach((p) => p.resetScaling());

        console.log("Pre Scaling: " + this.#getDimensions().toString());
        
        if (!this.#scaleAxis(true)) return "BAD WIDTH";
        if (!this.#scaleAxis(false)) return "BAD HEIGHT";

        this.#satisfyLock(true);
        this.#satisfyLock(false);
        if (!this.#isValid(this.#getDimensions())) return "BAD FROM RATIO LOCK";

        console.log("Post Scaling: " + this.#getDimensions().toString());
        return this.#generateRoom();
    }

    #scaleAxis(xAxis) {
        let oldDimensions = new Point(0, 0);
        while (!this.#isValidAxis(this.#getDimensions(), xAxis)) {
            let currDimensions = this.#getDimensions();
            if (this.#detectLoop(currDimensions, oldDimensions, xAxis) || this.#checkOvergrown(currDimensions, xAxis)) return false;
            oldDimensions = currDimensions;
            this.#scalePartitions.forEach((partition) => this.#scaleStepAxis(partition, xAxis));
        }
        return true;
    }

    #scaleStepAxis(partition, xAxis) { xAxis ? partition.scaleX(this) : partition.scaleY(this); }

    #satisfyLock(xAxis) {
        let satisfiedPartitions = [];
        while (satisfiedPartitions.length < this.#scalePartitions.length) {
            for (let partition of this.#scalePartitions) {
                let countComparison = xAxis ? partition.getScaleCountX() < partition.getScaleCountY() : partition.getScaleCountY() < partition.getScaleCountX();
                if (partition.ratioLocked() && !partition.xLocked() && !partition.yLocked() && countComparison) {
                    this.#scaleStepAxis(partition, xAxis);
                } else if (!satisfiedPartitions.includes(partition)) {
                    satisfiedPartitions.push(partition);
                }
            }
        }
    }
    
    #isValid(dimensions) { return this.#isValidX(dimensions) && this.#isValidY(dimensions); }
    #isValidAxis(dimensions, xAxis) { return xAxis ? this.#isValidX(dimensions) : this.#isValidY(dimensions); }
    #isValidX(dimensions) {
        let leniencyAdded = this.#allowOvergrow ? this.#leniency.getX() : 0;
        return dimensions.getX() >= this.#maxSize.getX() - this.#leniency.getX() && dimensions.getX() <= this.#maxSize.getX() + leniencyAdded;
    }
    #isValidY(dimensions) {
        let leniencyAdded = this.#allowOvergrow ? this.#leniency.getY() : 0;
        return dimensions.getY() >= this.#maxSize.getY() - this.#leniency.getY() && dimensions.getY() <= this.#maxSize.getY() + leniencyAdded;
    }

    #getDimensions() {
        let maxEncountered = new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        let minEncountered = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        for (let tile of this.#unscaledTiles.values()) this.#dimensionCalculationHelper(tile.getPosition(), maxEncountered, minEncountered);
        for (let tile of this.#excludedTiles.values()) this.#dimensionCalculationHelper(tile.getPosition(), maxEncountered, minEncountered);
        for (let partition of this.#scalePartitions) {
            this.#dimensionCalculationHelper(partition.getMaxEncountered(), maxEncountered, minEncountered);
            this.#dimensionCalculationHelper(partition.getMinEncountered(), maxEncountered, minEncountered);
        }

        let width = maxEncountered.getX() - minEncountered.getX() + 1;
        let height = maxEncountered.getY() - minEncountered.getY() + 1;
        return new Point(width, height);
    }

    #dimensionCalculationHelper(pos, maxEncountered, minEncountered) {
        if (pos.getX() > maxEncountered.getX()) maxEncountered.setX(pos.getX());
        if (pos.getX() < minEncountered.getX()) minEncountered.setX(pos.getX());
        if (pos.getY() > maxEncountered.getY()) maxEncountered.setY(pos.getY());
        if (pos.getY() < minEncountered.getY()) minEncountered.setY(pos.getY());
    }

    #detectLoop(dimensions, oldDimensions, xAxis) {
        if (xAxis) return !this.#isValidX(dimensions) && dimensions.getX() === oldDimensions.getX();
        else return !this.#isValidY(dimensions) && dimensions.getY() === oldDimensions.getY();
    }

    #checkOvergrown(dimensions, xAxis) {
        let leniencyAdded = this.#allowOvergrow ? this.#leniency.getX() : 0;
        if (xAxis) return dimensions.getX() > this.#maxSize.getX() + leniencyAdded;
        else return dimensions.getY() > this.#maxSize.getY() + leniencyAdded;
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
            this.#scalePartitions[i].removeScaledTile(pos);
        }
    }

    addTag(tag) { this.#tags.push(tag.toString()); }
    removeTag(tag) { this.#tags.splice(this.#tags.indexOf(tag.toString()), 1); }
    newPartition() { this.#scalePartitions.push(new Partition()); }

    getTags() { return this.#tags; }
    getPartition(index) {
        if (index < 0 || index >= this.#scalePartitions.length) return null;
        return this.#scalePartitions[index]; 
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
