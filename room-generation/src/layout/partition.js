const Point = require("../../../utils/point");
const Tile = require("../tile/tile");

class Partition {
    #lockRatio = true;
    #lockX = false;
    #lockY = false;
    #scaleInMultiplesX = true;
    #scaleInMultiplesY = true;
    #incrementAmtX = 1;
    #incrementAmtY = 1;
    #xDir = 1;
    #yDir = 1;

    #scaleCountX;
    #scaleCountY;
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
        this.#scaleCountX = 0;
        this.#scaleCountY = 0;
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
        if (this.#lockX) return;

        this.#scaleCountX++;
        if (this.#scaleInMultiplesX) {

        } else {
            switch (this.#xDir) {
                case 1:
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
                    break;
                default: 
                    throw new Error("Invalid scaling direction used");
            }
        }
    }

    scaleY(layout) {
        if (this.#lockY) return;

        this.#scaleCountY++;
        if (this.#scaleInMultiplesY) {

        } else {
            switch (this.#yDir) {
                case 1:
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

    addTile(tile) { 
        if (!(tile instanceof Tile)) throw new Error('Invalid tile provided.');
        this.#tiles.set(tile.getPosition().toString(), tile); 
    }
    removeScaledTile(pos) {
        if (!(pos instanceof Point)) throw new Error('Invalid position provided.');
        this.#scaledTiles.delete(pos.toString());
    }

    ratioLocked() { return this.#lockRatio; }
    xLocked() { return this.#lockX; }
    yLocked() { return this.#lockY; }
    getScaleInMultiplesX() { return this.#scaleInMultiplesX; }
    getScaleInMultiplesY() { return this.#scaleInMultiplesY; }
    getIncrementAmtX() { return this.#incrementAmtX; }
    getIncrementAmtY() { return this.#incrementAmtY; }
    getXDir() { return this.#xDir; }
    getYDir() { return this.#yDir; }
    getMaxEncountered() { return this.#maxEncountered.clone(); }
    getMinEncountered() { return this.#minEncountered.clone(); }
    getScaleCountX() { return this.#scaleCountX; }
    getScaleCountY() { return this.#scaleCountY; }
    getTiles() { return this.#tiles; }
}

module.exports = Partition;
