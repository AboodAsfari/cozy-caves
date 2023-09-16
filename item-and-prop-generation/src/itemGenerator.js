const Ajv = require("ajv");
const metadata = require("./metadata/item_metadata.json");
const Item = require("./classes/item");
const schema = require("./metadata/item_schema.json");
const ItemRarity = require("@cozy-caves/utils").ItemRarity;
const seedrandom = require('seedrandom');

class ItemGenerator {
    #randomGen;

    constructor (seed) {
        const validate = new Ajv().compile(schema);
        // does not match the format
        if (!validate(metadata)) {
            throw new Error("Invalid JSON data");
        }
        if (seed) this.seed = seed;
        else this.seed = Math.random();
        this.#randomGen = seedrandom(this.seed);
    }

    getItemByRarity(rarity) { 
        if (!Object.keys(ItemRarity).includes(rarity)) throw new Error(`Invalid rarity category: ${rarity}`);

        const categories = metadata;
        const filteredItems = [];

        for (const category in categories) {
            const categoryItems = categories[category];
            for (const itemData of categoryItems) {
                if (itemData.rarity === rarity) {
                    const item = new Item(
                        itemData.name,
                        itemData.desc,
                        itemData.rarity,
                        itemData.properties
                    );
                    filteredItems.push(item);
                }
            }
        }

        if (filteredItems.length === 0) throw new Error(`No props found for rarity: ${rarity}`);

        // Generate a random index based on the length of the filtered props
        const randomIndex = Math.floor(this.#randomGen() * filteredItems.length);
        
        return filteredItems[randomIndex];
    }

    getItemByCategory(category){
        const temp = metadata[category];
        if (temp.length === 0) throw new Error(`No items found for category: ${category}`);


        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor(this.#randomGen() * temp.length)
        const i = temp[randomIndex];
        const item = new Item(i.name, i.desc, i.rarity, i.properties); 
        return item;
    }

    getItemByName(name) {
        for (const category in metadata) {
            const itemList = metadata[category];
            const found = itemList.find(item => item.name === name);
            if (found) {
                return new Item(found.name, found.desc, found.rarity, found.properties);
            }
        }
        console.log("No item by name: " + name);
        return null;
    }


    getItem(categories){
        if (!categories) throw new Error("Category list is empty!");

        // getting all the items from these categories
        const itemList = [];
        categories.forEach((category) => {
            metadata[category].forEach((i) => {
                i.category = category;
                itemList.push(i);
            });
        });

        const groupedItems = []; // grouped by rarity
        
        // if random rarity picked doesn't exist in the set of items, 
        // it will retry again with a different rarity
        do {
            const rarity = this.#getRandomRarity();
            //console.log('rarity: '+rarity);
            for (const itemData of itemList) {
                if (itemData.rarity === rarity) {
                    const item = new Item(
                        itemData.name,
                        itemData.desc,
                        itemData.category,
                        itemData.rarity,
                        itemData.properties
                    );
                    groupedItems.push(item);
                }
            }
        }
        while (groupedItems.length === 0);

        const randomIndex = Math.floor(this.#randomGen() * groupedItems.length);
        
        return groupedItems[randomIndex];
    }

    #getRandomRarity() {
        const rand = this.#randomGen() * 100 + 1; //SEED
        let percentage = 0;
        for (const rarity in ItemRarity) {
            percentage += ItemRarity[rarity];
            if (rand <= percentage) return rarity;
        }
        return "common";
    }
}

module.exports = ItemGenerator;

