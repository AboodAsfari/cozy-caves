const Point = require("../../../utils/point");

/**
 * An item representation.
 * 
 * @author Naomi Parte
 * 
 */
class Item {

    #position = new Point(0, 0); // Position of the item in the room.

    // Rendering variables.
    #offset = new Point(0, 0);
    #rotation = 0;

    /**
     * Constructs a tile based on the metadata provided.
     * The position won't be known until the generator sets it.
     * 
     * @constructor
     * @param name The name of the item.
     * @param desc A brief narrative description of the item's appearance
     *             and functionality.
     * @param category The category the specific item falls under.
     * @param rarity The rarity level, influencing its likelihood of appearing in the
     *               generated map
     * @param properties Any special properties or effects associated with the item
     */
    constructor(name, desc, category, rarity, properties) {
        this.name = name;
        this.desc = desc;
        this.category = category;
        this.rarity = rarity;
        this.properties = properties;
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
}

module.exports = Item;