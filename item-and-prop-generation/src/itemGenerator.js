const Ajv = require("ajv");
const metadata = require("./metadata/item_metadata.json");
const Item = require("./classes/item");
const schema = require("./metadata/item_schema.json");

class ItemGenerator {
    rarityList = ["common", "uncommon", "rare", "epic", "legendary"];
    
    constructor () {
        const validate = new Ajv().compile(schema);
        // does not match the format
        if (!validate(metadata)) {
            throw new Error("Invalid JSON data");
        }
    }

    getItemByRarity(rarity) { 
        if (!this.rarityList.includes(rarity)) throw new Error('Invalid rarity category: ${rarity}.');
        
        const categories = metadata.item_categories;
        // groups all items by rarity regardless of their category
        const filteredItems = categories.reduce((items, category) => {
            return items.concat(category.filter(i => i.rarity === rarity));
        }, []);
        if (filteredItems.length === 0) throw new Error("No items found for rarity: ${rarity}");

        // Generate a random index based on the length of the filtered items
        const randomIndex = Math.floor(Math.random() * filteredItems.length);
        const i = filteredItems[randomIndex];
        return Item(i.name, i.desc, i.rarity, i.properties);
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

