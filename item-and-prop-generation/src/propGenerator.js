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
            throw new Error("Invalid metadata format");
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

    getPropByRarity(rarity) { 
        if (!this.rarityList.includes(rarity)) throw new Error("Invalid rarity category: ${rarity}");

        const categories = metadata.item_categories;
        // groups all props by rarity regardless of their category
        const filteredProps = categories.reduce((props, category) => {
            return props.concat(category.filter(p => p.rarity === rarity));
        }, []);
        if (filteredProps.length === 0) throw new Error("No props found for rarity: ${rarity}");

        // Generate a random index based on the length of the filtered props
        const randomIndex = Math.floor(Math.random() * filteredProps.length);
        const p = filteredProps[randomIndex];
        const prop = new Prop(p.name, p.desc, p.rarity, p.containItem);

        if (prop.containItem) {
            const max = Math.floor(Math.random() * 5) + 1; // maximum number of items a prop can have
            for (let i=0; i<max; i++){
                this.storeItem(prop);
            }
        }
        return prop;
    }

    getPropByCategory(category){
        const temp = metadata[category];
        if (temp.length === 0) throw new Error("No props found for category: ${category}");

        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor(Math.random() * temp.length); 
        let p = temp[randomIndex];
        return new Prop(p.name, p.desc, p.rarity, p.containItem);
    }
}

module.exports = PropGenerator;

