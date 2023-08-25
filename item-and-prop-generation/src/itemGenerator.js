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

    getItemByRarity(rarity) { // can just return a list instead of having a private list
        if (!this.rarityList.includes(rarity)) throw new Error('Invalid rarity category.');
        
        const categories = metadata.item_categories;
        const temp = []; // temporary list to store items

        // groups all items by rarity regardless of their category
        categories.forEach((category, i) => {
            const selection = category.filter(item => item.rarity === rarity);
            selection.forEach((item, i) => {
                temp.push(new Item(item.name, item.desc, categories[category], item.rarity, item.properties));
            });
        });

        if (temp.length === 0) throw new Error('No items found for rarity: ' + rarity);

        //this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor() * temp.length;
        return temp[randomIndex];
    }

    getItemByCategory(category){
        const temp = metadata[category];
        if (temp.length === 0) throw new Error('No items found for category: ' + category);

        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor() * temp.length;
        return temp[randomIndex];
    }
}

module.exports = ItemGenerator;

