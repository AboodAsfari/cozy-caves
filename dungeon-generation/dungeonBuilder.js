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
    #allRooms; // List containing all final spaces created through BSP

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
        this.#allRooms = [];
    }

    setPreset(preset){
        if (this.#presets[preset]){
            const [height, width, minGap, maxDepth, totalCoverage] = this.#presets[preset];
            this.#height = height;
            this.#width = width;
            this.#minGap = minGap;
            this.#maxDepth = maxDepth;
            this.#totalCoverage = totalCoverage;
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
        return this;
    }

    //Keeping range for random partition placement more consistent for better spacing
    #generateSplitPosition(min, max, minDistance) {
        const range = max - min - 2 * minDistance + 1;
        const startPosition = min + minDistance;
        return startPosition + Math.floor(this.#rng() * range);
        
    }

    #bsp(mapGrid, x, y, w, h, recursions) {
        //Makes algorithm more likely to alternate between vertical and horizontal partition
        //Done for more consistent even spread of open spaces
        this.#splitHorizontal = this.#splitHorizontal ? this.#splitHorizontal = this.#rng() > 0.8 : this.#splitHorizontal = this.#rng() > 0.2;
        
        //Exits if max depth reached OR if width/height is less than 2x+1 to ensure min room size is not too small
        if (recursions <= 0 || (w < (this.#minGap*2 + 1) && !this.#splitHorizontal) || (h < (this.#minGap*2 +1) && this.#splitHorizontal)) {
            if (w / 3 > h) {
                this.#splitHorizontal = false;
            } else if (h / 3 > w) {
                this.#splitHorizontal = true;
            }
            else {
                //Temporary room object just to store parameters to provide to Room Gen Module
                let roomObj = {
                    x: x,
                    y: y,
                    width: w,
                    height: h
                };
                this.#allRooms.push(roomObj);
                return;
            }
        }
        
        if (this.#splitHorizontal) {
            const splitPosition = this.#generateSplitPosition(y, y + h, this.#minGap);
            this.#bsp(mapGrid, x, y, w, splitPosition - y, recursions - 1);
            this.#bsp(mapGrid, x, splitPosition, w, h - (splitPosition - y), recursions - 1);
        } else {
            const splitPosition = this.#generateSplitPosition(x, x + w, this.#minGap);
            this.#bsp(mapGrid, x, y, splitPosition - x, h, recursions - 1);
            this.#bsp(mapGrid, splitPosition, y, w - (splitPosition - x), h, recursions - 1);
        }
    }

    build(){
        this.#checkSet();
        let mapGrid = Array.from({length: this.#height}, () => Array.from({length: this.#width}, () => '_'));
        this.#bsp(mapGrid, 0, 0, this.#width, this.#height, this.#maxDepth);

        //Room Selection - randomly selects rooms until the overall floor coverage is greater than the total desired floor coverage
        let floorCoverage = 0.0;
        let keptRooms = [];
        for(let rm=Math.floor(this.#rng()*this.#allRooms.length); floorCoverage < this.#totalCoverage; rm=Math.floor(this.#rng()*this.#allRooms.length)){
            let roomArea = this.#allRooms[rm].width * this.#allRooms[rm].height;
            floorCoverage += (roomArea / (this.#width*this.#height)) * 100;
            keptRooms.push(this.#allRooms[rm]);
            this.#allRooms.splice(rm, 1);
        }

        //Using room builder to generate random rooms
        let finalRooms = [];
        for(let rm = 0; rm < keptRooms.length; rm++){
            let spaceW = keptRooms[rm].width;
            let spaceH = keptRooms[rm].height;
            
            //Chooses random width and height for room from maximum space to 2 thirds of maximum space
            //If 2 thirds of max space goes below minGap value then lower limit becomes minGap 
            keptRooms[rm].width = ((2*spaceW/3) < this.#minGap) ? Math.floor(this.#rng() * (spaceW - this.#minGap + 1)) + this.#minGap : Math.floor(this.#rng() * (spaceW - (2*spaceW/3)) + 1) + Math.floor((2*spaceW/3));
            keptRooms[rm].height = ((2*spaceH/3) < this.#minGap) ? Math.floor(this.#rng() * (spaceH - this.#minGap + 1)) + this.#minGap : Math.floor(this.#rng() * (spaceH - (2*spaceH/3)) + 1) + Math.floor((2*spaceH/3));

            const room = this.#roomBuilder.setSize(new Point(keptRooms[rm].width, keptRooms[rm].height)).setLeniency(new Point(1, 1)).setAllowOvergrow(false).build();
            
            //Chooses random X and Y position of the room 
            //Absolute position + relative position within allocated space
            //Upper limit for each direction is max dimension minus room dimension
            //Lower limit is 0 to allow for not shifting the room
            let xPos = keptRooms[rm].x + Math.floor(this.#rng() * (spaceW - keptRooms[rm].width + 1));
            let yPos = keptRooms[rm].y + Math.floor(this.#rng() * (spaceH - keptRooms[rm].height + 1));

            room.setPosition(new Point(xPos, yPos));
            finalRooms.push(room);
        }

        this.#reset();

        console.log("final room count - " + finalRooms.length);
        return finalRooms;
    }

    #reset(){
        this.#splitHorizontal = this.#rng() > 0.5;
        this.#allRooms = [];
    }

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