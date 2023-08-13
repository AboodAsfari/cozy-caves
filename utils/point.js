class Point {
    #x;
    #y;

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    getX() { return this.#x; }
    getY() { return this.#y; }

    toString() { return this.x + "," + this.y; }
}

module.exports = Point;
