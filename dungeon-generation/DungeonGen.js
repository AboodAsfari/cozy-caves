let height = 175; //Will need tuning to find "preset" values
let width = 175; //Will need tuning to find "preset" values
const mapGrid = Array.from({length: height}, () => Array.from({length: width}, () => '_'));
let minGap = 5; //Will need tuning to find "preset" values
let maxDepth = 10; //Will need tuning to find "preset" values
let splitHorizontal = Math.random() > 0.5;

//Keeping range for random partition placement more consistent for better spacing
function generateSplitPosition(min, max, minDistance) {
    const range = max - min - 2 * minDistance + 1;
    const startPosition = min + minDistance;
    return startPosition + Math.floor(Math.random() * range);
}

function bsp(mapGrid, x, y, w, h, recursions) {
    // console.log(recursions + ":" + x + "," + y + "," + w + "," + h); // TESTING PRINT STATEMENT
    //Makes algorithm more likely to alternate between vertical and horizontal partition - More consistent even spread of open spaces
    splitHorizontal = splitHorizontal ? splitHorizontal = Math.random() > 0.8 : splitHorizontal = Math.random() > 0.2;
    
    //Exits if max depth reached OR if width/height is less than 2x+1 to ensure min room size is not too small
    if (recursions <= 0 || (w < (minGap*2 + 1) && !splitHorizontal) || (h < (minGap*2 +1) && splitHorizontal)) {
        return;
    }
    
    if (splitHorizontal) {
        const splitPosition = generateSplitPosition(y, y + h, minGap);
        // console.log(splitPosition); // TESTING PRINT STATEMENT
        for(let i = x; i < x + w; i++) {
            mapGrid[splitPosition][i] = '#';
        }
        bsp(mapGrid, x, y, w, splitPosition - y, recursions - 1);
        bsp(mapGrid, x, splitPosition + 1, w, h - (splitPosition - y) - 1, recursions - 1);
    } else {
        const splitPosition = generateSplitPosition(x, x + w, minGap);
        for(let i = y; i < y + h; i++) {
            mapGrid[i][splitPosition] = '#';

        }
        bsp(mapGrid, x, y, splitPosition - x, h, recursions - 1);
        bsp(mapGrid, splitPosition + 1, y, w - (splitPosition - x) - 1, h, recursions - 1);

    }
}

//TESTING SETUP - Generates 50 random BSP maps
for(let j = 0; j < 50; j++){
    const mapGrid = Array.from({length: height}, () => Array.from({length: width}, () => '_'));

    bsp(mapGrid, 0, 0, width, height, maxDepth);

    for (let i = 0; i < height; i++) {
        // Join the elements in the row to form a string representation
        const rowString = mapGrid[i].join(' ');
        
        // Print the row
        console.log(`${rowString}`);
    }
    console.log("");
    console.log("");
}