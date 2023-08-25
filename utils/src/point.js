class Point {
    #x;
    #y;

    constructor(x, y) {
        if (!Number.isInteger(x) || !Number.isInteger(y)) throw new Error('Invalid point provided.');
        this.#x = x;
        this.#y = y;
    }

    static isPositivePoint(point) { return point instanceof Point && point.getX() > 0 && point.getY() > 0; }

    add(point) {
        if (!(point instanceof Point)) throw new Error('Invalid point provided.');
        return new Point(this.#x + point.getX(), this.#y + point.getY());
    }

    subtract(point) {
        if (!(point instanceof Point)) throw new Error('Invalid point provided.');
        return new Point(this.#x - point.getX(), this.#y - point.getY());
    }

    setX(x) { 
        if (!Number.isInteger(x)) throw new Error('Invalid X coordinate provided.');
        this.#x = x; 
    }
    setY(y) {
        if (!Number.isInteger(y)) throw new Error('Invalid Y coordinate provided.');
        this.#y = y;
    }

    getX() { return this.#x; }
    getY() { return this.#y; }

    toString() { return this.#x + "," + this.#y; }

    clone() { return new Point(this.#x, this.#y); }
}

module.exports = Point;
