const Point = require("../../../utils/point");

class TileSource {
    #imgSource;
    #dimensions;

    constructor(imgSource, dimensions) {
        if (!imgSource || !(dimensions instanceof Point) || dimensions.getX() <= 0 || dimensions.getY() <= 0) throw new Error('Invalid source provided.');
        this.#imgSource = imgSource;
        this.#dimensions = dimensions;
    }

    getDimensions() { return this.#dimensions; }
    getImage() { return this.#imgSource; }
}

module.exports = TileSource;
