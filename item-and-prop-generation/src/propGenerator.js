const Ajv = require("ajv");
const metadata = require("./metadata/prop_metadata.json");
const Prop = require("./classes/prop");
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

    storeItem(prop) {
        if (!(prop instanceof Prop)) {
            throw new Error("Invalid type. Expecting a Prop object.");
        }

        const rarity = this.getRandomRarity();
        prop.addItem(ItemGenerator.getItemByRarity(rarity));
    }

    getRandomRarity() {
        const rand = Math.random() * 100 + 1;

        if (rand <= 50) {
            return ItemGenerator.rarityList[0];
        } else if (rand <= 75) {
            return ItemGenerator.rarityList[1];
        } else if (rand <= 90) {
            return ItemGenerator.rarityList[2];
        } else if (rand <= 97) {
            return ItemGenerator.rarityList[3];
        } else if (rand <= 100) {
            return ItemGenerator.rarityList[4];
        } else {
            return ItemGenerator.rarityList[0];
        }
    }

    getPropByName(name){
        const categories = metadata.prop_categories;
        
        for (const category in categories) {
            const propList = categories[category];
            const foundProp = propList.find(prop => prop.name === name);
            if (foundProp) {
                return foundProp;
            }
        }

        return null;
    }

    getPropByRarity(rarity) { 
        if (!this.rarityList.includes(rarity)) throw new Error("Invalid rarity category: ${rarity}");

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

        if (prop.containsItem) {
            const max = Math.floor(Math.random() * 5) + 1; // maximum number of items a prop can have
            for (let i=0; i<max; i++){
                this.storeItem(prop);
            }
        }
        return prop;
    }

    getPropByCategory(category){
        const temp = metadata[category];
        if (temp.length === 0) throw new Error(`No props found for category: ${category}`);

        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor(Math.random() * temp.length); 
        let p = temp[randomIndex];
        return new Prop(p.name, p.desc, p.rarity, p.containsItem);
    }
}

module.exports = PropGenerator;

