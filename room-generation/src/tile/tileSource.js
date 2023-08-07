class TileSource {
    #imgSource;
    #width;
    #height;

    constructor(imgSource, width, height) {
        if (!imgSource || this.isValid(width, height)) throw new Error('Invalid source provided.');
        this.#imgSource = imgSource;
        this.#width = width;
        this.#height = height;
    }

    isValid(width, height) { return width && height && Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0; }

    getDimensions() { return { width: this.#width, height: this.#height }; }
    getImage() { return this.#imgSource; }
}

module.exports = TileSource;
