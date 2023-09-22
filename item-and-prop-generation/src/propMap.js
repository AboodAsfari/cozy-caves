const Point = require('@cozy-caves/utils').Point;
const Rarity = require('@cozy-caves/utils').PropRarity; // change later when utils is repackaged
const PropSet = require('./propSet.js');
const seedrandom = require('seedrandom');

class PropMap {
    #populatedRoom = new Map();
    #room;
    #propSet;
    #propList;
    #seed;
    #randomGen;

    constructor (room, seed) {
        if (seed) this.#seed = seed;
        else this.#seed = Math.random();

        this.#room = room;
        this.#randomGen = seedrandom(this.#seed);
        this.#propSet = new PropSet(this.#randomGen());
        this.#propList = this.#propSet.getPropSet(this.#getMaxProp());

        this.#populatePropMap();
    }

    #getMaxProp() {
        let x = this.#room.getDimensions().getX();
        let y = this.#room.getDimensions().getY();

        let size = Math.max(x, y);
        if (size <= 7) return 4;
        else if (size <= 12) return 7;
        else if (size <= 15) return 10;
        return 15;
    }

    // with the list of props, look at their placement rules, and decide on position depending on the placement rule
    
    processProps(){
        const propList = this.#propSet.getPropSet(this.#getMaxProp());

        // Ensure that you have a valid propSet
        if (!Array.isArray(propList) || propList.length === 0) throw new Error("Empty prop set");

        console.log("PROPLIST___________________");
    
        // parse data
        for (let i = 0; i < propList.length; i++) {
            const p = propList[i];
            
            const nearWall = p.getPlacementRules().nearWall;
            const nearProp = p.getPlacementRules().nearProp;
            const atCenter = p.getPlacementRules().atCenter;
            const overlap = p.getPlacementRules().overlap;

            if (nearWall !== "none") {
                findPositionNearWall(p, nearWall); 
            }
            if (nearProp !== "none") {
                findPositionNearProp(p, nearProp);
            }
            if (atCenter) {
                findCenterPositon(p);
            }
        }
    }

    findPositionNearWall(prop, wall) {
        // implement later
    }

    findPositionNearWall(prop, nextTo) {
        // implement later
    }

    findCenterPositon(prop) {
        // implement later
    }
    
    /**
     * Populates the populatedRoom with a set of props based on rarity.
     */
    #populatePropMap() {
        const propList = this.#propSet.getPropSet(this.#getMaxProp());

        // Ensure that you have a valid propSet
        if (!Array.isArray(propList) || propList.length === 0) throw new Error("Empty prop set");

        this.#placeProps(propList);
        
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
            const i = Math.floor(this.#randomGen() * roomDimensions.getX());
            const j = Math.floor(this.#randomGen() * roomDimensions.getY());

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

    #nearWall(prop) {
        const w = prop.getSize().w;
        const h = prop.getSize().h;

        

        let dimensions = this.#room.getDimensions();

        // getting all the wall tiles
        const walls = [];
        for (let i = 0; i < dimensions.getY(); i++) {
            for (let j = 0; j < dimensions.getX(); j++) {
                let pos = new Point(j, i);
                let tile = this.#room.getTile(pos);
                if (tile.getTileType() === "wall") walls.push(pos);
            }
        }

        let left = new Point(-1,0);
        let right = new Point(1,0);
        let top = new Point(0,-1);
        let bottom = new Point(0,1);

        const edgeWallValues = [left.toString(), right.toString(), top.toString(), bottom.toString()];
        const allEdgeWalls = walls.filter((pos) => edgeWallValues.includes(pos.toString()));
        
    }

    /**
     * Checks whether or not the position provided is a free space to put prop in.
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

        propSet[0].setOrigin(anchorPos);
        this.#populatedRoom.set(anchorPos.toString(), propSet[0]);
        let range = this.#room.getDimensions().getX()-3;
        for (var i=1; i<propSet.length; i++) {
            const prop = propSet[i];
            const relativePos = this.#calculateRelativePos(anchorPos, range);

            if (relativePos === null) continue;

            prop.setOrigin(relativePos);
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
            xChange = Math.floor(this.#randomGen() * (2 * range + 1)) - range;
            yChange = Math.floor(this.#randomGen() * (2 * range + 1)) - range;
            x = anchorPos.getX() + xChange;
            y = anchorPos.getY() + yChange;
            newPos = new Point(Math.abs(x), Math.abs(y));
        } while (!this.#checkValidPosition(newPos));

        return newPos;
    }

    // Getters
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

function populateRoom(room, seed) {
    return new PropMap(room, seed);
}

module.exports = populateRoom;