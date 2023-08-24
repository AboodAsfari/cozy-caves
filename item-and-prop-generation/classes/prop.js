const Point = require("../../utils/src/point");

/**
 * Prop representation.
 * 
 * @author Naomi Parte
 * 
 */
class Prop {

    #position = new Point(0, 0); // Position of the prop in the room.

    // Rendering elements.
    #offset = new Point(0, 0);
    #rotation = 0;

    /**
     * Constructs a tile based on the metadata provided.
     * The position won't be known until the generator sets it.
     * 
     * @constructor
     * @param name The name of the prop.
     * @param desc A brief narrative description of the prop's appearance
     *             and functionality.
     *  @param category The category the specific prop falls under. This influences its likelihood of appearing in the
     *               generated map
     * @param img Path to the image file
     */
    constructor(name, desc, category) {
        this.name = name;
        this.desc = desc;
        this.category = category;
    }

    // Getters.
    getPosition() { return this.#position; }
    getOffset() { return this.#offset; }
    getRotation() { return this.#rotation; }

    // Setters.
    setPosition(position) { 
        if (!(position instanceof Point)) throw new Error("Position must be provided as Point.");
        this.#position = position; 
    }
    setOffset(offset) { 
        if (!(offset instanceof Point)) throw new Error("Offset must be provided as Point.");
        this.#offset = offset; 
    }

    setRotation(rotation) { this.#rotation = rotation; }
}
module.exports = Prop;