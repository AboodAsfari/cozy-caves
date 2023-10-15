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
    getCategory() { return this.category; }
    getRarity() { return this.rarity; }
    getProperties() { return this.properties; }
    getSerializableItem() {
        return {
            name: this.name,
            desc: this.desc,
            category: this.category,
            rarity: this.rarity,
            properties: this.properties,
            position: this.position.toString(),
            offset: this.offset.toString(),
            rotation: this.rotation
        }
    }

    /**
     * Reads serializable item and converts it
     * to object.
     * 
     * @returns Item.
     */
    static fromSerializableItem(serializedItem) {
        let posArray = serializedItem.position.split(',');
        let offsetArray = serializedItem.offset.split(',');
        let pos = new Point(parseInt(posArray[0]), parseInt(posArray[1]));
        let offset = new Point(parseInt(offsetArray[0]), parseInt(offsetArray[1]));
        let rotation = serializedItem.rotation;
        let name = serializedItem.name;
        let desc = serializedItem.desc;
        let category = serializedItem.category;
        let rarity = serializedItem.rarity;
        let properties = serializedItem.properties;

        let item = new Item(name, desc, category, rarity, properties);
        item.setPosition(pos);
        item.setOffset(offset);
        item.setRotation(rotation);
        
        return item;
    }

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