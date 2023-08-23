const Ajv = require("ajv");
const metadata = require("./metadata/item_metadata.json");
const Item = require("./classes/item");
const schema = require("./metadata/item_schema.json");

class ItemGenerator {
    #commonItems = {};
    #uncommonItems = {};
    #rareItems = {};
    #epicItems = {};
    #legendaryItems = {};
    
    constructor () {
        
    }

    getItemByRarity(rarity) {
        this.rarity = rarity;

        const rarityLists = {
            "common": this.#commonItems,
            "uncommon": this.#uncommonItems,
            "rare": this.#rareItems,
            "epic": this.#epicItems,
            "legendary": this.#legendaryItems
        };

        if (rarity in rarityLists) {
            this.populateList(rarity, rarityLists[rarity]);
        } else {
            throw new Error('Invalid rarity category.');
        }
        
        // returns a random item from that list
        return rarityLists[rarity][Math.random() * rarityLists[rarity].length];
    }
    
    
    populateList(filter, list){
        // validating metadata against schema
        const validate = new Ajv().compile(schema);
        const categories = metadata.item_categories;

        // does not match the format
        if (!validate(metadata)) {
            throw new Error("Invalid JSON data");
        }

        // groups all items by rarity regardless of their category
        categories.forEach((category, i) => {
            const selection = category.filter(item => item.rarity === filter);
            selection.forEach((item, i) => {
                list.push(new Item(item.name, item.desc, categories[category], item.rarity, item.properties));
            });
        });
    }
}

module.exports = ItemGenerator;

