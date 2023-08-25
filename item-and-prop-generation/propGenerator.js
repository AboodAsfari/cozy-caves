const Ajv = require("ajv");
const metadata = require("./metadata/prop_metadata.json");
const Prop = require("./classes/prop");
const schema = require("./metadata/prop_schema.json");

class PropGenerator {
    
    constructor () {
        const validate = new Ajv().compile(schema);
        // does not match the format
        if (!validate(metadata)) {
            throw new Error("Invalid JSON data");
        }
    }

    getItemByCategory(category){
        const temp = metadata[category];
        if (temp.length === 0) throw new Error('No items found for category: ' + category);

        // this random index gives a fair chance to every item that is in the list
        let randomIndex = Math.floor() * temp.length;
        return temp[randomIndex];
    }
}

module.exports = PropGenerator;

