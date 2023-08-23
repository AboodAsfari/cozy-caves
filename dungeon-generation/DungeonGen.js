//Height/Width, minGap, maxDepth, and seed will either be read from user input or from preset values
const height = 175; 
const width = 175; 
const minGap = 5; 
const maxDepth = 10; 
const totalCoverage = 50;
const seedrandom = require('seedrandom');
const seed = Math.random();
let rng = seedrandom(seed);
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
                height: h,
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

//TESTING SETUP - Generates 10 random BSP maps
for(let j = 0; j < 10; j++){
    const mapGrid = Array.from({length: height}, () => Array.from({length: width}, () => '_'));
    bsp(mapGrid, 0, 0, width, height, maxDepth);

    //Room Selection - randomly selects rooms until the overall floor coverage is greater than the total desired floor coverage
    let floorCoverage = 0.0;
    let keptRooms = [];
    for(let rm=Math.floor(rng()*rooms.length); floorCoverage < totalCoverage; rm=Math.floor(rng()*rooms.length)){
        let roomArea = rooms[rm].width * rooms[rm].height;
        floorCoverage += (roomArea / (width*height)) * 100;
        keptRooms.push(rooms[rm]);
        rooms.splice(rm, 1);
    }

    //TESTING - Represents kept room spaces with a hash
    for(let rm = 0; rm < keptRooms.length; rm++){
        let room = keptRooms[rm];
        for(let w = 0; w<room.width; w++){
            for(let h = 0; h<room.height;h++){
                mapGrid[room.y+h][room.x+w] = '#';
            }
        }
    }

    //TESTING - Represents the top left x,y position of each room space as an @ to differentiate where each room space begins 
    for (let i = 0; i < keptRooms.length; i++){
        mapGrid[keptRooms[i].y][keptRooms[i].x] = '@';
    }  

    for (let i = 0; i < height; i++) {
        // Join the elements in the row to form a string representation
        const rowString = mapGrid[i].join(' ');
        
        // Print the row
        console.log(`${rowString}`);
    }
    rooms = []; //Just clears rooms for next iteration
    console.log("");
}