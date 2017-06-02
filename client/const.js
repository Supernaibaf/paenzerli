/**
 * Created by reiem on 30.05.2017.
 */

const FPS = 30;
const WIDTH = 1600;
const HEIGHT = 810;
const MAX_FIRE_TIME = 20000;
const CANNONBALL_RADIUS = 4;
const ACCELERATION = 50;
const PIXEL_PER_METER = 25;
const MAX_STRENGTH = 80;
const BACKGROUND_COLOR = "#67c8ff";
const COLOR_OPPONENT = "#000000";
const COLOR_SHOT = "#ff9900";
const MY_COLOR = "#00ff00";
const MAX_LIFE = 100;
const DELTA_Y = -12;
const MAX_DRIVE_DISTANCE = 50;
const DEFAULT_WEAPON = "waffle_belgian";
const WEAPONS = {
    "waffle_belgian": {
        "name": "Belgischi Wafflä",
        "strength": 5,
        "empty": null,
        "color": "#feff00",
        "img": "../images/waffle_belgian.png",
        "defaultAmount": 10000000
    }, "waffle_heart": {
        "name": "Härzwaffle",
        "strength": 10,
        "empty": "waffle_belgian",
        "color": "#ff0d75",
        "img": "../images/waffle_heart.png",
        "defaultAmount": 10
    }, "waffle_neapolitan": {
        "name": "Neapolitanischi Wafflä",
        "strength": 20,
        "empty": "waffle_heart",
        "color": "#b76333",
        "img": "../images/waffle_neapolitan.png",
        "defaultAmount": 3
    }, "waffle_iron": {
        "name": "Waffälisä",
        "strength": 50,
        "empty": "waffle_neapolitan",
        "color": "#323232",
        "img": "../images/waffle_iron.png",
        "defaultAmount": 1
    }
};
