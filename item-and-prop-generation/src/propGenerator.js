const Ajv = require("ajv");
const metadata = require("./metadata/prop_metadata.json");
const Prop = require("./classes/prop");
const ItemRarity = require('@cozy-caves/utils').ItemRarity;
const PropRarity = require('@cozy-caves/utils').PropRarity;
const schema = require("./metadata/prop_schema.json");
const ItemGenerator = require("./itemGenerator");

class PropGenerator {
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
        if (!prop.getContainsItem()) return;
        const max = Math.floor(Math.random() * 5) + 1; // maximum number of items a prop can have
        const itemGenerator = new ItemGenerator();
        for (let i=0; i<max; i++){
            const rarity = this.#getRandomRarity();
            prop.addItem(itemGenerator.getItemByRarity(rarity));
        }
    }

    
    #getRandomRarity() {
        const rand = Math.random() * 100 + 1; //SEED
        let percentage = 0;
        for (const rarity in ItemRarity) {
            percentage += ItemRarity[rarity];

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
                const prop = new Prop(found.name, found.desc, category, found.rarity, found.contains_items);
                this.#storeItem(prop);
                return prop;
            }
        }

        return null;
    }

    getPropByRarity(rarity) { 
        console.log("calling get prop by rarity: "+ rarity);
        if (!Object.keys(PropRarity).includes(rarity)) throw new Error(`Invalid rarity category: ${rarity}`);

        const categories = metadata.prop_categories;
        const filteredProps = [];

        for (const category in categories) {
            const categoryProps = categories[category];
            for (const propData of categoryProps) {
                if (propData.rarity === rarity) {
                    const prop = new Prop(
                        propData.name,
                        propData.desc,
                        category,
                        propData.rarity,
                        propData.contains_items
                    );
                    filteredProps.push(prop);
                }
            }
        }

        if (filteredProps.length === 0) throw new Error(`No props found for rarity: ${rarity}`);

        // Generate a random index based on the length of the filtered props
        const randomIndex = Math.floor(Math.random() * filteredProps.length);
        const p = filteredProps[randomIndex];
        const prop = new Prop(p.name, p.desc, p.category, p.rarity, p.contains_items);
        
        this.#storeItem(prop);
        return prop;
    }

    getPropByCategory(category){
        const temp = metadata.prop_categories[category];
        if (temp === undefined || temp.length === 0) throw new Error(`No props found for category: ${category}`);

        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor(Math.random() * temp.length); 
        let p = temp[randomIndex];
        const prop = new Prop(p.name, p.desc, category, p.rarity, p.contains_items); 
        this.#storeItem(prop);
        return prop;
    }
}

module.exports = PropGenerator;

