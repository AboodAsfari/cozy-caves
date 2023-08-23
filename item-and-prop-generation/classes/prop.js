const Point = require("../../../utils/point");

/**
 * Prop representation.
 * 
 * @author Naomi Parte
 * 
 */
class Prop {

    #position = new Point(0, 0); // Position of the prop in the room.

    // Rendering variables.
    #offset = new Point(0, 0);
    #rotation = 0;
    #depth = 0;

    /**
     * Constructs a tile based on the metadata provided.
     * The position won't be known until the generator sets it.
     * 
     * @constructor
     * @param name The name of the prop.
     * @param desc A brief narrative description of the prop's appearance
     *             and functionality.
     * @param type The rarity level, influencing its likelihood of appearing in the
     *               generated map
     * @param img Path to the image file
     */
    constructor(name, desc, type, img) {
        this.name = name;
        this.desc = desc;
        this.type = type;
        this.img = img;
    }

    // Getters.
    getPosition() { return this.#position; }
    getOffset() { return this.#offset; }
    getRotation() { return this.#rotation; }
    getDepth() { return this.#depth; }

    // Setters.
    setPosition(position) { 
        if (!(position instanceof Point)) throw new Error("Position must be provided as Point.");
        this.#position = position; 
    }
}