const { Point, shuffleArray } = require("@cozy-caves/utils");
const seedrandom = require('seedrandom');
const { Layout } = require("../layout/layout");
const populateRoom = require("@cozy-caves/item-and-prop-generation");
const layoutList = require("../../layouts/layout-list.json");
const Room = require("./room");

class RoomBuilder {
    #builderSeed; // Seed used for randomly generated room decisions.
    #numGen; // Seeded number generator.
    #resetOnBuild; // Whether to reset parameters on build.

    #size; // Size to work with for room creation.
    #leniency; // Leniency in room size.
    #allowOvergrow; // Whether leniency allows room to be bigger than max.
    #allowNonRects; // NO FUNCTIONALITY YET.
    #populateWithItems; // NO FUNCTIONALITY YET.
    #tilerType; // NO FUNCTIONALITY YET.
    #layoutBlacklist; // NO FUNCTIONALITY YET.

    /**
     * Creates an instance of RoomBuilder. Uses a
     * random seed if one isn't provided.
     *
     * @constructor
     * @param builderSeed Seed to use for room generation.
     */
    constructor(builderSeed) {
        if (builderSeed) this.#builderSeed = builderSeed;
        else this.#builderSeed = Math.random();
        this.#numGen = seedrandom(this.#builderSeed);

        this.#resetParameters();
    }

    /**
     * Creates a room that matches the room builders
     * parameters.
     *
     * @returns The created room.
     */
    build() {
        if (!Point.isPositivePoint(this.#size)) throw new Error('Invalid size provided.');

        let room = null;
        let layoutPool = [];
        for (let layout in layoutList.layouts) for (let i = 0; i < layoutList.layouts[layout]; i++) layoutPool.push(layout);
        if (this.#allowNonRects) {
            shuffleArray(layoutPool, this.#numGen);
            while (room === null && layoutPool.length > 0) {
                let serializedLayout = require("../../layouts/" + layoutPool[0]);
                let layout = Layout.fromSerializableLayout(serializedLayout);
                room = layout.scaleRoom(this.#size, this.#leniency, this.#allowOvergrow, this.#tilerType);
            }
        } else {
            let serializedLayout = require("../../layouts/" + layoutPool[0]);
            let layout = Layout.fromSerializableLayout(serializedLayout);
            room = layout.scaleRoom(this.#size, this.#leniency, this.#allowOvergrow, this.#tilerType);
        }

        if (this.#populateWithItems) {
            // let propMap = populateRoom(room, 5);
            // room.setPropMap(propMap);
        }

        if (this.#resetOnBuild) this.#resetParameters();
        return room;
    }

    // Setters (That return the object as well).
    setResetOnBuild(resetOnBuild) { this.#resetOnBuild = !!resetOnBuild; return this; }
    setSize(size) {
        this.#size = size;
        return this;
    }
    setLeniency(leniency) {
        this.#leniency = leniency;
        return this;
    }
    setAllowOvergrow(allowOvergrow) { this.#allowOvergrow = allowOvergrow; return this; }
    setAllowNonRects(allowNonRects) { this.#allowNonRects = allowNonRects; return this; }
    setPopulateWithItems(populateWithItems) { this.#populateWithItems = populateWithItems; return this; }
    setTilerType(tilerType) { this.#tilerType = tilerType; return this; }
    addToBlacklist(layout) { this.#layoutBlacklist.push(layout); return this; }
    clearBlacklist() { this.#layoutBlacklist = []; return this; }

    /**
     * Resets builder parameters to their defaults.
     */
    #resetParameters() {
        this.#size = new Point(0, 0);
        this.#leniency = new Point(0, 0);
        this.#allowOvergrow = false;
        this.#allowNonRects = true;
        this.#populateWithItems = true;
        this.#tilerType = "default";
        this.#layoutBlacklist = [];
    }
}

module.exports = RoomBuilder;
