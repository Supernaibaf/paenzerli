/**
 * Created by reiem on 13.05.2017.
 */
// game constants
const FPS = 30;
const WIDTH = 1600;
const HEIGHT = 1040;
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

// elements
let gameWindow;
let startWindow;
let startButton;
let startTime;
let startCountdown;
let startWait;
let endButton;
let endRank;
let weaponElements;
let weaponDisplay;
let playground;
let strengthbox;
let strengthSlider;
let playgroundContext;
let weaponChoose;
let timeLine;

// states
let weaponChooseVisible = false;

// timer
let timerInterval;

// gui
let landscape = null;
let allTanks = {};
let myTank;

const initializeElements = function initializeElements() {
    gameWindow = document.body.querySelector("#game-window");
    startWindow = document.body.querySelector("#start-window");
    startButton = document.body.querySelector("#start-button");
    startTime = document.body.querySelector("#start-time");
    startCountdown = document.body.querySelector("#start-countdown");
    startWait = document.body.querySelector("#start-waiting");
    endButton = document.body.querySelector("#end-button");
    endRank = document.body.querySelector("#end-rank");
    timeLine = document.body.querySelector("#time-line > span");
    weaponElements = document.body.querySelectorAll("#weapon-choose > section > article");
    weaponDisplay = document.body.querySelector("#weapon-display");
    strengthbox = document.body.querySelector("#strength");
    strengthSlider = document.body.querySelector("#strength > span");
    weaponChoose = document.body.querySelector("#weapon-choose");
    playground = document.body.querySelector("#playground");
    playground.width = WIDTH;
    playground.height = HEIGHT;
    if (playground.getContext) {
        playgroundContext = playground.getContext("2d");
    }
    disableGameInteraction();
};

const enableGameInteraction = function enableGameInteraction() {
    document.addEventListener("mousedown", mousedown);
    document.addEventListener("touchstart", touchstart);
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("touchend", touchend);
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("touchmove", touchmove);
    document.body.querySelector("button[name=fire]").addEventListener("click", fireClick);
    document.body.querySelector("button[name=weapon]").addEventListener("click", weaponClick);
    document.body.querySelector("button[name=fire]").removeAttribute("disabled");
    document.body.querySelector("button[name=weapon]").removeAttribute("disabled");
    for (let i = 0; i < weaponElements.length; i++) {
        weaponElements[i].addEventListener("click", weaponElementClick);
    }
    window.addEventListener("keydown", keyDown);
};

const disableGameInteraction = function disableGameInteraction() {
    document.removeEventListener("mousedown", mousedown);
    document.removeEventListener("touchstart", touchstart);
    document.removeEventListener("mouseup", mouseup);
    document.removeEventListener("touchend", touchend);
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("touchmove", touchmove);
    window.removeEventListener("keydown", keyDown);
    document.body.querySelector("button[name=fire]").removeEventListener("click", fireClick);
    document.body.querySelector("button[name=weapon]").removeEventListener("click", weaponClick);
    document.body.querySelector("button[name=fire]").setAttribute("disabled", "disabled");
    document.body.querySelector("button[name=weapon]").setAttribute("disabled", "disabled");
    for (let i = 0; i < weaponElements.length; i++) {
        weaponElements[i].removeEventListener("click", weaponElementClick);
    }
};

const initiateWelcome = function initiateWelcome() {
    stopTimer();
    playgroundContext.clearRect(0, 0, WIDTH, HEIGHT);
    startButton.style.display = "inline-block";
    startButton.addEventListener("click", initiateStart);
    hideElement(startWait);
    hideElement(startCountdown);
    hideElement(endButton);
    hideElement(endRank);
    hideElement(timeLine);
    startWindow.style.height = "100%";
    gameWindow.style.filter = "blur(10px)";
    endButton.removeEventListener("click", initiateWelcome);
};

const initiateStartGame = function initiateStartGame() {
    gameEnd = null;
    drawLandscape(landscape);
    for (let key in allTanks) {
        allTanks[key].draw();
    }
    enableGameInteraction();
    hideAll();
    startTimer();
    gameWindow.style.filter = "none";
    startWindow.style.height = 0;
    document.querySelector("#game-window > nav").style.backgroundColor = landscape.color;
    document.body.style.backgroundColor = shadeColor(landscape.color, -0.4);
    setActiveWeapon(DEFAULT_WEAPON);
};

const shadeColor = function shadeColor(color, percent) {
    let f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
};

const setActiveWeapon = function setActiveWeapon(index) {
    if (myTank.getAmounts()[index] <= 0) {
        setActiveWeapon(WEAPONS[index].empty);
    } else {
        myTank.setWeapon(index);
        for (let i = 0; i < weaponElements.length; i++) {
            if (weaponElements[i].id == index) {
                weaponElements[i].className = "active";
            } else {
                weaponElements[i].className = "";
            }
        }
        fillWeaponAmounts();
    }
};

const fillWeaponAmounts = function fillWeaponAmounts() {
    let amounts = myTank.getAmounts();
    weaponDisplay.getElementsByTagName("span")[0].innerHTML = (amounts[myTank.getWeapon()] > 1000) ? "&#8734;" : amounts[myTank.getWeapon()];
    weaponDisplay.className = myTank.getWeapon();
    for (let key in amounts) {
        if (amounts.hasOwnProperty(key)) {
            let weaponElement = document.getElementById(key);
            weaponElement.getElementsByClassName("amount")[0].innerHTML = (amounts[key] > 1000) ? "&#8734;" : amounts[key];
        }
    }
};

const initiateStart = function initiateStart() {
    gameEnd = null;
    stopTimer();
    startWait.style.display = "block";
    hideElement(startButton);
    hideElement(startCountdown);
    hideElement(endButton);
    hideElement(endRank);
    hideElement(timeLine);
    startButton.removeEventListener("click", initiateStart);
    endButton.removeEventListener("click", initiateWelcome);
    gameWindow.style.filter = "blur(10px)";
    startWindow.style.height = "100%";
    sendStart();
};

const initiateEnd = function initiateEnd(rank) {
    gameEnd = null;
    stopTimer();
    let resultText = "";
    switch(rank) {
        case 1:
            resultText = "Du bisch erschtä wordä";
            break;
        case 2:
            resultText = "Du bisch zweitä wordä";
            break;
        case 3:
            resultText = "Du bisch drittä wordä";
            break;
        default:
            resultText = "Du bisch letschtä wordä";
            break;
    }
    endRank.innerHTML = resultText;
    endRank.style.display = "block";
    endButton.style.display = "inline-block";
    hideElement(startButton);
    hideElement(startCountdown);
    hideElement(startWait);
    hideElement(timeLine);
    startButton.removeEventListener("click", initiateStart);
    endButton.addEventListener("click", initiateWelcome);
    gameWindow.style.filter = "blur(10px)";
    startWindow.style.height = "100%";
};

const startTimer = function startTimer() {
    timeLine.style.background = "#3c5b85";
    clearInterval(timerInterval);
    let startTime = Date.now();
    timerInterval = setInterval(function() {
        let time = Date.now() - startTime;
        let value = 100 - (100 / MAX_FIRE_TIME * time);
        if (value <= 0) {
            clearInterval(timerInterval);
        } else {
            timeLine.style.width = value + "%";
        }
    }, 33);
    timeLine.style.display = "block";
};

const stopTimer = function stopTimer() {
    clearInterval(timerInterval);
    hideElement(timeLine);
};

const countdownStart = function countdownStart() {
    let countdown = 5;
    startTime.innerHTML = countdown;
    startCountdown.style.display = "block";
    let countdownInterval = setInterval(function() {
        countdown--;
        startTime.innerHTML = countdown;
        if (countdown == 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
};

const initiateRound = function initiateRound() {
    hideElement(startButton);
    hideElement(startWait);
    hideElement(endButton);
    hideElement(endRank);
    hideElement(timeLine);
    startButton.removeEventListener("click", initiateStart);
    endButton.removeEventListener("click", initiateWelcome);
    startWindow.style.height = "100%";
    countdownStart();
};

const drawLandscape = function drawLandscape(landscape) {
    playgroundContext.fillStyle = landscape.color;
    playgroundContext.beginPath();
    for (let i = 0; i <= WIDTH; i += 10) {
        playgroundContext.lineTo(i, landscape.points[i / 10]);
    }
    playgroundContext.lineTo(WIDTH, HEIGHT);
    playgroundContext.lineTo(0, HEIGHT);
    playgroundContext.closePath();
    playgroundContext.fill();
};

const redrawPlayground = function redrawPlayground() {
    playgroundContext.clearRect(0, 0, WIDTH, HEIGHT);
    drawLandscape(landscape);
    drawTanks();
};

const drawTanks = function drawTanks() {
    for (let key in allTanks) {
        if (allTanks.hasOwnProperty(key)) {
            allTanks[key].draw();
        }
    }
};

const showWeapons = function showWeapons() {
    weaponChoose.style.height = "90%";
    weaponChoose.style.width = "100%";
    weaponChoose.style.top = 0;
    weaponChoose.style.left = 0;
    document.body.querySelector("button[name=fire]").setAttribute("disabled", "disabled");
    weaponChooseVisible = true;
};

const hideWeapons = function hideWeapons() {
    weaponChoose.style.height = 0;
    weaponChoose.style.width = 0;
    weaponChoose.style.top = "90%";
    weaponChoose.style.left = "100%";
    document.body.querySelector("button[name=fire]").removeAttribute("disabled");
    weaponChooseVisible = false;
};

const hideElement = function hideElement(element) {
    element.style.display = "none";
};

const hideAll = function hideAll() {
    hideElement(startCountdown);
    hideElement(startButton);
    hideElement(startWait);
    hideElement(endButton);
    hideElement(endRank);
    hideElement(timeLine);
    startButton.removeEventListener("click", initiateStart);
    endButton.removeEventListener("click", initiateWelcome);
};
