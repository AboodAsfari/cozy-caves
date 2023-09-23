const log = require("console").log;
const Point = require("@cozy-caves/utils").Point;
const RoomBuilder = require("@cozy-caves/room-generation").RoomBuilder;
const PropGenerator = require("../src/propGenerator");
const populateRoom = require("../src/propMap");
const ItemGenerator = require("../src/itemGenerator");
const PropSet = require("../src/propSet");

// test('Testing Prop Generation', () => {
//     log("TESTING PROP GENERATION\n");

//     const room = new RoomBuilder("abo").setSize(new Point(7,7)).setLeniency(new Point(0,0)).build();
//     const populatedRoom = populateRoom(room, "abo");
//     log(populatedRoom.toString());
//     log("-------------------------------");

// });

test('Testing PathName', () => {
    log("TESTING PATHNAME\n");
    const propGenerator = new PropGenerator();
    const prop = propGenerator.getPropByName("Jeweled Chest");
    expect(prop.getPathName()).toBe("jeweled_chest");
    log("-------------------------------");
});

test('Testing getItemByCategory', () => {
    log("TESTING GET ITEM BY CATEGORY\n");

    const generator = new ItemGenerator(Math.random());
    
    
    for (let i=0; i<5; i++) {
        log(generator.getItemByCategory("Potions and Elixirs").toString() + "\n");
    }
    log("-------------------------------");
});


test('Testing items by category', () => {
    log("TESTING ITEM BY CATEGORY\n");
    const generator = new ItemGenerator(Math.random());
    // get any one item from these categories, taking rarity into account
    for (let i=0; i<5; i++) {
        log(generator.getItem(["Scrolls", "Magical Items"]).toString() + "\n");
    }
    log("-------------------------------");
});

test('Testing items by name', () => {
    log("TESTING ITEM BY NAME\n");

    const generator = new ItemGenerator(Math.random());
    const item = generator.getItemByName("Scroll of Identify");
    expect(item.getName()).toBe("Scroll of Identify");
    log("-------------------------------");
});

test('Testing props by name', () => {
    log("TESTING PROP BY NAME\n");

    const generator = new PropGenerator(Math.random());
    const prop = generator.getPropByName("Glyphs");
    expect(prop.getName()).toBe("Glyphs");
    log(prop.toString());
    log(prop.rendererInfo());
    log("-------------------------------");
});

test('Testing props by set', () => {
    log("TESTING PROP BY SET\n");
    const generator = new PropGenerator(Math.random());
    for (let i=0; i<5; i++) {
        log(generator.getProp(["Table", "Chair", "Bed", "Bookshelf"]).toString() + "\n");
    }
    log("-------------------------------");
});

test('Testing get prop set', () => {
    log("TESTING GET PROP SET\n");
    const generator = new PropSet(Math.random());
    const propSet = generator.getPropSet(10);
    
    for (let p of propSet) {
        log(p.toString());
    }
    log("-------------------------------");
});

test('Testing Prop Generation', () => {
    log("TESTING PROP GENERATION\n");

    const room = new RoomBuilder(Math.random()).setSize(new Point(10,7)).setLeniency(new Point(0,0)).build();
    const propMap = populateRoom(room, Math.random());
    log(propMap.toString());
    log("-------------------------------");

});
