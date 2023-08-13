const Point = require("../../../utils/point");

/**
 * Represents an image source / image dimensions pair.
 * 
 * @author Abdulrahman Asfari
 */
class TileSource {
    #imgSource; // String
    #dimensions;

    /**
     * Creates an instance of TileSource.
     * 
     * @constructor
     * @param imgSource String containing an image source.
     * @param dimensions Dimensions of the image.
     */
    constructor(imgSource, dimensions) {
        if (!imgSource || Point.isPositivePoint(dimensions)) throw new Error('Invalid source provided.');
        this.#imgSource = imgSource.toString();
        this.#dimensions = dimensions;
    }

    // Getters.
    getDimensions() { return this.#dimensions; }
    getImage() { return this.#imgSource; }
}

module.exports = TileSource;
