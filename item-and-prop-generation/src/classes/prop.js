const Point = require("@cozy-caves/utils").Point;
const Item = require("./item");

/**
 * Prop representation on the map. This will be rendered.
 * 
 * @author Naomi Parte
 * 
 */
class Prop {

    #position = new Point(0, 0); // Position of the prop in the room.
    #items = [];

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
     * @param category The category that the prop is in.
     * @param rarity The rarity level, influencing its likelihood of appearing in the
     *               generated map
     * @param containsItem t/f on whether or not the prop has hidden items.
     */
    constructor(name, desc, category, rarity, containsItem) {
        this.name = name;
        this.desc = desc;
        this.category = category;
        this.rarity = rarity;
        this.containsItem = containsItem;
    }

    addItem(item){
        if (!(item instanceof Item)) throw new Error("Invalid type. Expecting item.");
        if (!this.containsItem) throw new Error("This prop cannot contain item"); 
        this.#items.push(item);
    }

    // Getters.
    getPosition() { return this.#position; }
    getOffset() { return this.#offset; }
    getRotation() { return this.#rotation; }
    getItems(){ return this.#items; }

    getName() { return this.name; }
    getDesc() { return this.desc; }
    getRarity() { return this.rarity; }
    getContainsItem() { return this.containsItem; }

    getPathName() { 
        var snakeCaseName = this.name.split(" ").join("_").toLowerCase();
        var snakeCaseCategory = this.category.split(" ").join("_").toLowerCase();

        return snakeCaseCategory + "/" + snakeCaseName;
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

    toString() {
        let result = "";
        result += "name: " + this.name + "\n";
        result += "desc: " + this.desc + "\n";
        result += "category: " + this.category + "\n";
        result += "rarity: " + this.rarity + "\n";
        result += "items: ["
        if (this.#items.length !== 0) {
            for (var item of this.#items) {
                result += " " + item.getName() + ",";
            }            
        }
        result += "]";
        
        return result;
    }
}
module.exports = Prop;