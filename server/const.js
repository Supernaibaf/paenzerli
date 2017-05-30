/**
 * Created by reiem on 13.05.2017.
 */

exports.MAX_PLAYERS = 4;
exports.MIN_PLAYERS = 2;
exports.MAX_TIME_DELAY = 1;
exports.MAX_FIRE_TIME = 21000;
exports.WIDTH = 1600;
exports.HEIGHT = 1040;
exports.MAX_STRENGTH = 80;
exports.DEFAULT_STRENGTH = 40;
exports.ACCELERATION = 50;
exports.PIXEL_PER_METER = 25;
exports.CANNONBALL_RADIUS = 4;
exports.DELTA_Y = -12;
exports.MAX_DRIVE_DISTANCE = 50;
exports.DEFAULT_WEAPON = "waffle_belgian";
exports.WEAPONS = {
    "waffle_belgian": {
        "name": "Belgischi Wafflä",
        "strength": 5,
        "empty": null,
        "defaultAmount": 10000000
    }, "waffle_heart": {
        "name": "Härzwaffle",
        "strength": 10,
        "empty": "waffle_belgian",
        "defaultAmount": 10
    }, "waffle_neapolitan": {
        "name": "Neapolitanischi Wafflä",
        "strength": 20,
        "empty": "waffle_heart",
        "defaultAmount": 3
    }, "waffle_iron": {
        "name": "Waffälisä",
        "strength": 50,
        "empty": "waffle_neapolitan",
        "defaultAmount": 1
    }
};
exports.LANDSCAPES = [
    {
        "name": "desert",
        "randomSize": 50,
        "topDistance": 950,
        "degreesOfFreedom": 2,
        "randomPointDistance": 400,
        "color": "#ffdf4d"
    }, {
        "name": "green",
        "randomSize": 400,
        "topDistance": 500,
        "degreesOfFreedom": 10,
        "randomPointDistance": 100,
        "color": "#0b9600"
    }, {
        "name": "ice",
        "randomSize": 600,
        "topDistance": 300,
        "degreesOfFreedom": 20,
        "randomPointDistance": 20,
        "color": "#ffffff"
    }
];
