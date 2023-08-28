const seedrandom = require('seedrandom');
const RoomBuilder = require("@cozy-caves/room-generation").RoomBuilder;
const Point = require("@cozy-caves/utils").Point;

class DungeonBuilder {

    #height; // Height of map.
    #width; // Width of map.
    #minGap; // Minimum gap between two partitions (Dictates minimum room size).
    #maxDepth; // Maximum recursion depth for BSP.
    #totalCoverage; // Desired total percent floor coverage of the map.
    #dungeonSeed; // Seed used for random number generator.

    #splitHorizontal; // Boolean dictating whether BSP splits horizontal or verticle
    #allRegions; // List containing all final spaces created through BSP

    #rng; // Seeded number generator.
    #roomBuilder; // Room Builder

    // Preset values for input parameters
    #presets = {
        Small: [50, 50, 5, 5, 50],
        Medium: [100, 100, 5, 10, 60],
        Large: [175, 175, 5, 13, 70],
    };

    /**
     * Creates an instance of the dungeon builder. Will
     * Use a random seed if one is not provided.
     * 
     * @constructor
     * @param seed Optional seed for dungeon generation
     */
    constructor(seed = null) {
        this.#dungeonSeed = seed ? seed : Math.random();
        this.#rng = seedrandom(this.#dungeonSeed);
        this.#roomBuilder = new RoomBuilder(this.#rng());
        this.#splitHorizontal = this.#rng() > 0.5;
        this.#allRegions = [];
    }

    //Setters
    setPreset(preset){
        if (this.#presets[preset]){
            [this.#height, this.#width, this.#minGap, this.#maxDepth, this.#totalCoverage] = this.#presets[preset];
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
    setMinGap(minGap){
        if(typeof minGap !== 'number') throw new Error('Invalid minimum gap size provided');
        this.#minGap = minGap;
        return this;
    }
    setMaxDepth(maxDepth){
        if(typeof maxDepth !== 'number') throw new Error('Invalid maximum depth provided');
        this.#maxDepth = maxDepth;
        return this;
    }
    setTotalCoverage(totalCoverage){
        if(typeof totalCoverage !== 'number') throw new Error('Invalid total coverage size provided');
        this.#totalCoverage = totalCoverage;
        return this;
    }
    setSeed(seed){
        this.#dungeonSeed = seed; 
        this.#rng = seedrandom(this.#dungeonSeed);
        this.#roomBuilder = new RoomBuilder(this.#rng());
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
        if (recursions <= 0 || (w < (this.#minGap*2 + 1) && !this.#splitHorizontal) || (h < (this.#minGap*2 +1) && this.#splitHorizontal)) {
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
            const splitPosition = this.#generateSplitPosition(y, y + h, this.#minGap);
            this.#bsp(x, y, w, splitPosition - y, recursions - 1);
            this.#bsp(x, splitPosition, w, h - (splitPosition - y), recursions - 1);
        } else {
            const splitPosition = this.#generateSplitPosition(x, x + w, this.#minGap);
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
        let roomWid = ((2*rW/3) < this.#minGap) ? Math.floor(this.#rng() * (rW - this.#minGap + 1)) + this.#minGap : Math.floor(this.#rng() * (rW - (2*rW/3) + 1)) + Math.floor(2*rW/3);
        let roomHgt = ((2*rH/3) < this.#minGap) ?  Math.floor(this.#rng() * (rH - this.#minGap + 1)) + this.#minGap: Math.floor(this.#rng() * (rH - (2*rH/3) + 1)) + Math.floor(2*rH/3);
        let roomX = rX + Math.floor(this.#rng() * (rW - roomWid + 1));
        let roomY = rY + Math.floor(this.#rng() * (rH - roomHgt + 1));
        this.#roomBuilder = new RoomBuilder(this.#rng());
        
        let room = this.#roomBuilder.setSize(new Point(roomWid, roomHgt)).setLeniency(new Point(1, 1)).setAllowOvergrow(false).build();
        room.setPosition(new Point(roomX, roomY));
        return room;
    }

    /**
     * Builds the dungeon according to the fields set
     * 
     * @returns Returns a Map list containing all Rooms
     */
    build(){
        this.#checkSet();
        this.#bsp(0, 0, this.#width, this.#height, this.#maxDepth);
        let map = this.#randomSelection();
        this.#reset();

        console.log("final room count - " + map.length); // TESTING ROOM COUNT 
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
        if(typeof this.#minGap === 'undefined'){ throw new Error('Minimum gap has not been set');}
        if(typeof this.#maxDepth === 'undefined'){ throw new Error('Maximum depth has not been set');}
        if(typeof this.#totalCoverage === 'undefined'){ throw new Error('Total Coverage has not been set');}
        if(typeof this.#dungeonSeed === 'undefined'){ throw new Error('Dungeon Seed has not been set');}
    }
}

module.exports = DungeonBuilder;