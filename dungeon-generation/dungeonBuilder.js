const seedrandom = require('seedrandom');
const RoomBuilder = require("@cozy-caves/room-generation").RoomBuilder;
const Point = require("@cozy-caves/utils").Point;
const generateHallways = require("../room-generation/src/hallway/hallwayGenerator");

class DungeonBuilder {

    #height; // Height of map.
    #width; // Width of map.
    #minRoomSize; // Minimum room size.
    #maxDepth; // Maximum recursion depth for BSP.
    #totalCoverage; // Desired total percent floor coverage of the map.
    #dungeonSeed; // Seed used for random number generator.

    #splitHorizontal; // Boolean dictating whether BSP splits horizontal or verticle
    #allRegions; // List containing all final spaces created through BSP

    #rng; // Seeded number generator.
    #roomBuilder; // Room Builder

    // Preset values for input parameters
    #presets = {
        Small: [50, 50, 7, 50],
        Medium: [100, 100, 7, 60],
        Large: [150, 150, 7, 70],
    };

    /**
     * Constructor just to initialize seedrandom()
     */
    constructor() {
        this.#rng = seedrandom()
    }

    //Setters
    setPreset(preset){
        if (this.#presets[preset]){
            [this.#height, this.#width, this.#minRoomSize, this.#totalCoverage] = this.#presets[preset];
            this.#dungeonSeed = Math.random();
        }
        return this;
    }
    setSize(width, height){
        if(typeof width !== 'number') throw new Error('Invalid width size provided');
        if(typeof height !== 'number') throw new Error('Invalid height size provided');
        this.#height = height;
        this.#width = width;
        return this;
    }
    setMinRoomSize(minRoomSize){
        if(typeof minRoomSize !== 'number') throw new Error('Invalid minimum gap size provided');
        this.#minRoomSize = minRoomSize; 
        return this;
    }
    setTotalCoverage(totalCoverage){
        if(typeof totalCoverage !== 'number') throw new Error('Invalid total coverage size provided');
        this.#totalCoverage = totalCoverage;
        return this;
    }
    setSeed(seed){
        this.#dungeonSeed = seed; 
        this.#rng = seedrandom(this.#dungeonSeed)
        return this;
    }

    /**
     * Generates a random split position within the desired range
     * 
     * @param min Minimum of desired range
     * @param max Maximum of desired range
     * @param minDistance A buffer "normalizing" value 
     * @returns 
     */
    #generateSplitPosition(min, max, minDistance) {
        const range = max - min - 2 * minDistance + 1;
        const startPosition = min + minDistance;
        return startPosition + Math.floor(this.#rng() * range);
        
    }

    /**
     * Calculates the appropriate maximum recursion depth according to 
     * the dimensions of the map and the minimum room size 
     */
    #calculateMaxDepth(){
        let difference = Number.MAX_SAFE_INTEGER;
        for(let n = 1; n <= 10; n++){
            //Compares map area to 25n^2 and finds closest n value
            if(Math.abs(((25*n)**2) - (this.#width * this.#height)) < difference){
                difference = Math.abs(((25*n)**2) - (this.#width * this.#height));
                this.#maxDepth = n + 6 + (7 - this.#minRoomSize);
            }
        }
    }

    /**
     * Recursive Binary Space Partitioning method. More can be read about this 
     * inside the module README
     * 
     * @param x Left most X value of the current region
     * @param y Top most Y value of the current region
     * @param w Width of the current region
     * @param h Height of the current region
     * @param recursions Current recursive depth
     * @returns 
     */
    #bsp(x, y, w, h, recursions) {
        //Makes algorithm more likely to alternate between vertical and horizontal partition
        this.#splitHorizontal = this.#splitHorizontal ? this.#splitHorizontal = this.#rng() > 0.8 : this.#splitHorizontal = this.#rng() > 0.2;
        
        //Exits if max depth reached OR if width/height is less than 2x+1 to ensure min room size is not too small
        if (recursions <= 0 || (w < (this.#minRoomSize*2 + 1) && !this.#splitHorizontal) || (h < (this.#minRoomSize*2 +1) && this.#splitHorizontal)) {
            if (w / 3 > h) {
                this.#splitHorizontal = false;
            } else if (h / 3 > w) {
                this.#splitHorizontal = true;
            }
            else {
                //Temporary region object just to store parameters to provide to Room Gen Module
                let region = {
                    x: x,
                    y: y,
                    width: w,
                    height: h
                };
                this.#allRegions.push(region);
                return;
            }
        }
        
        if (this.#splitHorizontal) {
            const splitPosition = this.#generateSplitPosition(y, y + h, this.#minRoomSize);
            this.#bsp(x, y, w, splitPosition - y, recursions - 1);
            this.#bsp(x, splitPosition, w, h - (splitPosition - y), recursions - 1);
        } else {
            const splitPosition = this.#generateSplitPosition(x, x + w, this.#minRoomSize);
            this.#bsp(x, y, splitPosition - x, h, recursions - 1);
            this.#bsp(splitPosition, y, w - (splitPosition - x), h, recursions - 1);
        }
    }

    /**
     * Randomly selects regions from the allRegions list and creates a room to fill the region
     * 
     * @returns 
     */
    #randomSelection(){
        let floorCoverage = 0.0;
        let map = [];
        while(floorCoverage < this.#totalCoverage){
            if(this.#allRegions == 0)break;
            let region = this.#allRegions[Math.floor(this.#rng() * this.#allRegions.length)];
            let regionArea = region.width * region.height;
            floorCoverage += (regionArea / (this.#width*this.#height)) * 100;
            this.#allRegions = this.#allRegions.filter(reg => reg !== region);

            let room = this.#roomConstruction(region.width, region.height, region.x, region.y);
            map.push(room);
        }
        return map;
    }

    /**
     * Calculates random position and dimensions from the region dimensions and constructs a Room object
     * 
     * @param rW Region width 
     * @param rH Region Height
     * @param rX Region X position
     * @param rY Region Y position
     * @returns 
     */
    #roomConstruction(rW, rH, rX, rY){

        let minRoomW = Math.floor(2*rW/3);
        let minRoomH = Math.floor(2*rH/3);
        
        //Calculate random room height and width 
        let roomWid = (minRoomW < this.#minRoomSize) ? Math.floor(this.#rng() * (rW - this.#minRoomSize + 1)) + this.#minRoomSize : Math.floor(this.#rng() * (rW - minRoomW + 1)) + minRoomW;
        let roomHgt = (minRoomH < this.#minRoomSize) ?  Math.floor(this.#rng() * (rH - this.#minRoomSize + 1)) + this.#minRoomSize: Math.floor(this.#rng() * (rH - minRoomH + 1)) + minRoomH;
        //Calculate how much leniency to allow
        let widLeniency = (minRoomW < this.#minRoomSize) ? 0 : Math.floor((roomWid - minRoomW)/2);
        let hgtLeniency = (minRoomH < this.#minRoomSize) ? 0 : Math.floor((roomHgt - minRoomH)/2);
        //Calculate random room position within region space
        let roomX = rX + Math.floor(this.#rng() * (rW - roomWid + 1));
        let roomY = rY + Math.floor(this.#rng() * (rH - roomHgt + 1));
        //Generate room
        this.#roomBuilder = new RoomBuilder(this.#rng());
        let room = this.#roomBuilder.setSize(new Point(roomWid, roomHgt)).setLeniency(new Point(widLeniency, hgtLeniency)).setAllowOvergrow(false).setPopulateWithItems(this.#rng() > .5).build();
        room.setPosition(new Point(roomX, roomY));
        
        return room;
    }

    /**
     * Builds the dungeon according to the fields set
     * 
     * @returns Returns a Map list containing all Rooms
     */
    build(){
        this.#reset();
        this.#checkSet();
        this.#calculateMaxDepth();
        this.#bsp(0, 0, this.#width, this.#height, this.#maxDepth);
        let map = this.#randomSelection();
        generateHallways(map);
        return map;
    }

    /**
     * Resets global fields
     */
    #reset(){
        this.#splitHorizontal = this.#rng() > 0.5;
        this.#allRegions = [];
    }

    /**
     * Checks that each of the fields has been properly set before building a dungeon
     */
    #checkSet(){
        if(typeof this.#height === 'undefined'){ throw new Error('Height has not been set');}
        if(typeof this.#width === 'undefined'){ throw new Error('Width has not been set');}
        if(typeof this.#minRoomSize === 'undefined'){ throw new Error('Minimum gap has not been set');}
        if(typeof this.#totalCoverage === 'undefined'){ throw new Error('Total Coverage has not been set');}
        if(typeof this.#dungeonSeed === 'undefined'){ throw new Error('Dungeon Seed has not been set');}
    }

    // Getter methods
    getSeed(){ return this.#dungeonSeed; }
    getPresets() { return this.#presets; }

}

module.exports = DungeonBuilder;