const Point = require("@cozy-caves/utils").Point;
const metadata = require("./metadata/propset_metadata.json");
const PropGenerator = require("./propGenerator");
const seedrandom = require('seedrandom');
const PropRarity = require('@cozy-caves/utils').PropRarity;

class PropSet { 
    #randomGen;
    
    constructor (seed) {
        if (seed) this.seed = seed;
        else this.seed = Math.random();
        this.#randomGen = seedrandom(this.seed);
        this.propGenerator = new PropGenerator(this.#randomGen());
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

    getPropSet(maxProp) {
        const setList = [];
        const rarity = this.#getRandomRarity();
        for (const setName in metadata) {
            const set = metadata[setName];
            if (set.rarity === rarity) setList.push(setName);
        }

        const index = Math.floor(this.#randomGen() * setList.length);
        const propCount = Math.floor(this.#randomGen() * (maxProp - 2 + 1)) + 2; 
        console.log("Allow: " + propCount);

        const propMap = new Map();
        const propSet = [];
        const propList = metadata[setList[index]].props;
        
        let tries = 0;
        do {
            if (tries >= 100) break; // just in case to prevent infinite loop

            const prop = this.propGenerator.getProp(propList);
            const propName = prop.getName(); // Get the name of the prop
            
            if (propMap.get(propName) <= this.#allowedDuplicate(prop.getRarity())) {
                propSet.push(prop);
            }

            if (propMap.has(propName)) {
                const currentValue = propMap.get(propName);
                propMap.set(propName, currentValue + 1);
            } else{
                propMap.set(propName, 1);
            }
            tries++;            
        } while (propSet.length < propCount); 
        
        return propSet;
    }

    #allowedDuplicate(rarity) {
        if (rarity === "common") return 4;
        else if (rarity === "uncommon") return 2;
        return 1; 
    }

    // redo
    getPropSetByName(setName, maxProp){
        const set = metadata[setName];
        if (!set) throw new Error(`No set found for ${setName}.`);
        const propSet = [];
    
        for (let i=0; i<propCount; i++) {
            const propList = metadata[setName].props;
            propSet.push(getProp(propList));
        }
        return propSet;
    }


}

module.exports = PropSet;