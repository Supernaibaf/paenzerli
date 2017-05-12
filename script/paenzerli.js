/**
 * Created by reiem on 01.05.2017.
 */

const FPS = 30;
const WIDTH = 1600;
const HEIGHT = 1040;
const CANNONBALL_RADIUS = 4;
const BACKGROUND_COLOR = "#67c8ff";
const ACCELERATION = 2;
//const STRENGTH_RADIUS = 400;
const MAX_STRENGTH = 70;
const COLOR_OPPONENT = "#000000";
const COLOR_SHOT = "#ff9900";
const MY_COLOR = "#00ff00";
const MAX_TIME = 20000;


let startWindow;
let startButton;
let startTime;
let startText;
let startWait;
let endButton;
let endRank;
let playground;
let strengthbox;
let strengthSlider;
let playgroundContext;
let weaponChoose;
let timeLine;

let game;
let myTank;
let allTanks = [];
let rank;

let weaponChooseVisible = false;
let playgroundDown = false;
let strengthSliderDown = false;
let timerInterval = null;
let timerValue = 100;

let windowScale = 1;

let wind = 30;

const initialize = function initialize() {
    startWindow = document.body.querySelector("#start-window");
    startButton = document.body.querySelector("#start-button");
    startTime = document.body.querySelector("#start-time");
    startText = document.body.querySelector("#start-countdown");
    startWait = document.body.querySelector("#start-waiting");
    endButton = document.body.querySelector("#end-button");
    endRank = document.body.querySelector("#end-rank");
    timeLine = document.body.querySelector("#time-line > span");

    startButton.addEventListener("click", initiateStart);
    endButton.addEventListener("click", initiateWelcome);
    window.addEventListener("resize", playgroundResize);
    playground = document.body.querySelector("#playground");
    strengthbox = document.body.querySelector("#strength");
    strengthSlider = document.body.querySelector("#strength > span");

    weaponChoose = document.body.querySelector("#weapon-choose");
    playground.width = WIDTH;
    playground.height = HEIGHT;
    if (playground.getContext) {
        playgroundContext = playground.getContext("2d");
    }
    playgroundResize();
    initiateWelcome();
};

const initiateWelcome = function initiateWelcome() {
    playgroundContext.clearRect(0, 0, WIDTH, HEIGHT);
    startButton.style.display = "inline-block";
    endRank.style.display = "none";
    endButton.style.display = "none";
};

const initiateStart = function initiateStart() {
    startButton.style.display = "none";
    startWait.style.display = "block";
    initiateGame();
};

const startRound = function startRound() {
    let counter = 5;
    startWait.style.display = "none";
    startText.style.display = "block";
    startTime.innerHTML = counter;
    let countdownInterval = setInterval(function() {
        counter--;
        startTime.innerHTML = counter;
        if (counter == 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
};

const startGame = function startGame(gameObject) {
    playgroundContext.clearRect(0, 0, WIDTH, HEIGHT);
    allTanks = [];
    game = gameObject;
    drawLandscape(game.landscape);
    rank = game.alltanks.length;
    for (let i = 0; i < game.alltanks.length; i++) {
        let newTank = addTank(game.landscape.lambdas, playgroundContext, game.alltanks[i]);
        if (i == game.mytank) {
            myTank = newTank;
            myTank.setMainTank(document.body.querySelector("#strength > span"));
        } else {

        }
        newTank.draw();
    }
    document.addEventListener("mousedown", mousedown);
    document.addEventListener("touchstart", touchstart);
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("touchend", touchend);
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("touchmove", touchmove);
    window.addEventListener("keydown", keyDown);
    document.body.querySelector("button[name=fire]").addEventListener("click", fireClick);
    document.body.querySelector("button[name=weapon]").addEventListener("click", weaponClick);
    document.body.querySelector("button[name=fire]").removeAttribute("disabled");
    document.body.querySelector("button[name=weapon]").removeAttribute("disabled");
    startWindow.style.height = 0;
    startTimer();
};

const finishMyGame = function finishMyGame() {
    eventEmit("end");
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
};

const endGame = function endGame() {
    let rankText;
    switch (myTank.getRank()) {
        case null:
            rankText = "Winner";
            finishMyGame();
            break;
        case 2:
            rankText = "Loser";
            break;
        case 3:
            rankText = "Loser";
            break;
        default:
            rankText = "Loser";
            break;
    }
    startWait.style.display = "none";
    startText.style.display = "none";
    startButton.style.display = "none";
    endRank.style.display = "block";
    endButton.style.display = "inline-block";
    endRank.innerHTML = rankText;
    startWindow.style.height = "100%";
};

class Tank {
    constructor(id, lambdas, context, posX, angle) {
        this.id = id;
        this.x = (posX === undefined) ? Math.random() * (WIDTH - 30) + 15 : posX;
        this.y = calculateLandscapePoint(this.x, lambdas) - 16;
        this.angle = (angle === undefined) ? Math.random() * Math.PI : angle;
        this.color = COLOR_OPPONENT;
        this.mainColor = COLOR_OPPONENT;
        this.shotColor = COLOR_SHOT;
        this.life = 100;
        this.rank = null;
        this.lambdas = lambdas;
        this.cannonballInterval = null;
        this.cannonballX = this.x;
        this.cannonballY = this.y;
        this.cannonballSpeedVertical = 0;
        this.cannonballSpeedHorizontal = 0;
        this.context = context;
        this.isMainTank = false;
        this.isDead = false;
        this.setStrength(30);
    }

    setShot() {
        this.color = this.shotColor;
        this.draw();
    }

    resetShot() {
        this.color = this.mainColor;
        this.draw();
    }

    setMainTank(strengthBar) {
        this.color = MY_COLOR;
        this.shotColor = MY_COLOR;
        this.mainColor = MY_COLOR;
        this.isMainTank = true;
        this.strengthBar = strengthBar;
        this.setStrength(this.strength);
    }

    tankHit(life) {
        if (this.life > 0) {
            this.life -= life;
            this.draw();
        }
        if (this.life <= 0 && !this.isDead) {
            this.setDead();
            this.animateDead();
        }
    }

    setDead() {
        this.isDead = true;
        if (this.isMainTank && this.rank === null) {
            finishMyGame();
        }
        this.rank = rank;
        if (rank == 2) {
            endGame();
        }
        rank--;
    }

    getRank() {
        return this.rank;
    }

    animateDead() {
        let animationRadius = 0;
        let animationInterval = setInterval((function() {
            animationRadius += 2;
            this.context.beginPath();
            this.context.arc(this.x, this.y, animationRadius, 0, 2 * Math.PI);
            this.context.fillStyle = BACKGROUND_COLOR;
            this.context.closePath();
            this.context.fill();
            if (animationRadius >= 28) {
                clearInterval(animationInterval);
            }
        }).bind(this), 1000 / FPS);
    }

    draw() {
        if (this.isDead) {

        } else {
            let pipeEndX = 24 * Math.cos(this.angle);
            let pipeEndY = -24 * Math.sin(this.angle);
            let lifeWidth = (36 / 100) * this.life - 18;
            this.context.beginPath();
            this.context.rect(this.x - 25, this.y - 25, 50, 30);
            this.context.fillStyle = BACKGROUND_COLOR;
            this.context.fill();
            this.context.beginPath();
            this.context.lineTo(this.x, this.y);
            this.context.lineTo(this.x + pipeEndX, this.y + pipeEndY);
            this.context.strokeStyle = "#000000";
            this.context.lineWidth = 8;
            this.context.stroke();
            this.context.beginPath();
            this.context.arc(this.x, this.y, 12, 0, 2 * Math.PI);
            this.context.fillStyle = this.color;
            this.context.closePath();
            this.context.fill();
            this.context.beginPath();
            this.context.lineTo(this.x, this.y);
            this.context.lineTo(this.x + 18, this.y);
            this.context.lineTo(this.x + 24, this.y + 6);
            this.context.lineTo(this.x + 24, this.y + 12);
            this.context.lineTo(this.x + 18, this.y + 18);
            this.context.lineTo(this.x - 18, this.y + 18);
            this.context.lineTo(this.x - 24, this.y + 12);
            this.context.lineTo(this.x - 24, this.y + 6);
            this.context.lineTo(this.x - 18, this.y);
            this.context.lineTo(this.x, this.y);
            this.context.closePath();
            this.context.fillStyle = "#555555";
            this.context.fill();
            this.context.beginPath();
            this.context.lineTo(this.x - 18, this.y + 6);
            this.context.lineTo(this.x + lifeWidth, this.y + 6);
            this.context.lineTo(this.x + lifeWidth, this.y + 12);
            this.context.lineTo(this.x - 18, this.y + 12);
            this.context.closePath();
            this.context.fillStyle = "#ff0000";
            this.context.fill();
        }
    }

    setCannonball() {
        let oldCannonballX = this.cannonballX;

        this.clearCannonball();
        this.cannonballSpeedVertical -= ACCELERATION;
        this.cannonballSpeedHorizontal +=
            (Math.abs(this.cannonballSpeedHorizontal) >= Math.abs(wind)) ? 0 : wind / 100;
        this.cannonballX += this.cannonballSpeedHorizontal;
        this.cannonballY -= this.cannonballSpeedVertical;
        let floor = calculateLandscapePoint(this.cannonballX, this.lambdas);

        if(floor - this.cannonballY <= 40 && checkAllTanksForHit(this.cannonballX)) {
            window.clearInterval(this.cannonballInterval);
            this.cannonballInterval = null;
        } else if (this.cannonballX < 0 || this.cannonballX > WIDTH) {
            window.clearInterval(this.cannonballInterval);
            this.cannonballInterval = null;
        } else if (this.cannonballY >= floor) {
            this.cannonballX = (this.cannonballX + oldCannonballX) / 2;
            this.cannonballY =
                calculateLandscapePoint(this.cannonballX, this.lambdas);
            window.clearInterval(this.cannonballInterval);
            this.cannonballInterval = null;
        } else {
            this.drawCannonball();
        }
    }

    drawCannonball() {
        this.context.beginPath();
        this.context.arc(this.cannonballX, this.cannonballY, CANNONBALL_RADIUS, 0, 2 * Math.PI);
        this.context.fillStyle = "#ffff00";

        this.context.fill();
    }

    clearCannonball() {
        this.context.beginPath();
        this.context.arc(this.cannonballX, this.cannonballY, CANNONBALL_RADIUS + 1, 0, 2 * Math.PI);
        this.context.fillStyle = BACKGROUND_COLOR;
        this.context.fill();
    }

    fire() {
        if (this.cannonballInterval === null && !this.isDead) {
            this.cannonballX = this.x + (25 + CANNONBALL_RADIUS) * Math.cos(this.angle);
            this.cannonballY = this.y - (25 + CANNONBALL_RADIUS) * Math.sin(this.angle);
            this.cannonballSpeedVertical = this.strengthY;
            this.cannonballSpeedHorizontal = this.strengthX;
            this.cannonballInterval = window.setInterval(this.setCannonball.bind(this), 1000 / FPS);
        }
    }

    checkForHit(posX) {
        return (posX <= this.x + 24 && posX >= this.x - 24);
    }

    setStrength(strength, operator) {
        if (operator === undefined) {
            this.strength = strength;
        } else if (operator === "add") {
            this.strength += strength;
        } else if (operator === "sub") {
            this.strength -= strength;
        }
        if (this.strength > MAX_STRENGTH) {
            this.strength = MAX_STRENGTH;
        } else if (this.strength < 0) {
            this.strength = 0;
        }
        this.strengthX = this.strength * Math.cos(this.angle);
        this.strengthY = this.strength * Math.sin(this.angle);
        if (this.isMainTank) {
            this.strengthBar.style.left = (100 * this.strength / MAX_STRENGTH) + "%";
        }
    }

    setAngle(angle, operator) {
        if (operator === undefined) {
            this.angle = angle;
        } else if (operator === "add") {
            this.angle += angle;
        } else if (operator === "sub") {
            this.angle -= angle;
        }
        if (this.angle > Math.PI) {
            this.angle = Math.PI;
        } else if (this.angle < 0) {
            this.angle = 0;
        }
        this.setStrength(this.strength);
        this.draw();
    }

    followMouse(mouseX, mouseY) {
        let distX = mouseX - this.x;
        let distY = mouseY - this.y;
        //let dist = Math.sqrt(distX * distX + distY * distY);
        //let strength = (dist >= STRENGTH_RADIUS) ? MAX_STRENGTH : (dist / STRENGTH_RADIUS) * MAX_STRENGTH;
        if (mouseY >= this.y) {
            if (mouseX >= this.x) {
                this.angle = 0;
            } else {
                this.angle = Math.PI;
            }
        } else {
            if (mouseX >= this.x) {
                this.angle = -Math.atan(distY / distX);
            } else {
                this.angle = Math.PI - Math.atan(distY / distX);
            }
        }
        this.setStrength(this.strength);
        this.draw();
    }

    toObject() {
        return {
            id: this.id,
            color: this.color,
            angle: this.angle,
            strength: this.strength,
            x: this.x
        };
    }
}

const checkAllTanksForHit = function checkAllTanksForHit(cannonballX) {
    let hit = false;
    for (let i = 0; i < allTanks.length; i++) {
        if (allTanks[i].checkForHit(cannonballX)) {
            allTanks[i].tankHit(10);
            allTanks[i].draw();
            hit = true;
        }
    }
    return hit;
};

const fireClick = function fireClick() {
    let gameObject = {
        id: game.gameid,
        tank: myTank.toObject()
    };
    stopTimer();
    eventEmit("fire", gameObject);
};

const opponentShotFired = function (tank) {
    allTanks[tank.id].setShot();
};

const weaponClick = function weaponClick() {
    if (weaponChooseVisible) {
        weaponChoose.style.height = 0;
        weaponChoose.style.width = 0;
        weaponChoose.style.top = "90%";
        weaponChoose.style.left = "100%";
        document.body.querySelector("button[name=fire]").removeAttribute("disabled");

    } else {
        weaponChoose.style.height = "90%";
        weaponChoose.style.width = "100%";
        weaponChoose.style.top = 0;
        weaponChoose.style.left = 0;
        document.body.querySelector("button[name=fire]").setAttribute("disabled", "disabled");
    }
    weaponChooseVisible = !weaponChooseVisible;
};

const fire = function fire(tank) {
    allTanks[tank.id].setAngle(tank.angle);
    allTanks[tank.id].setStrength(tank.strength);
    allTanks[tank.id].fire();
    allTanks[tank.id].resetShot();
    startTimer();
};

const startTimer = function () {
    clearInterval(timerInterval);
    timeLine.style.width = "100%";
    timeLine.style.display = "block";
    timerValue = 100;
    timerInterval = setInterval(timerTrigger, 33);
};

const stopTimer = function() {
    timeLine.style.display = "none";
    clearInterval(timerInterval);
};

const timerTrigger = function() {
    timerValue -= (100 / 20000) * 33;
    timeLine.style.width = timerValue + "%";
    if (timerValue <= 0) {
        clearInterval(timerInterval);
    }
};

const inputmove = function inputmove(clientX, clientY, e) {
    if (playgroundDown) {
        let viewportOffset = playground.getBoundingClientRect();
        let mouseX = ((clientX - viewportOffset.left) / playground.clientWidth) * WIDTH;
        let mouseY = ((clientY - viewportOffset.top) / playground.clientHeight) * HEIGHT;
        myTank.followMouse(mouseX, mouseY);
        if (e !== undefined) {
            e.preventDefault();
        }
    } else if (strengthSliderDown) {
        let viewportOffset = strengthSlider.parentElement.getBoundingClientRect();
        let mouseX = clientX - viewportOffset.left;

        let strength;
        if (mouseX <= 0) {
            strengthSlider.style.left = "0";
            strength = 0;
        } else if (mouseX >= viewportOffset.width) {
            strengthSlider.style.left = "100%";
            strength = MAX_STRENGTH;
        } else {
            strengthSlider.style.left = (100 * mouseX / viewportOffset.width) + "%";
            strength = (mouseX / viewportOffset.width) * MAX_STRENGTH;
        }
        myTank.setStrength(strength);
        if (e !== undefined) {
            e.preventDefault();
        }
    }
};

const touchmove = function touchmove(e) {
    if (e.touches.length == 1) {
        inputmove(e.touches[0].clientX, e.touches[0].clientY, e);
    }
};

const mousemove = function mousemove(e) {
    inputmove(e.clientX, e.clientY);
};

const inputdown = function inputdown(target, clientX) {
    if (target == playground) {
        playgroundDown = true;
    } else if (target == strengthSlider) {
        strengthSliderDown = true;
    } else if (target == strengthbox) {
        strengthSliderDown = true;
        let viewportOffset = strengthbox.getBoundingClientRect();
        let mouseX = clientX - viewportOffset.left;

        let strength;

        strengthSlider.style.left = (100 * mouseX / viewportOffset.width) + "%";
        strength = (mouseX / viewportOffset.width) * MAX_STRENGTH;
        myTank.setStrength(strength);
    }
};

const touchstart = function touchstart(e) {
    inputdown(e.touches[0].target, e.touches[0].clientX, e.touches[0].clientY);
};

const mousedown = function mousedown(e) {
    inputdown(e.target, e.clientX, e.clientY);
};

const inputup = function inputup() {
    if (playgroundDown) {
        let gameObject = {
            id: game.gameid,
            tank: myTank.toObject()
        };
        eventEmit("angle", gameObject);
    }
    playgroundDown = false;
    strengthSliderDown = false;
};

const mouseup = function mouseup() {
    inputup();
};

const touchend = function touchend() {
    inputup();
};

const changeAngle = function changeAngle(tank) {
    allTanks[tank.id].setAngle(tank.angle);
    allTanks[tank.id].setStrength(tank.strength);
};

const addTank = function addTank(lambdas, context, tankObject) {
    let newTank = new Tank(tankObject.id, lambdas, context, tankObject.x, tankObject.angle, tankObject.color);
    allTanks.push(newTank);
    return newTank;
};

const drawLandscape = function drawLandscape(landscape) {
    playgroundContext.fillStyle = landscape.color;
    playgroundContext.beginPath();
    for (let i = 0; i <= WIDTH; i += 10) {
        playgroundContext.lineTo(i, calculateLandscapePoint(i, landscape.lambdas));
    }
    playgroundContext.lineTo(WIDTH, HEIGHT);
    playgroundContext.lineTo(0, HEIGHT);
    playgroundContext.closePath();
    playgroundContext.fill();
};

const calculateLandscapePoint = function calculateLandscapePoint(x, lambdas) {
    let sum = 0;
    for (let i = 0; i < lambdas.length; i++) {
        sum += lambdas[i] * Math.pow(x, i);
    }
    return sum;
};

const keyDown = function keyDown(e) {
    switch (e.keyCode) {
        case 32:
            fireClick();
            break;
        case 37:
            myTank.setAngle(.1, "add");
            break;
        case 38:
            myTank.setStrength(2, "add");
            break;
        case 39:
            myTank.setAngle(.1, "sub");
            break;
        case 40:
            myTank.setStrength(2, "sub");
            break;
    }
};

const playgroundResize = function playgroundResize() {
    windowScale = playground.clientHeight / HEIGHT;
};

window.addEventListener("load", initialize);
