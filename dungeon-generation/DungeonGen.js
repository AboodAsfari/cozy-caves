let height = 50;
let width = 50;
const mapGrid = Array.from({length: height}, () => Array.from({length: width}, () => 0));

function bsp(mapGrid, x, y, w, h, recursions) {
    if (recursions <= 0) {
        return;
    }

    const splitHorizontal = Math.random() > 0.5;

    if (splitHorizontal) {
        const splitPosition = Math.floor(Math.random() * (h - 2)) + 1 + y;
        for(let i = x; i < x + w; i++) {
            mapGrid[splitPosition][i] = 1;
        }
        bsp(mapGrid, x, y, w, splitPosition - y, recursions - 1);
        bsp(mapGrid, x, splitPosition + 1, w, h - (splitPosition - y) - 1, recursions - 1);
    } else {
        const splitPosition = Math.floor(Math.random() * (w - 2)) + 1 + x;
        for(let i = x; i < x + w; i++) {
            mapGrid[i][splitPosition] = 1;
            
        }
        bsp(mapGrid, x, y, splitPosition - x, h, recursions - 1);
        bsp(mapGrid, splitPosition + 1, y, w - (splitPosition - x) - 1, h, recursions - 1);

    }
}

bsp(mapGrid, 0, 0, width, height, 4);

for (let i = 0; i < height; i++) {
    // Join the elements in the row to form a string representation
    const rowString = mapGrid[i].join(', ');

    // Print the row
    console.log(`${rowString}`);
  }
