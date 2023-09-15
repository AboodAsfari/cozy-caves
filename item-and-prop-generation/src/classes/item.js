const Point = require("../../../utils/src/point");

/**
 * An item representation.
 * 
 * @author Naomi Parte
 * 
 */
class Item {

    #position = new Point(0, 0); // Position of the item in the room.

    // Rendering elements.
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
     * @param category The category the item belongs to.
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
    
    getName() { return this.name; }
    getDesc() { return this.desc; }
    getRarity() { return this.rarity; }
    getProperties() { return this.properties; }

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

    toString(){
        let result = "";
        result += "name: " + this.name + "\n";
        result += "desc: " + this.desc + "\n";
        result += "category: " + this.category + "\n";
        result += "rarity: " + this.rarity + "\n";
        result += "properties: " + this.properties + "\n";
        return result;
    }
}

module.exports = Item;