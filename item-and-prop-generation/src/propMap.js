const Point = require('@cozy-caves/utils').Point;
const Rarity = require('@cozy-caves/utils').PropRarity; // change later when utils is repackaged
const PropSet = require('./propSet.js');
const seedrandom = require('seedrandom');

class PropMap {
    #populatedRoom = new Map();
    #room;
    #propList;
    #seed;
    #validPos = new Map();
    #randomGen;

    constructor (room, seed) {
        if (seed) this.#seed = seed;
        else this.#seed = Math.random();
        this.#room = room;
        this.#randomGen = seedrandom(this.#seed);

        // generating a set
        this.propSetGen = new PropSet(this.#randomGen());
        this.#propList = this.propSetGen.getPropSet(this.#getMaxProp());
        if (!Array.isArray(this.#propList) || this.#propList.length === 0) throw new Error("Empty prop set");   
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

    #cloneMap(map) {
        const temp = new Map();
        for (const [key, value] of map) {
            temp.set(key, value);
        }
        return temp;
    }

    findPositionNearWall(prop, wall, map) {
        // implement later
    }

    findPositionNearProp(prop, adjProp, map) {
        // if the adj prop is not already in the room
        if (!adjProp) {
            console.log("Prop does not exist in map");
            // find a random position
            return;
        }

        const propW = prop.getSize().w;
        const propH = prop.getSize().h;
        let pos = adjProp.getPosition();
        let xRange = adjProp.getSize().w + 1;
        let yRange = adjProp.getSize().h + 1;

        let found = false;
        // explore adjacent spaces
        for (let i=(-1)*(xRange + propW); i<=xRange; i++) {
            for (let j=(-1)*(yRange + propH); j<=yRange; j++) {
                const newPos = pos.add(new Point(i, j));
                if (this.#checkFreeSpace(newPos, propW, propH, false)) {
                    const value = map.get(newPos.toString());
                    found = true;
                    if (!value) {
                        map.set(newPos.toString(), 1);
                    } else {
                        map.set(newPos.toString(), value + 1);
                    }
                }
            }
        }
        if (found) console.log("possible position found");
    }

    findCenterPositon(prop, map) {
        const x = this.#room.getDimensions().getX();
        const y = this.#room.getDimensions().getY();
        const propW = prop.getSize().w;
        const propH = prop.getSize().h;

        const midX = Math.round(x/2) - Math.round(propW/2.3);
        const midY = Math.round(y/2) - Math.round(propH/2.3);

        let pos = new Point(midX, midY); // this will give us the center point

        // explore adjacent spaces
        for (let i=-1; i<=0; i++) {
            for (let j=-1; j<=0; j++) {
                const newPos = pos.add(new Point(i, j));
                if (this.#checkFreeSpace(newPos, propW, propH, false)) {
                    const value = map.get(newPos.toString());
                    if (!value) {
                        map.set(newPos.toString(), 1);
                    } else {
                        map.set(newPos.toString(), value + 1);
                    }
                }
            }
        }
    }

    processSet(){
        // parse set data
        for (let i = 0; i < this.#propList.length; i++) {
            const p = this.#propList[i];
            this.processProp(p);
        }
    }

    processProp(prop) {
        // will store map of possible positons for the prop to choose from
        const validPosMap = this.#cloneMap(this.#validPos); 
        const validPositions = [];
        
        const nearWall = prop.getPlacementRules().nearWall; //str
        const nearProp = prop.getPlacementRules().nearProp; //str prop name
        const atCenter = prop.getPlacementRules().atCenter; //boolean
        
        if (atCenter) {
            this.findCenterPositon(prop, validPosMap);
        } 
        if (nearWall !== "none") {
            this.findPositionNearWall(prop, nearWall, validPosMap); 
        }
        if (nearProp !== "none") {
            // prop already exist in the map
            const propExist = [...this.#populatedRoom.values()].find(p => p.getName() === nearProp);
            // if prop exist in the set list
            if (this.#propList.some((p) => p.getName() === nearProp)) {
                // process prop. This method can be broken down into two. one main and other one just takes a prop arugment
            }
            this.findPositionNearProp(prop, propExist, validPosMap);
        }

        // if unable to find any valid position for a prop, what to do? TODO
        if (validPosMap.size === 0) return; 

        // choose from here and place prop :) add favor later. ie. choose 2 over 1. TODO
        for (const [key, value] of validPosMap) {
            if (value > 0) {
                const position = Point.fromString(key);
                validPositions.push(position);
            } 
        }

        const randomIndex = Math.floor(this.#randomGen() * validPositions.length);
        const validPosition = validPositions[randomIndex];
        //console.log("POSITIONN" + validPosition.toString());
        this.#putProp(p, validPosition);
    }

    #checkFreeSpace(pos, w, h, wall) {
        for (let i=0; i<w; i++) {
            for (let j=0; j<h; j++){
                if(!this.#checkValidPosition(pos.add(new Point(i, j)), wall)) return false;
            }
        }
        return true;
    }

    #putProp(prop, pos) {
        // claiming space for prop bigger than one tile
        for (let i=0; i<prop.getSize().w; i++) {
            for (let j=0; j<prop.getSize().h; j++){
                const newPos = pos.add(new Point(i,j));
                this.#validPos.set(newPos.toString(), 1);
            }
        }

        // putting prop in the map
        this.#populatedRoom.set(pos.toString(), prop);
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
    #checkValidPosition(pos, wall){
        const tile = this.#room.getTile(pos);
        const noFloor = tile === null || tile === undefined || tile.getTileType() !== "floor";
        const noProp = this.getProp(pos) === null || this.getProp(pos) === undefined;
        const noPos = this.checkPos(pos) === 0 || this.checkPos(pos) === undefined || this.checkPos(pos) === null; //TODO: do we need this? check this again later
        if (!wall && noFloor) return false; // no wall
        if (!noProp || !noPos) return false;
        return true;
    }

    /**
     * Places the props in the prop set near each other using an anchor point.
     * 
     * @param {Array} propSet - the set of props.
     */
    #placeProps(propSet) {
        let anchorPos;
        let count = 0;
        do {
            if (count === 500) return;
            anchorPos = this.#getRandomPosition();
            count++;
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
            xChange = Math.floor(this.#randomGen() * (2 * range + 1)) - range;
            yChange = Math.floor(this.#randomGen() * (2 * range + 1)) - range;
            x = anchorPos.getX() + xChange;
            y = anchorPos.getY() + yChange;
            newPos = new Point(Math.abs(x), Math.abs(y));
        } while (!this.#checkValidPosition(newPos, false));

        return newPos;
    }

    checkPos(pos) {
        return this.#validPos.get(pos.toString()); // 0 or 1
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