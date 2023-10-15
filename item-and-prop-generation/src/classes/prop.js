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
    #offset = {x:0, y:0};
    #rotation = 0;
    #scale = new Point(1,1);
    #depth = 0;

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

        this.overlap = this.placementRules.overlap;
        if (this.overlap) this.#depth = -1;
        
        const xOffset = (this.size.w > 1) ? (this.size.w-1)/2 : 0;
        const yOffset = (this.size.h > 1) ? (this.size.h-1)/2 : 0;

        this.setOffset(xOffset, yOffset);
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
    getDepth() {return this.#depth;}

    getName() { return this.name; }
    getDesc() { return this.desc; }
    getRarity() { return this.rarity; }

    getContainsItem() { return this.containsItem; }
    getPlacementRules() { return this.placementRules; }
    getPossibleItems() { return this.possibleItems; }
    getSize() { return this.size;}
    getOverlap() {return this.overlap;}
    getSerializableProp() {
        return {
            name: this.name,
            desc: this.desc,
            rarity: this.rarity,
            containsItem: this.containsItem,
            possibleItems: this.possibleItems,
            placementRules: this.placementRules,
            size: this.size,
            position: this.position.toString(),
            offset: this.offset.toString(),
            rotation: this.rotation,
            scale: this.scale.toString(),
            depth: this.depth
        }
    }

    static fromSerializableProp(serializedProp) {
        let name = serializedProp.name;
        let desc = serializedProp.desc;
        let rarity = serializedProp.rarity;
        let containsItem = serializedProp.containsItem;
        let possibleItems = serializedProp.possibleItems;
        let placementRules = serializedProp.placementRules;
        let size = serializedProp.size;
        let posArray = serializedProp.position.split(',');
        let offsetArray = serializedProp.offset.split(',');
        let pos = new Point(parseInt(posArray[0]), parseInt(posArray[1]));
        let offset = new Point(parseInt(offsetArray[0]), parseInt(offsetArray[1]));
        let rotation = serializedProp.rotation;
        let scaleArray = serializedProp.scale.split(',');
        let scale = new Point(parseInt(scaleArray[0]), parseInt(scaleArray[1]));
        let depth = serializedProp.depth;

        let prop = new Prop(name, desc, rarity, containsItem, possibleItems, placementRules, size);
        prop.setPosition(pos);
        prop.setOffset(offset);
        prop.setRotation(rotation);
        prop.setScale(scale);
        prop.setDepth(depth);

        return prop;
    }
    

    getPathName() { 
        return this.name.split(" ").join("_").toLowerCase();
    }

    // Setters.
    setPosition(position){
        if (!(position instanceof Point)) throw new Error("Position must be provided as Point.");
        this.#position = position;
    }
    setOffset(x, y){
        this.#offset.x = x;
        this.#offset.y = y;
    }
    setRotation(rotation) { 
        this.#rotation = rotation; 
    }
    setScale(scale) {
        if (!(scale instanceof Point)) throw new Error("Scale must be provided as Point.");
        this.#scale = scale;
    }

    setDepth(depth){
        this.#depth = depth;
    }

    setOverlap(overlap) { this.overlap = overlap;}
    
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