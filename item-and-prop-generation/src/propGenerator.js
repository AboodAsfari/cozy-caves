const Ajv = require("ajv");
const metadata = require("./metadata/prop_metadata.json");
const Prop = require("./classes/prop");
const PropRarity = require('@cozy-caves/utils').PropRarity;
const schema = require("./metadata/prop_schema.json");
const ItemGenerator = require("./itemGenerator");
const seedrandom = require('seedrandom');

class PropGenerator {
    #randomGen;
    constructor (seed) {
        const validate = new Ajv().compile(schema);
        // checking whether or not the metadata is valid
        if (!validate(metadata)) {
            throw new Error("Invalid metadata format: " + JSON.stringify(validate.errors, null, 2));
        }
        if (seed) this.seed = seed;
        else this.seed = Math.random();
        this.#randomGen = seedrandom(this.seed);
    }

    #storeItem(prop) {
        if (!(prop instanceof Prop)) throw new Error("Invalid type. Expecting a Prop object.");
        if (!prop.getContainsItem()) return; // checking if prop is a storage

        const max = Math.floor(this.#randomGen() * 5) + 1; // maximum number of items a prop can have
        const itemGenerator = new ItemGenerator(this.#randomGen());
        for (let i=0; i<max; i++){
            prop.addItem(itemGenerator.getItem(prop.possibleItems));
        }
    }

    #getRandomRarity() {
        const rand = this.#randomGen() * 100 + 1;
        let percentage = 0;
        for (const rarity in PropRarity) {
            percentage += PropRarity[rarity];

            if (rand <= percentage) return rarity;
        }
        return "common";
    }

    getPropByName(name){
        if (metadata.hasOwnProperty(name)) {
            const p = metadata[name];
            const prop = new Prop(
                    name, 
                    p.information.desc, 
                    p.information.rarity, 
                    p.render_rules.contains_item, 
                    p.render_rules.item_categories, 
                    p.render_rules.placement_rules, 
                    p.render_rules.size
                );
            this.#storeItem(prop);
            return prop;
        } else {
            throw new Error(`Prop with name '${name}' not found in metadata.`);
        }
    }

    getProp(propList) { 
        if (!propList) throw new Error("Prop list is empty!");
        // possible props
        const allProps = [];
        propList.forEach((name) => {
            var propData = metadata[name];
            if (!propData) throw new Error(`metadata not found for ${name}`);
            propData.name = name;
            allProps.push(propData);
        });

        const groupedProps = []; // grouped by rarity
        do {
            const rarity = this.#getRandomRarity();
            for (const p of allProps) {
                if (p.information.rarity === rarity) {
                    const prop = new Prop(
                        p.name, 
                        p.information.desc, 
                        p.information.rarity, 
                        p.render_rules.contains_item, 
                        p.render_rules.item_categories, 
                        p.render_rules.placement_rules, 
                        p.render_rules.size
                    );
                    groupedProps.push(prop);
                }
            }
        }
        while (groupedProps.length === 0);

        const randomIndex = Math.floor(this.#randomGen() * groupedProps.length);
        const prop = groupedProps[randomIndex];
        this.#storeItem(prop);
        return prop;
    }
}

module.exports = PropGenerator;

