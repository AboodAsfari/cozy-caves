//Height/Width, minGap, maxDepth, and seed will either be read from user input or from preset values
const height = 175; 
const width = 175; 
const minGap = 5; 
const maxDepth = 10; 
const totalCoverage = 50;

const mapGrid = Array.from({length: height}, () => Array.from({length: width}, () => '_'));
const seedrandom = require('seedrandom');
const RoomBuilder = require("@cozy-caves/room-generation").RoomBuilder;
const Point = require("@cozy-caves/utils").Point;

const seed = Math.random();
let rng = seedrandom(seed);
const roomBuilder = new RoomBuilder(rng());
let splitHorizontal = rng() > 0.5;
let rooms = []



//Keeping range for random partition placement more consistent for better spacing
function generateSplitPosition(min, max, minDistance) {
    const range = max - min - 2 * minDistance + 1;
    const startPosition = min + minDistance;
    return startPosition + Math.floor(rng() * range);
    
}

function bsp(mapGrid, x, y, w, h, recursions) {
    //Makes algorithm more likely to alternate between vertical and horizontal partition - More consistent even spread of open spaces
    splitHorizontal = splitHorizontal ? splitHorizontal = rng() > 0.8 : splitHorizontal = rng() > 0.2;
    
    //Exits if max depth reached OR if width/height is less than 2x+1 to ensure min room size is not too small
    if (recursions <= 0 || (w < (minGap*2 + 1) && !splitHorizontal) || (h < (minGap*2 +1) && splitHorizontal)) {
        if (w / 3 > h) {
            splitHorizontal = false;
        } else if (h / 3 > w) {
            splitHorizontal = true;
        }
        else {
            
            //Temporary room object just to store parameters to provide to Room Gen Module
            let roomObj = {
                x: x,
                y: y,
                width: w,
                height: h
            };

            rooms.push(roomObj);
            return;
        }
    }
    
    if (splitHorizontal) {
        const splitPosition = generateSplitPosition(y, y + h, minGap);
        bsp(mapGrid, x, y, w, splitPosition - y, recursions - 1);
        bsp(mapGrid, x, splitPosition, w, h - (splitPosition - y), recursions - 1);
    } else {
        const splitPosition = generateSplitPosition(x, x + w, minGap);
        bsp(mapGrid, x, y, splitPosition - x, h, recursions - 1);
        bsp(mapGrid, splitPosition, y, w - (splitPosition - x), h, recursions - 1);

    }
}

function generateMap(){
    bsp(mapGrid, 0, 0, width, height, maxDepth);

    //Room Selection - randomly selects rooms until the overall floor coverage is greater than the total desired floor coverage
    let floorCoverage = 0.0;
    let keptRooms = [];
    for(let rm=Math.floor(rng()*rooms.length); floorCoverage < totalCoverage; rm=Math.floor(rng()*rooms.length)){
        // console.log("rm = " + rm + " | size = " + rooms.length + " | floor cov = " + floorCoverage);
        let roomArea = rooms[rm].width * rooms[rm].height;
        floorCoverage += (roomArea / (width*height)) * 100;
        keptRooms.push(rooms[rm]);
        rooms.splice(rm, 1);
    }

    let allRooms = [];
    for(let rm = 0; rm < keptRooms.length; rm++){
        let w = keptRooms[rm].width;
        let h = keptRooms[rm].height;
        keptRooms[rm].width = (w/3 < minGap) ? Math.floor(rng() * (w - minGap + 1)) + minGap : Math.floor(rng() * (w - (w/3)) + 1);
        keptRooms[rm].height = (h/3 < minGap) ? Math.floor(rng() * (h - minGap + 1)) + minGap : Math.floor(rng() * (h - (h/3)) + 1);
        const room = roomBuilder.setSize(new Point(keptRooms[rm].width, keptRooms[rm].height)).setLeniency(new Point(1, 1)).setAllowOvergrow(false).build();
        allRooms.push(room);
    }
    return allRooms;
}

module.exports = generateMap