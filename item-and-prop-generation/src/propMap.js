const Point = require('@cozy-caves/utils').Point;
const TileSpacialType = require('@cozy-caves/utils').TileSpacialType;
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

    findPositionNearWall(prop, wallType, map) {
        // wall type maping
        const wallTypes = {
            edgeWall: [TileSpacialType.LEFT_EDGE_WALL, TileSpacialType.RIGHT_EDGE_WALL, TileSpacialType.TOP_EDGE_WALL, TileSpacialType.BOTTOM_EDGE_WALL],
            cornerWall: [
                TileSpacialType.TOP_LEFT_CORNER_WALL, TileSpacialType.TOP_RIGHT_CORNER_WALL,
                TileSpacialType.BOTTOM_LEFT_CORNER_WALL, TileSpacialType.BOTTOM_RIGHT_CORNER_WALL
            ],
            innerWall: [
                TileSpacialType.TOP_LEFT_INNER_WALL, TileSpacialType.TOP_RIGHT_INNER_WALL,
                TileSpacialType.BOTTOM_LEFT_INNER_WALL, TileSpacialType.BOTTOM_RIGHT_INNER_WALL
            ]
        };

        // wall orentation mapping
        const wallOrientation = {
            [TileSpacialType.LEFT_EDGE_WALL]: { x: 1, y: 0 },
            [TileSpacialType.RIGHT_EDGE_WALL]: { x: -1, y: 0 },
            [TileSpacialType.TOP_EDGE_WALL]: { x: 0, y: 1 },
            [TileSpacialType.BOTTOM_EDGE_WALL]: { x: 0, y: -1 },
            [TileSpacialType.TOP_LEFT_CORNER_WALL]: { x: 1, y: 1 },
            [TileSpacialType.TOP_RIGHT_CORNER_WALL]: { x: -1, y: 1 },
            [TileSpacialType.BOTTOM_LEFT_CORNER_WALL]: { x: 1, y: -1 },
            [TileSpacialType.BOTTOM_RIGHT_CORNER_WALL]: { x: -1, y: -1 },
            [TileSpacialType.TOP_LEFT_INNER_WALL]: { x: 1, y: 1 },
            [TileSpacialType.TOP_RIGHT_INNER_WALL]: { x: -1, y: 1 },
            [TileSpacialType.BOTTOM_LEFT_INNER_WALL]: { x: 1, y: -1 },
            [TileSpacialType.BOTTOM_RIGHT_INNER_WALL]: { x: -1, y: -1 },
        };

        const matchingWalls = new Map();
        // Iterate through the room to find all the matching walls
        for (const tile of this.#room.getTiles()) {
            const pos = tile.getPosition().toString();
            const tileType = tile.getTileSpacialType();
            
            if (wallTypes[wallType].includes(tileType)) {
                matchingWalls.set(pos, tile);
            }
        }

        // this should never happen with a normal room but just for saftey checks
        if (matchingWalls.size === 0) {
            console.log("No matching walls found.");
            this.findRandomValidPosition(prop, map);
            return;
        }

        const propW = prop.getSize().w;
        const propH = prop.getSize().h;
        const tries = 100; // to avoid infinite loop if there are no valid positions

        // Try to find a random position near the wall that is valid
        for (let i=0; i<tries; i++) {
            const possibleWalls = Array.from(matchingWalls.entries());
            const randomIndex = Math.floor(this.#randomGen() * possibleWalls.length);
            const randomWall = possibleWalls[randomIndex];
            const [ pos, wall ] = randomWall;
            let randomPos = Point.fromString(pos);
            const wallType = wall.getTileSpacialType();

            // Retrieve the wall orientation using the WallOrientation mapping
            const orientation = wallOrientation[wallType];

            // This will change the position the search should extend towards
            if (orientation) {
                const xModifier = orientation.x;
                const yModifier = orientation.y;

                let xOffset = 0;
                let yOffset = 0;
                
                console.log(xModifier + "," + yModifier);

                if (xModifier === -1) xOffset = propW * xModifier;
                if (yModifier === -1) yOffset = propH * yModifier;

                console.log("Pos before: " + randomPos);
                randomPos = randomPos.add(new Point(xOffset, yOffset));
                console.log("Pos after: " + randomPos);
            }

            // if the randomly generated position is valid
            if (this.#checkFreeSpace(randomPos, propW, propH, true)) {
                console.log("free space found!!!");
                const value = map.get(randomPos.toString());
                if (!value) {
                    map.set(randomPos.toString(), 1);
                } else {
                    map.set(randomPos.toString(), value + 1);
                }
                return;
            }
        }
    }

    findPositionNearProp(prop, nearProp, map) {
        // prop already exist in the map
        const adjProp = [...this.#populatedRoom.values()].find(p => p.getName() === nearProp);
        // if the adj prop is not already in the room
        if (!adjProp) {
            this.findRandomValidPosition(prop, map);
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

    findRandomValidPosition(prop, map) {
        const x = this.#room.getDimensions().getX();
        const y = this.#room.getDimensions().getY();
        const propW = prop.getSize().w;
        const propH = prop.getSize().h;
        
        const tries = 100; // to avoid infinite loop
        for (let i=0; i<tries; i++) {
            const randomX = Math.floor(this.#randomGen() * x);
            const randomY = Math.floor(this.#randomGen() * y);
            const randomPos = new Point(randomX, randomY);

            // if the randomly generated position is valid
            if (this.#checkFreeSpace(randomPos, propW, propH, false)) {
                const value = map.get(randomPos.toString());
                if (!value) {
                    map.set(randomPos.toString(), 1);
                } else {
                    map.set(randomPos.toString(), value + 1);
                }
                return;
            }
        }
        console.log("Valid random position not found after " + tries + " tries");
    }

    processSet(){
        console.log(this.#propList);
        // parse set data
        for (let i = 0; i < this.#propList.length; i++) {
            const p = this.#propList[i];
            this.processProp(p);
        }
    }

    processProp(prop) {
        // will store map of possible positons for the prop to choose from
        const validPosMap = new Map(); //this.#cloneMap(this.#validPos); 
        const validPositions = [];
        
        const nearWall = prop.getPlacementRules().nearWall; //str
        const nearProp = prop.getPlacementRules().nearProp; //str prop name
        const atCenter = prop.getPlacementRules().atCenter; //boolean
        
        if (atCenter) this.findCenterPositon(prop, validPosMap);
        if (nearWall !== "none") this.findPositionNearWall(prop, nearWall, validPosMap); 
        if (nearProp !== "none") this.findPositionNearProp(prop, nearProp, validPosMap);
        if (!atCenter && nearProp === "none" && nearWall === "none") this.findRandomValidPosition(prop, validPosMap);

        // if unable to find any valid position for a prop, what to do? TODO
        if (validPosMap.size === 0) {
            console.log("could not find any valid positon for " + prop.getName());
            return; 
        }
        // choose from here and place prop :) add favor later. ie. choose 2 over 1. TODO
        for (const [key, value] of validPosMap) {
            if (value > 0) {
                const position = Point.fromString(key);
                validPositions.push(position);
            } 
        }

        const randomIndex = Math.floor(this.#randomGen() * validPositions.length);
        const validPosition = validPositions[randomIndex];
        this.#putProp(prop, validPosition);
    }

    #checkFreeSpace(pos, w, h, wall) {
        for (let i=0; i<w; i++) {
            for (let j=0; j<h; j++){
                const newPos = pos.add(new Point(i, j));
                if(!this.#checkValidPosition(newPos, wall)) return false;
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
    #checkValidPosition(pos, acceptWall){
        const tile = this.#room.getTile(pos);
        const notFloor = tile === null || tile === undefined || tile.getTileType() !== "floor";
        const noPropExist = this.getProp(pos) === null || this.getProp(pos) === undefined;
        const notFree = this.checkPos(pos) === 1;
        if (notFloor && !acceptWall) return false; // no wall
        if (!noPropExist || notFree) return false;
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
                else if (tile.getTileType() === "floor") roomArray[i] += "-";
                else roomArray[i] += "w";
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