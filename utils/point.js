class Point {
    #x;
    #y;

    constructor(x, y) {
        this.#x = x;
        this.#y = y;
    }

    static isNonZeroPoint(point) { return point instanceof Point && point.getX() > 0 && point.getY() > 0; }

    getX() { return this.#x; }
    getY() { return this.#y; }

    toString() { return this.x + "," + this.y; }
}

module.exports = Point;
