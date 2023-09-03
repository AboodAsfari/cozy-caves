const Point = require("@cozy-caves/utils").Point;
const Room = require("../room/room");
const Tile = require("../tile/tile");
const { tilerChooser } = require("../tile/tilerLogic");
const Partition = require("./partition");

/**
 * Represents a room layout that can be scaled in order
 * to generate a room that fits given parameters.
 * 
 * @author Abdulrahman Asfari
 */
class Layout {
    #tags = []; // Metadata to be used by other modules.
    #excludedTiles = new Map(); // Tiles to apply after scaling.
    #unscaledTiles = new Map(); // Tiles that always exist but don't scale.
    #excludedEditableTiles = new Map(); // Unlike its counterpart, can be edited while scaling.
    #unscaledEditableTiles = new Map(); // Unlike its counterpart, can be edited while scaling.
    #scalePartitions = []; // Partitions containing tiles to scale and scaling rules.

    // Used when attempt to generate a room.
    #maxSize; // The maximum size of the room.
    #leniency; // How much the room size can deviate from max.
    #allowOvergrow; // Whether leniency allows room to be bigger than max. 

    #minEncountered = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER); // Smallest encountered X/Y positions in partition.

    #generateRoom(tilerType) {
        let room = new Room(this.#getDimensions());

        let posUpdater = new Point(-this.#minEncountered.getX(), -this.#minEncountered.getY());

        const addTiles = (collection) => {
            for (const value of Array.from(collection)) {
                let updatedPos = new Point(value.getPosition().getX() + posUpdater.getX(), value.getPosition().getY() + posUpdater.getY());
                room.addTile(value.clone(updatedPos));
            }
        }

        addTiles(this.#unscaledEditableTiles.values());
        this.#scalePartitions.forEach((partition) => addTiles(partition.getScaledTiles()));
        addTiles(this.#excludedEditableTiles.values());
        room.getTiles().forEach((tile) => tile.setTileID(tilerChooser.getTiler(tilerType).getID(tile, room)));

        return room;
    }

    /**
     * Attempts to scale the layout until it meets the requirements
     * for a valid room. Gives up if it cannot generate a valid room.
     * 
     * Scales X axis independently, then Y axis. After this it ensures
     * that any lock ratios are satisfied.
     *
     * @param maxSize The maximum size of the room.
     * @param leniency How much the room size can deviate from max.
     * @param allowOvergrow Whether leniency allows room to be bigger than max. 
     * @param tilerType The sprite decision logic to use when generating room.
     * @returns A room object built from the scaled layout, null if invalid layout.
     */
    scaleRoom(maxSize, leniency, allowOvergrow, tilerType) {
        this.#maxSize = maxSize;
        this.#leniency = leniency;
        this.#allowOvergrow = !!allowOvergrow;

        this.#excludedEditableTiles.clear();
        this.#unscaledEditableTiles.clear();
        for (const [key, value] of this.#excludedTiles.entries()) this.#excludedEditableTiles.set(key, value);
        for (const [key, value] of this.#unscaledTiles.entries()) this.#unscaledEditableTiles.set(key, value);
            
        this.#scalePartitions.forEach((p) => p.resetScaling());
        
        if (!this.#scaleAxis(true)) return null;
        if (!this.#scaleAxis(false)) return null;

        this.#satisfyLock(true);
        this.#satisfyLock(false);
        if (!this.#isValid(this.#getDimensions())) return null;

        return this.#generateRoom(tilerType);
    }

    /**
     * Scales all partitions in an axis continually until the axis is valid
     * or it recognizes that the axis will never be valid.
     *
     * @param xAxis True if scaling axis is X.
     * @returns True if axis is valid after scaling, false otherwise.
     */
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
    
    /**
     * Scales a partition in a given axis. Used to limit the use of repeated code 
     * in axis scaling.
     *
     * @param partition Partition to scale.
     * @param xAxis True if scaling axis is X.
     */
    #scaleStepAxis(partition, xAxis) { xAxis ? partition.scaleX(this) : partition.scaleY(this); }

    /**
     * Attempts to satisfy a lock ratio on a certain axis.
     * If the ratio is locked and the X and Y axis have been 
     * scaled a different number of times, it attempts to even
     * it out.
     *
     * @param xAxis True if scaling axis is X.
     */
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
    
    /**
     * Checks if the given dimensions are valid.
     *
     * @param dimensions The current dimensions of the room.
     * @returns True if room dimensions valid.
     */
    #isValid(dimensions) { return this.#isValidX(dimensions) && this.#isValidY(dimensions); }

    /**
     * Checks if the given dimensions are valid for a given axis.
     * Used to limit the use of repeated code in axis scaling.
     *
     * @param dimensions The current dimensions of the room.
     * @param xAxis True if scaling axis is X.
     * @returns True if the axis is valid.
     */
    #isValidAxis(dimensions, xAxis) { return xAxis ? this.#isValidX(dimensions) : this.#isValidY(dimensions); }

    /**
     * Checks if the given dimensions are valid for the X axis.
     *
     * @param dimensions The current dimensions of the room.
     * @returns True if the X axis is valid.
     */
    #isValidX(dimensions) {
        let leniencyAdded = this.#allowOvergrow ? this.#leniency.getX() : 0;
        return dimensions.getX() >= this.#maxSize.getX() - this.#leniency.getX() && dimensions.getX() <= this.#maxSize.getX() + leniencyAdded;
    }

    /**
     * Checks if the given dimensions are valid for the Y axis.
     *
     * @param dimensions The current dimensions of the room.
     * @returns True if the Y axis is valid.
     */
    #isValidY(dimensions) {
        let leniencyAdded = this.#allowOvergrow ? this.#leniency.getY() : 0;
        return dimensions.getY() >= this.#maxSize.getY() - this.#leniency.getY() && dimensions.getY() <= this.#maxSize.getY() + leniencyAdded;
    }

    /**
     * Calculates the dimensions of the room by checking all tiles
     * in all partitions, as well as unscaled and excluded tiles.
     *
     * @returns Current dimensions of the room.
     */
    #getDimensions() {
        let maxEncountered = new Point(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
        this.#minEncountered = new Point(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);

        for (let tile of this.#unscaledTiles.values()) this.#dimensionCalculationHelper(tile.getPosition(), maxEncountered, this.#minEncountered);
        for (let tile of this.#excludedTiles.values()) this.#dimensionCalculationHelper(tile.getPosition(), maxEncountered, this.#minEncountered);
        for (let partition of this.#scalePartitions) {
            this.#dimensionCalculationHelper(partition.getMaxEncountered(), maxEncountered, this.#minEncountered);
            this.#dimensionCalculationHelper(partition.getMinEncountered(), maxEncountered, this.#minEncountered);
        }

        let width = maxEncountered.getX() - this.#minEncountered.getX() + 1;
        let height = maxEncountered.getY() - this.#minEncountered.getY() + 1;
        return new Point(width, height);
    }

    /**
     * Updates the maximum and minimum observed values based on
     * a given position.
     *
     * @param pos Position to check.
     * @param maxEncountered Reference to maximum encountered position.
     * @param minEncountered Reference to minimum encountered position.
     */
    #dimensionCalculationHelper(pos, maxEncountered, minEncountered) {
        if (!pos) return;
        if (pos.getX() > maxEncountered.getX()) maxEncountered.setX(pos.getX());
        if (pos.getX() < minEncountered.getX()) minEncountered.setX(pos.getX());
        if (pos.getY() > maxEncountered.getY()) maxEncountered.setY(pos.getY());
        if (pos.getY() < minEncountered.getY()) minEncountered.setY(pos.getY());
    }

    /**
     * Detects if no change has been made to the dimensions, in order
     * to prevent an infinite loop of attempting to scale the room.
     *
     * @param dimensions The current dimensions of the room.
     * @param oldDimensions The dimensions of the room last scale cycle.
     * @param xAxis True if scaling axis is X.
     * @returns True if loop detected.
     */
    #detectLoop(dimensions, oldDimensions, xAxis) {
        if (xAxis) return !this.#isValidX(dimensions) && dimensions.getX() === oldDimensions.getX();
        else return !this.#isValidY(dimensions) && dimensions.getY() === oldDimensions.getY();
    }

    /**
     * Checks if the room has grown outside of the
     * maximum given size.
     *
     * @param dimensions The current dimensions of the room.
     * @param xAxis True if scaling axis is X.
     * @returns True if the room is outside of the maximum size.
     */
    #checkOvergrown(dimensions, xAxis) {
        let leniencyAdded = this.#allowOvergrow ? this.#leniency.getX() : 0;
        if (xAxis) return dimensions.getX() > this.#maxSize.getX() + leniencyAdded;
        else return dimensions.getY() > this.#maxSize.getY() + leniencyAdded;
    }

    /**
     * Adds a tile to the layout with the given partition number.
     * -1 for an unscaled tile, and -2 for an excluded tile.
     * 
     * @param tile Tile to add.
     * @param partitionNum Partition number to add tile to.
     */
    addTile(tile) { 
        let partitionNum = tile.getPartitionNum();
        if (partitionNum < -2) throw new Error('Invalid partition number provided.');
        else if (partitionNum === -2) this.#excludedTiles.set(tile.getPosition().toString(), tile);
        else if (partitionNum === -1) this.#unscaledTiles.set(tile.getPosition().toString(), tile);
        else this.#scalePartitions[partitionNum].addTile(tile);  
    }

    /**
     * Deletes a tile from the layout.
     * 
     * @param pos Position of tile to remove.
     */
    removeTile(pos) {
        this.#excludedTiles.delete(pos.toString());
        this.#unscaledTiles.delete(pos.toString());
        for (let i = this.#scalePartitions.length - 1; i >= 0; i--) {
            this.#scalePartitions[i].removeTile(pos);
        }
    }

    /**
     * Removes and then adds a tile again. Used when a tiles partition
     * has been updated so the layout can store it in the correct place.
     * 
     * @param tile The tile to update. 
     */
    updateTile(tile) {
        this.removeTile(tile.getPosition());
        this.addTile(tile);
    }

    /**
     * Gets a tile from the layout.
     * 
     * @param pos Position of tile to get.
     */
    getTile(pos) {
        if (this.#excludedTiles.has(pos.toString())) return this.#excludedTiles.get(pos.toString());
        else if (this.#unscaledTiles.has(pos.toString())) return this.#unscaledTiles.get(pos.toString());
        for (let i = this.#scalePartitions.length - 1; i >= 0; i--) {
            if (this.#scalePartitions[i].getTile(pos)) return this.#scalePartitions[i].getTile(pos);
        }
    }

    /**
     * Gets a list of all tiles in this layout.
     * 
     * @return List of all tiles.
     */
    getTiles() {
        let tileList = [];
        this.#excludedTiles.forEach(tile => tileList.push(tile));
        this.#unscaledTiles.forEach(tile => tileList.push(tile));
        this.#scalePartitions.forEach(partition => {
            partition.getTiles().forEach(tile => tileList.push(tile));
        });
        return tileList;
    }  

    /**
     * Deletes a tile from the editable maps of the layout,
     * to ensure the actual layout info does not change.
     *
     * @param pos Position of tile to remove.
     * @param deleteExcluded Whether to delete the tile if it's excluded.
     */
    removeEditableTile(pos, deleteExcluded = false) {
        if (deleteExcluded) this.#excludedEditableTiles.delete(pos.toString());
        this.#unscaledEditableTiles.delete(pos.toString());
        for (let i = this.#scalePartitions.length - 1; i >= 0; i--) {
            this.#scalePartitions[i].removeScaledTile(pos);
        }
    }

    /**
     * Adds a tag to the layout.
     *
     * @param tag String tag to add.
     */
    addTag(tag) { this.#tags.push(tag.toString()); }

    /**
     * Removes a tag from the layout.
     *
     * @param tag Tag to remove.
     */
    removeTag(tag) { this.#tags.splice(this.#tags.indexOf(tag.toString()), 1); }

    /**
     * Fetches the list of tags for this layout.
     *
     * @returns List of tags.
     */
    getTags() { return this.#tags; }

    /**
     * Creates a new partition.
     */
    newPartition() { 
        this.#scalePartitions.push(new Partition()); 
        return this.#scalePartitions[this.#scalePartitions.length - 1];
    }

    /**
     * Finds and returns a partition.
     *
     * @param index Index of the partition to fetch.
     * @returns The fetched partition
     */
    getPartition(index) {
        if (index < 0 || index >= this.#scalePartitions.length) return null;
        return this.#scalePartitions[index]; 
    }

    /**
     * Removes a partition from the layout.
     * 
     * @param index Index of the partition to remove. 
     */
    removePartition(index) {
        this.#scalePartitions.splice(index, 1);
    }

    /**
     * Fetches all partitions, including unscaled and excluded, and returns
     * a list of all of their names and colors to display.
     * 
     * @returns A list of all partitions names and colors.
     */
    getPartitionDisplayInfo() {
        let partitionDisplayInfo = [{ name: 'Excluded', color: '#bfbfbf', icon: "Circle" }, { name: 'Unscaled', color: 'white', icon: "Circle" }];
        for (let partition of this.#scalePartitions) {
            partitionDisplayInfo.push({ name: partition.getPartitionName(), color: partition.getPartitionColor(), icon: partition.getPartitionIcon() });
        }
        return partitionDisplayInfo;
    }

    /**
     * Resets all fields in this object
     * to their defaults.
     */
    clearLayout() {
        this.#tags = []; 
        this.#excludedTiles = new Map(); 
        this.#unscaledTiles = new Map(); 
        this.#excludedEditableTiles = new Map(); 
        this.#unscaledEditableTiles = new Map(); 
        this.#scalePartitions = []; 
    }

    /**
     * Creates a new object with information needed to save the layout.
     * 
     * @returns Serializable layout object.
     */
    getSerializableLayout() {
        return {
            excludedTiles: Array.from(this.#excludedTiles.values()).map(tile => tile.getSerializableTile()),
            unscaledTiles: Array.from(this.#unscaledTiles.values()).map(tile => tile.getSerializableTile()),
            scalePartitions: this.#scalePartitions.map(partition => partition.getSerializablePartition())
        };        
    }

    /**
     * Reads a stringified serializable layout and converts it 
     * to a full layout object.
     * 
     * @returns Layout.
     */
    static fromSerializableLayout(serializedLayout, layout = new Layout()) {
        serializedLayout.excludedTiles.forEach(tile => layout.addTile(Tile.fromSerializableTile(tile)));
        serializedLayout.unscaledTiles.forEach(tile => layout.addTile(Tile.fromSerializableTile(tile)));
        serializedLayout.scalePartitions.forEach(serializedPartition => {
            let partition = layout.newPartition();
            partition.setPartitionName(serializedPartition.name);
            partition.setPartitionColor(serializedPartition.color);
            partition.setPartitionIcon(serializedPartition.icon);
            partition.setLockRatio(serializedPartition.lockRatio);
            partition.setLockX(serializedPartition.lockX);
            partition.setLockY(serializedPartition.lockY);
            partition.setSplitScalingOnX(serializedPartition.splitScalingOnX);
            partition.setSplitScalingOnY(serializedPartition.splitScalingOnY);
            partition.setIncrementAmtX(serializedPartition.incrementAmtX);
            partition.setIncrementAmtY(serializedPartition.incrementAmtY);
            partition.setXDir(serializedPartition.xDir);
            partition.setYDir(serializedPartition.yDir);
            serializedPartition.tiles.forEach(tile => layout.addTile(Tile.fromSerializableTile(tile)));
        });

        return layout;
    }
}

module.exports = { Layout }
