const Point = require("../../utils/point");
const seedrandom = require('seedrandom');

class RoomBuilder {
    #builderSeed;
    #numGen;
    #resetOnBuild;

    #size; // NO FUNCTIONALITY YET.
    #leniency; // NO FUNCTIONALITY YET.
    #allowNonRects; // NO FUNCTIONALITY YET.
    #populateWithItems; // NO FUNCTIONALITY YET.
    #tileset; // NO FUNCTIONALITY YET.
    #layoutBlacklist; // NO FUNCTIONALITY YET.

    constructor(builderSeed) {
        if (builderSeed) this.#builderSeed = builderSeed;
        else this.#builderSeed = Math.random();
        this.#numGen = seedrandom(this.#builderSeed);

        this.#resetParameters();
    }

    build() {
        if (!Point.isPositivePoint(this.#size)) throw new Error('Invalid size provided.');

        // Generate room here.

        if (this.#resetOnBuild) this.#resetParameters();
        return null; // Return room here.
    }

    setSize(size) { 
        if (!Point.isPositivePoint(size)) throw new Error('Invalid size provided.');
        this.#size = size; 
        return this; 
    }
    setLeniency(leniency) { 
        if (!(leniency instanceof Point)) throw new Error('Invalid leniency provided.');
        this.#leniency = leniency; 
        return this; 
    }
    setAllowNonRects(allowNonRects) { this.#allowNonRects = allowNonRects; return this; }
    setPopulateWithItems(populateWithItems) { this.#populateWithItems = populateWithItems; return this; }
    setTileset(tileset) { this.#tileset = tileset; return this; }
    addToBlacklist(layout) { this.#layoutBlacklist.push(layout); return this; }
    clearBlacklist() { this.#layoutBlacklist = []; return this; }

    #resetParameters() {
        this.#size = new Point(0, 0);
        this.#leniency = new Point(0, 0);
        this.#allowNonRects = true;
        this.#populateWithItems = false;
        this.#tileset = null; // TEMP.
        this.#layoutBlacklist = [];
    }
}

module.exports = RoomBuilder;
