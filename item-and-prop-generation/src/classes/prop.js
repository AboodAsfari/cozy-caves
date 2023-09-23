const Point = require("@cozy-caves/utils").Point;
const Item = require("./item");

/**
 * Prop representation on the map. This will be rendered.
 * 
 * @author Naomi Parte
 * 
 */
class Prop {
    #items = [];

    // Rendering elements.
    #position = new Point(0, 0); //this is where it will be rendered from
    #offset = new Point(0, 0);
    #rotation = 0;
    #scale = new Point(0,0);

    /**
     * Constructs a tile based on the metadata provided.
     * The position won't be known until the generator sets it.
     * 
     * @constructor
     * @param name The name of the prop.
     * @param desc A brief narrative description of the prop's appearance
     *             and functionality.
     * @param rarity The rarity level, influencing its likelihood of appearing in the
     *               generated map
     * @param containsItem t/f on whether or not the prop has hidden items.
     * @param possibleItems A category of items that the prop can contain.
     * @param placementRules A set of rules dictating how the prop will be placed.
     */
    constructor(name, desc, rarity, containsItem, possibleItems, placementRules, size) {
        this.name = name;
        this.desc = desc;
        this.rarity = rarity;
        this.containsItem = containsItem;
        this.possibleItems = possibleItems;
        this.placementRules = placementRules;
        this.size = size;
    }

    addItem(item){
        if (!(item instanceof Item)) throw new Error("Invalid type. Expecting item.");
        if (!this.containsItem) throw new Error("This prop cannot contain item"); 
        this.#items.push(item);
    }

    // Getters.
    getRotation() { return this.#rotation; }
    getItems(){ return this.#items; }
    getPosition() {return this.#position; }
    getOffset() {return this.#offset;}
    getScale() { return this.#scale; }

    getName() { return this.name; }
    getDesc() { return this.desc; }
    getRarity() { return this.rarity; }

    getContainsItem() { return this.containsItem; }
    getPlacementRules() { return this.placementRules; }
    getPossibleItems() { return this.possibleItems; }
    getSize() { return this.size;}

    getPathName() { 
        return this.name.split(" ").join("_").toLowerCase();
    }

    // Setters.
    setPosition(position){
        if (!(position instanceof Point)) throw new Error("Position must be provided as Point.");
        this.#position = position;
    }
    setOffset(offset){
        if (!(offset instanceof Point)) throw new Error("Offset must be provided as Point.");
        this.#offset = offset;
    }
    setRotation(rotation) { 
        this.#rotation = rotation; 
    }

    setScale(scale) {
        if (!(scale instanceof Point)) throw new Error("Scale must be provided as Point.");
        this.#scale = scale;
    }
    
    toString() {
        let result = "";
        result += "name: " + this.name + "\n";
        result += "desc: " + this.desc + "\n";
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

    rendererInfo() {
        let result = "";
        result += "containsItem: " + this.containsItem + "\n";
        result += "possibleItems: " + this.possibleItems + "\n";
        result += "placementRules: " + JSON.stringify(this.placementRules) + "\n";
        result += "size:" + JSON.stringify(this.size) + "\n";
        return result;
    }
}
module.exports = Prop;