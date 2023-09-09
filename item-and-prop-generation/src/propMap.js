const PropGenerator = require('./propGenerator.js');
const Point = require('@cozy-caves/utils').Point;
const PropSet = require('./propSet.js');


class PropMap {
    #populatedRoom = new Map();
    #room;
    #propGenerator = new PropGenerator();
    #propSet = new PropSet(Math.random()); // change this later when there is a seed

    constructor (room) {
        this.#room = room;
        this.#populatePropMap();
    }
    
    #getRandomRarity() {
        const rand = Math.random() * 100 + 1;
    
        if (rand <= 60) { // common
            return this.#propGenerator.rarityList[0];
        } else if (rand <= 90) { // uncommon
            return this.#propGenerator.rarityList[1];
        } else if (rand <= 100) { // rare
            return this.#propGenerator.rarityList[2];
        } else { // just in case something goes wrong, go with common
            return this.#propGenerator.rarityList[0];
        }
    }

    /**
     * Populates the populatedRoom with a set of props based on rarity.
     */
    #populatePropMap() {
        const propSet = this.#propSet.getSetByRarity(this.#getRandomRarity());

        // Ensure that you have a valid propSet
        if (!Array.isArray(propSet) || propSet.length === 0) throw new Error("Empty prop set");

        this.#placeProps(propSet);
        
    }


    /**
     * Looks for a valid random poisiton in the room so that a prop can be placed.
     *
     * @returns Point position.
     */
    #getRandomPosition(){
        const roomDimensions = this.#room.getDimensions();
        let count = 0;

        // Limiting the number of attempts to avoid an infinite loop. This should not happen in a normal scenerio.
        while (count < 1000) {
            const i = Math.floor(Math.random() * roomDimensions.getX()); // USE SEED
            const j = Math.floor(Math.random() * roomDimensions.getY());

            const pos = new Point(i, j);
            
            const tile = this.#room.getTile(pos);
            const prop = this.getProp(pos);

            // checking if the tile exist in this position and making sure it is a floor tile
            if (tile === null || tile === undefined) continue;
            if (!(prop === null || prop === undefined)) continue;
            if (tile.getTileType() === "floor") return pos;

            count++;
        }
        return null;
    }

    /**
     * Checks whether or not the position provided is a free space to put prop in.
     * Rules can be added here if when the code is extended.
     * 
     * @param {Point} pos - Position to be checked 
     * @returns boolean
     */
    #checkValidPosition(pos){
        const tile = this.#room.getTile(pos);
        var noFloor = tile === null || tile === undefined || tile.getTileType() !== "floor";
        var noProp = this.getProp(pos) === null || this.getProp(pos) === undefined;
        if (noFloor || !noProp) return false;
        return true;
    }

    /**
     * Places the props in the prop set near each other using an anchor point.
     * 
     * @param {Array} propSet - the set of props.
     */
    #placeProps(propSet) {
        let anchorPos;
        do {
            anchorPos = this.#getRandomPosition();
        } while (anchorPos === null);

        propSet[0].setPosition(anchorPos);
        this.#populatedRoom.set(anchorPos.toString(), propSet[0]);
        let range = this.#room.getDimensions().getX()-3;
        for (var i=1; i<propSet.length; i++) {
            const prop = propSet[i];
            const relativePos = this.#calculateRelativePos(anchorPos, range);

            if (relativePos === null) continue;

            prop.setPosition(relativePos);
            this.#populatedRoom.set(relativePos.toString(), prop);
        }
    }
    
    /**
     * This calculates a random position relative to the given anchor position. 
     * 
     * @param {Point} anchorPos - Position of the anchor point.
     * @param {number} range - How far the new position can be from the anchor point.
     * @returns Position.
     */
    #calculateRelativePos(anchorPos, range){
        let xChange, yChange, x, y, newPos;

        do {
            xChange = Math.floor(Math.random() * (2 * range + 1)) - range;
            yChange = Math.floor(Math.random() * (2 * range + 1)) - range;
            x = anchorPos.getX() + xChange;
            y = anchorPos.getY() + yChange;
            newPos = new Point(Math.abs(x), Math.abs(y));
        } while (!this.#checkValidPosition(newPos));

        return newPos;
    }

    getProp(pos) {
        return this.#populatedRoom.get(pos.toString());
    }

    getPropList(){
        return Array.from(this.#populatedRoom.values());
    }

    toString() {
        let roomArray = [];
        let dimensions = this.#room.getDimensions();
        let propInfo = "";

        for (let i = 0; i < dimensions.getY(); i++) {
            roomArray.push("");
            for (let j = 0; j < dimensions.getX(); j++) {
                let pos = new Point(j, i);
                let tile = this.#room.getTile(pos);
                if (tile === null || tile === undefined) continue; 
                let prop = this.getProp(pos);

                if (prop !== null && prop !== undefined) {
                    roomArray[i] += "P";
                    propInfo  += pos.toString() + ": " + prop.name + "\n";
                }
                else if (!tile) roomArray[i] += "X";
                else if (tile.getTileType() === "floor") roomArray[i] += "O";
                else roomArray[i] += "I";
                roomArray[i] += "  ";
            }
        }
        let finalRoom = roomArray.join("\n");
        let finalString = finalRoom.substring(0, finalRoom.length - 1) + "\n\n" + propInfo;
        return finalString;
    }

}

function populateRoom(room) {
    return new PropMap(room);
}

module.exports = populateRoom;