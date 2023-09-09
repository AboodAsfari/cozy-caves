const Point = require("@cozy-caves/utils").Point;
const metadata = require("./metadata/propset_metadata.json");
const seedrandom = require('seedrandom');
const PropGenerator = require("./propGenerator");

class PropSet { 
    #seed;
    #randomGen;

    constructor (seed) {
        this.#seed = seed;
        this.#randomGen = seedrandom(this.#seed);
    }

    getSetByRarity(rarity) {
        const setList = [];
        for (const setName in metadata) {
            const set = metadata[setName];
            if (set.rarity === rarity) {
                setList.push(setName);
            }
        }

        const index = Math.floor(this.#randomGen() * setList.length);
        const propSet = this.#getPropSet(setList[index]); 
        return propSet;
    }

    #getPropSet(setName){
        const set = metadata[setName];
        if (!set) throw new Error(`No set found for ${setName}.`);
        const propSet = [];

        for (const propName of set.props) {
            var prop = new PropGenerator().getPropByName(propName)
            if (prop == null) throw new Error(`No prop found for ${propName}.`);
            propSet.push(prop);
        }
        return propSet;
    }
}

module.exports = PropSet;