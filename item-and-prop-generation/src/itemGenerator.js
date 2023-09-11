const Ajv = require("ajv");
const metadata = require("./metadata/item_metadata.json");
const Item = require("./classes/item");
const schema = require("./metadata/item_schema.json");
const ItemRarity = require("../../utils/src/itemRarity"); //require("@cozy-caves/utils").ItemRarity;

class ItemGenerator {
    
    constructor () {
        const validate = new Ajv().compile(schema);
        // does not match the format
        if (!validate(metadata)) {
            throw new Error("Invalid JSON data");
        }
    }

    getItemByRarity(rarity) { 
        if (!Object.keys(ItemRarity).includes(rarity)) throw new Error(`Invalid rarity category: ${rarity}`);

        const categories = metadata.item_categories;
        const filteredItems = [];

        for (const category in categories) {
            const categoryItems = categories[category];
            for (const itemData of categoryItems) {
                if (itemData.rarity === rarity) {
                    const item = new Item(
                        itemData.name,
                        itemData.desc,
                        category,
                        itemData.rarity,
                        itemData.properties
                    );
                    filteredItems.push(item);
                }
            }
        }

        if (filteredItems.length === 0) throw new Error(`No props found for rarity: ${rarity}`);

        // Generate a random index based on the length of the filtered props
        const randomIndex = Math.floor(Math.random() * filteredItems.length);
        
        return filteredItems[randomIndex];
    }

    getItemByCategory(category){
        const temp = metadata[category];
        if (temp.length === 0) throw new Error('No items found for category: ${category}');

        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor() * temp.length;
        return temp[randomIndex];
    }
}

module.exports = ItemGenerator;

