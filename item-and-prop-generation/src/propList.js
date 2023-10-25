const Point = require('@cozy-caves/utils').Point;
const Prop = require('./classes/prop.js');

class PropList {
    #props = [];

    constructor(props) {
        this.#props = props;
    }

    getPropList() {
        return this.#props;
    }

    getSerializedProps() {
        let serializedPropList = [];
        for (const prop of this.#props) {
            serializedPropList.push(prop.getSerializableProp());
        }
        return serializedPropList;
    }


    static fromSerializableProps(propList) {
        let props = [];
        for (let i = 0; i < propList.length; i++) {
            const serializedProp = propList[i];
            const prop = Prop.fromSerializableProp(serializedProp);
            props.push(prop);
        }

        return new PropList(props);
    }
}

module.exports = PropList;