const Ajv = require("ajv");
const metadata = require("./metadata/prop_metadata.json");
const Prop = require("./classes/prop");
const Rarity = require('../../utils/src/itemRarity'); ////require('@cozy-caves/utils').ItemRarity;
const schema = require("./metadata/prop_schema.json");
const ItemGenerator = require("./itemGenerator");

class PropGenerator {
    rarityList = ["common", "uncommon", "rare"];
    constructor () {
        const validate = new Ajv().compile(schema);
        // checking whether or not the metadata is valid
        if (!validate(metadata)) {
            throw new Error("Invalid metadata format: " + JSON.stringify(validate.errors, null, 2));
        }
    }

    #storeItem(prop) {
        if (!(prop instanceof Prop)) {
            throw new Error("Invalid type. Expecting a Prop object.");
        }

        if (!prop.containsItem) return;
        const max = Math.floor(Math.random() * 5) + 1; // maximum number of items a prop can have
        for (let i=0; i<max; i++){
            const rarity = this.#getRandomRarity();
            prop.addItem(ItemGenerator.getItemByRarity(rarity));
        }
    }

    
    #getRandomRarity() {
        const rand = Math.random() * 100 + 1; //SEED
        let percentage = 0;
        for (const rarity in Rarity) {
            percentage += Rarity[rarity];

            if (rand <= percentage) return rarity;
        }
        return "common";
    }

    getPropByName(name){
        
        const categories = metadata.prop_categories;
        
        for (const category in categories) {
            const propList = categories[category];
            const found = propList.find(prop => prop.name === name);
            if (found) {
                const prop = new Prop(found.name, found.desc, found.rarity, found.containsItem);
                this.#storeItem(prop);
                return prop;
            }
        }

        return null;
    }

    getPropByRarity(rarity) { 
        if (!this.rarityList.includes(rarity)) throw new Error(`Invalid rarity category: ${rarity}`);

        const categories = metadata.prop_categories;
        const filteredProps = [];

        for (const category in categories) {
            if (categories.hasOwnProperty(category) && Array.isArray(categories[category])) {
                const categoryItems = categories[category];
                filteredProps.push(...categoryItems.filter(p => p.rarity === rarity));
            }
        }

        if (filteredProps.length === 0) throw new Error(`No props found for rarity: ${rarity}`);

        // Generate a random index based on the length of the filtered props
        const randomIndex = Math.floor(Math.random() * filteredProps.length);
        const p = filteredProps[randomIndex];
        const prop = new Prop(p.name, p.desc, p.rarity, p.containsItem);
        
        this.#storeItem(prop);
        return prop;
    }

    getPropByCategory(category){
        const temp = metadata[category];
        if (temp.length === 0) throw new Error(`No props found for category: ${category}`);

        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor(Math.random() * temp.length); 
        let p = temp[randomIndex];
        const prop = new Prop(p.name, p.desc, p.rarity, p.containsItem); 
        this.#storeItem(prop);
        return prop;
    }
}

module.exports = PropGenerator;

