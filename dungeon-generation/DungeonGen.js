let height = 100;
let width = 100;
const mapGrid = Array.from({length: height}, () => Array.from({length: width}, () => '_'));

function bsp(mapGrid, x, y, w, h, recursions) {
    console.log(recursions + ":" + x + "," + y + "," + w + "," + h);
    if (recursions <= 0 || w < 4 || h < 4) {
        return;
    }

    const splitHorizontal = Math.random() > 0.5;

    if (splitHorizontal) {
        const splitPosition = Math.floor(Math.random() * (h - 2)) + 1 + y;
        console.log(splitPosition);
        for(let i = x; i < x + w; i++) {
            mapGrid[splitPosition][i] = '#';
        }
        bsp(mapGrid, x, y, w, splitPosition - y, recursions - 1);
        bsp(mapGrid, x, splitPosition + 1, w, h - (splitPosition - y) - 1, recursions - 1);
    } else {
        const splitPosition = Math.floor(Math.random() * (w - 2)) + 1 + x;
        for(let i = y; i < y + h; i++) {
            mapGrid[i][splitPosition] = '#';

        }
        bsp(mapGrid, x, y, splitPosition - x, h, recursions - 1);
        bsp(mapGrid, splitPosition + 1, y, w - (splitPosition - x) - 1, h, recursions - 1);

    }
}

bsp(mapGrid, 0, 0, width, height, 4);

for (let i = 0; i < height; i++) {
    // Join the elements in the row to form a string representation
    const rowString = mapGrid[i].join(' ');
    
    // Print the row
    console.log(`${rowString}`);
  }