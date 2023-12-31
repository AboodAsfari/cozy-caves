const Point = require('@cozy-caves/utils').Point;
const TileSpacialType = require('@cozy-caves/utils').TileSpacialType;
const Rarity = require('@cozy-caves/utils').PropRarity; // change later when utils is repackaged
const PropGenerator = require('./propGenerator.js');
const Prop = require('./classes/prop.js');
const PropSet = require('./propSet.js');
const PropList = require('./propList.js');
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
        this.processSet(this.#propList);
    }

    /**
     * Calculates and returns the maximum number of props allowed based on the room dimensions.
     *
     * @returns {number} The maximum number of props.
     */
    #getMaxProp() {
        let x = this.#room.getDimensions().getX();
        let y = this.#room.getDimensions().getY();

        let size = Math.max(x, y);
        if (size <= 7) return 7;
        else if (size <= 12) return 10;
        else if (size <= 15) return 14;
        return 17;
    }

    /**
     * Finds a position on a specified wall type within the map.
     *
     * @param {Prop} prop - The prop to find a position near the wall.
     * @param {string} wallType - The type of wall to find a position near (e.g., "edgeWall", "cornerWall", "innerWall").
     * @param {Map<string, number>} map - A map to keep track of available positions.
     * @returns {void}
     */
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
            [TileSpacialType.TOP_LEFT_INNER_WALL]: { x: -1, y: -1 },
            [TileSpacialType.TOP_RIGHT_INNER_WALL]: { x: -1, y: -1 },
            [TileSpacialType.BOTTOM_LEFT_INNER_WALL]: { x: -1, y: -1 },
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
            const wallTypeNumber = wall.getTileSpacialType();

            // Retrieve the wall orientation using the WallOrientation mapping
            const orientation = wallOrientation[wallTypeNumber];

            // This will change the position the search should extend towards
            if (orientation) {
                const xModifier = orientation.x;
                const yModifier = orientation.y;


                let xScale = 1;
                let yScale = 1;

                let xOffset = 0;
                let yOffset = 0;
                
                if (xModifier === -1) {
                    xOffset = (propW-1) * xModifier;
                    xScale = -1;
                }
                if (yModifier === -1) {
                    yOffset = (propH-1) * yModifier;
                    yScale = -1;
                }
                
                let newPos = new Point(xOffset, yOffset);

                // left and right wall
                if (xModifier !== 0 && yModifier === 0) {
                    prop.setRotation(90);

                    const ratio = prop.getSize().h/prop.getSize().w;
                    if (ratio !== 1) {
                        prop.setOffset(ratio);
                    }

                    newPos = new Point(yOffset, xOffset);
                }
                
                prop.setScale(new Point(xScale, yScale));
                randomPos = randomPos.add(newPos);
            }

            // if the randomly generated position is valid
            if (this.#checkFreeSpace(randomPos, propW, propH, wallType)) {
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

    /**
     * Finds a position near a specified prop within the map.
     *
     * @param {Prop} prop - The prop to find a position for.
     * @param {string} nearProp - The name of the prop near which to find a position.
     * @param {Map<string, number>} map - A map to keep track of available positions.
     * @returns {void}
     */
    findPositionNearProp(prop, nearProp, map) {
        // prop already exist in the map
        let adjProp = [...this.#populatedRoom.values()].find(p => p.getName() === nearProp);

        // if the adj prop is not already in the room
        if (!adjProp) {
            if (prop.getName() === nearProp) {
                this.findRandomValidPosition(prop, map);
            } else {
                // create and put the adjacent prop in the room !!Improtant. Please avoid circular dependency
                const propGen = new PropGenerator(this.#randomGen());
                adjProp = propGen.getPropByName(nearProp);
                this.processProp(adjProp);
            }
            return;
        }

        const propW = prop.getSize().w;
        const propH = prop.getSize().h;
        let pos = adjProp.getPosition();
        let xRange = adjProp.getSize().w;
        let yRange = adjProp.getSize().h;

        let found = false;

        // explore adjacent spaces
        for (let i=(-1)*(propW); i<=(xRange+propW -1); i++) {
            for (let j=(-1)*(propH); j<=(yRange+propH -1); j++) {
                const newPos = pos.add(new Point(i, j));
                if (this.#checkFreeSpace(newPos, propW, propH, "none")) {
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
    }

    /**
     * Finds a central position for placing a prop within the map.
     *
     * @param {Prop} prop - The prop to be placed at the center position.
     * @param {Map<string, number>} map - A map to keep track of available positions.
     * @returns {void}
     */
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
                if (this.#checkFreeSpace(newPos, propW, propH, "none")) {
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

    /**
     * Finds a random position where a prop can be placed.
     *
     * @param {Prop} prop - The prop to be randomly placed.
     * @param {Map<string, number>} map - A map to keep track of available positions.
     * @returns {void}
     */
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
            if (this.#checkFreeSpace(randomPos, propW, propH, "none")) {
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

    /**
     * Processes the set data and places the props within the map.
     *
     * @returns {void}
     */
    processSet(propList){
        // parse set data
        for (let i = 0; i < propList.length; i++) {
            const p = propList[i];
            this.processProp(p);
        }
    }

    /**
     * Processes a specific prop and determines its placement within the map.
     *
     * @param {Prop} prop - The prop to be processed and placed.
     * @returns {void}
     */
    processProp(prop) {
        // will store map of possible positons for the prop to choose from
        const validPosMap = new Map();
        const validPositions = [];
        
        const nearWall = prop.getPlacementRules().nearWall; //str
        const nearProp = prop.getPlacementRules().nearProp; //str prop name
        const atCenter = prop.getPlacementRules().atCenter; //boolean


        // Allow rotation
        if (prop.getSize().w === 1 && prop.getSize().h === 1
         && nearWall === "none") {
            // give random rotation to either 90, 180 or 270 degrees
            const rotations = [90, 180, 270];
            const randomRotation = rotations[Math.floor(this.#randomGen() * rotations.length)];
            prop.setRotation(randomRotation);
        }

        
        if (atCenter) this.findCenterPositon(prop, validPosMap);
        if (nearWall !== "none") this.findPositionNearWall(prop, nearWall, validPosMap); 
        if (nearProp !== "none") this.findPositionNearProp(prop, nearProp, validPosMap);
        if (!atCenter && nearProp === "none" && nearWall === "none") this.findRandomValidPosition(prop, validPosMap);

        // if unable to find any valid position for a prop, what to do? TODO
        if (validPosMap.size === 0) {
            // console.log("could not find any valid positon for " + prop.getName());
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

    /**
     * Checks if a specified position and dimensions are free for placing a prop.
     *
     * @param {Point} pos - The position to check.
     * @param {number} w - The width of the prop.
     * @param {number} h - The height of the prop.
     * @param {boolean} wall - Indicates if the type of wall.
     * @returns {boolean} - True if the space is free; otherwise, false.
     */
    #checkFreeSpace(pos, w, h, wall) {
        for (let i=0; i<w; i++) {
            for (let j=0; j<h; j++){
                const newPos = pos.add(new Point(i, j));
                if(!this.#checkValidPosition(newPos, wall)) return false;
            }
        }
        return true;
    }

    /**
     * Places a prop within the map at the specified position, claiming the necessary space as unavailable.
     *
     * @param {Prop} prop - The prop to be placed.
     * @param {Point} pos - The position at which to place the prop.
     * @returns {void}
     */
    #putProp(prop, pos) {
        // claiming space for prop bigger than one tile
        if (!prop.getOverlap()) {
            for (let i=0; i<prop.getSize().w; i++) {
                for (let j=0; j<prop.getSize().h; j++){
                    const newPos = pos.add(new Point(i,j));
                    this.#validPos.set(newPos.toString(), 1);
                }
            }
        }

        prop.setPosition(pos);
        // putting prop in the map
        this.#populatedRoom.set(pos.toString(), prop);
    }

    /**
     * Checks whether or not the position provided is a free space to put prop in.
     * 
     * @param {Point} pos - Position to be checked 
     * @returns {String} type of the wall.
     */
    #checkValidPosition(pos, wallType){
        const tile = this.#room.getTile(pos);
        const invalid = tile === null || tile === undefined;
        if (invalid) return false;
        const noPropExist = this.getProp(pos) === null || this.getProp(pos) === undefined;
        const isWall = tile.getTileType() !== "floor";
        const notFree = this.checkPos(pos) === 1;
        if (isWall && wallType==="none") return false; // no wall
        if (!noPropExist || notFree) return false;
        // corner walls
        const cornerWall = tile.getTileSpacialType() === TileSpacialType.BOTTOM_LEFT_CORNER_WALL 
            || tile.getTileSpacialType() === TileSpacialType.TOP_LEFT_CORNER_WALL
            || tile.getTileSpacialType() === TileSpacialType.BOTTOM_RIGHT_CORNER_WALL
            || tile.getTileSpacialType() === TileSpacialType.TOP_RIGHT_CORNER_WALL;
        if (cornerWall && wallType==="edgeWall") return false; // does not allow corner walls on prop with edge wall
        return true;
    }

    checkPos(pos) {
        return this.#validPos.get(pos.toString()); // return have number if it is valid
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
                    roomArray[i] += prop.getName().substring(0,1);
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

    showPosMap() {
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
                let value = this.checkPos(pos); 

                if (value !== null && value !== undefined) {
                    if (prop !== null && prop !== undefined) {
                        roomArray[i] += prop.getName().substring(0,1);
                        propInfo  += pos.toString() + ": " + prop.name + ", w:" + prop.getSize().w + " h:" + prop.getSize().h + "\n";
                        // propInfo += "Spacial type: " + tile.getTileSpacialType().toString() + "\n";
                    } 
                    else {
                        roomArray[i] += value;
                    }
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
    const propMap = new PropMap(room, seed);
    return new PropList(propMap.getPropList());
}

module.exports = populateRoom;