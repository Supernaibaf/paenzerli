/**
 * Created by reiem on 01.05.2017.
 */

const FPS = 30;
const WIDTH = 1600;
const HEIGHT = 1040;
const CANNONBALL_RADIUS = 4;
const BACKGROUND_COLOR = "#67c8ff";
const ACCELERATION = 2;
const STRENGTH_RADIUS = 400;
const MAX_STRENGTH = 70;
const LANDSCAPES = [
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

let game = null;

let startWindow;
let startButton;
let startTime;
let startText;
let startWait;
let playground;
let strengthbox;
let strengthSlider;
let playgroundContext;
let weaponChoose;

let myTank;
let allTanks = [];

let weaponChooseVisible = false;
let playgroundDown = false;
let strengthSliderDown = false;

let windowScale = 1;
let landscapeLambdas = [];
let currentLandscape = 0;

let sideSpeed = 5;
let cannonball;
let cannonballInterval = null;
let cannonballX = 0;
let cannonballY = 0;
let acceleration = 2;
let wind = 30;
let speed = 0;

const initialize = function initialize() {
    startWindow = document.body.querySelector("#start-window");
    startButton = document.body.querySelector("#start-button");
    startTime = document.body.querySelector("#start-time");
    startText = document.body.querySelector("#start-countdown");
    startWait = document.body.querySelector("#start-waiting");

    startButton.addEventListener("click", initiateStart);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("resize", playgroundResize);
    document.body.querySelector("button[name=fire]").addEventListener("click", fireClick);
    document.body.querySelector("button[name=weapon]").addEventListener("click", weaponClick);
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
};

const initiateStart = function initiateStart() {
    startButton.style.display = "none";
    startWait.style.display = "inline-block";
    initiateGame();
};

const startRound = function startRound() {
    let counter = 5;
    startWait.style.display = "none";
    startText.style.display = "inline-block";
    startTime.innerHTML = counter;
    let countdownInterval = setInterval(function() {
        counter--;
        startTime.innerHTML = counter;
        if (counter == 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
};

class Tank {
    constructor(id, lambdas, context, posX, angle, color) {
        this.id = id;
        this.x = (posX === undefined) ? Math.random() * (WIDTH - 30) + 15 : posX;
        this.y = calculateLandscapePoint(this.x, lambdas) - 16;
        this.angle = (angle === undefined) ? Math.random() * Math.PI : angle;
        this.color = (color === undefined) ? '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6) : color;
        this.life = 100;
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

    setMainTank(strengthBar) {
        this.isMainTank = true;
        this.strengthBar = strengthBar;
        this.setStrength(this.strength);
    }

    tankHit(life) {
        if (this.life > 0) {
            this.life -= life;
            this.draw();
        }
        if (this.life <= 0) {
            this.setDead();
            this.animateDead();
        }
    }

    setDead() {
        this.isDead = true;
    }

    animateDead() {
        console.log("Hallo");
        let animationRadius = 0;
        let animationInterval = setInterval((function() {
            console.log("Hallo");
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
            /*for (let i = 0; i < allTanks.length; i++) {
                if (allTanks[i].checkForHit(this.cannonballX)) {
                    allTanks[i].setDead();
                    allTanks[i].draw();
                }
            }*/
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

    setStrength(strength) {
        this.strength = strength;
        this.strengthX = this.strength * Math.cos(this.angle);
        this.strengthY = this.strength * Math.sin(this.angle);
        if (this.isMainTank) {
            this.strengthBar.style.left = (100 * this.strength / MAX_STRENGTH) + "%";
        }
    }

    setAngle(angle) {
        this.angle = angle;
        this.draw();
    }

    followMouse(mouseX, mouseY) {
        let distX = mouseX - this.x;
        let distY = mouseY - this.y;
        let dist = Math.sqrt(distX * distX + distY * distY);
        let strength = (dist >= STRENGTH_RADIUS) ? MAX_STRENGTH : (dist / STRENGTH_RADIUS) * MAX_STRENGTH;
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
    for (let i = 0; i < allTanks.length; i++) {
        if (allTanks[i].checkForHit(cannonballX)) {
            allTanks[i].tankHit(10);
            allTanks[i].draw();
            return true;
        }
    }
    return false;
};

const fireClick = function fireClick() {
    myTank.fire();
    let gameObject = {
        id: game.gameid,
        tank: myTank.toObject()
    };
    eventEmit("fire", gameObject);
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
};

const cannonballFly = function cannonballFly() {
    speed -= acceleration;
    sideSpeed -= wind;
    clearCannonball(cannonballX, cannonballY);
    cannonballY -= speed;
    cannonballX += sideSpeed;
    let floor = calculateLandscapePoint(cannonballX, landscapeLambdas);
    if (cannonballY >= floor) {
        cannonballY = floor;
        window.clearInterval(cannonballInterval);
        cannonballInterval = null;
    }
    drawCannonball(cannonballX, cannonballY);
};

const mousemove = function mousemove(e) {
    if (playgroundDown) {
        let viewportOffset = playground.getBoundingClientRect();
        let mouseX = ((e.clientX - viewportOffset.left) / playground.clientWidth) * WIDTH;
        let mouseY = ((e.clientY - viewportOffset.top) / playground.clientHeight) * HEIGHT;
        myTank.followMouse(mouseX, mouseY);
    } else if (strengthSliderDown) {
        let viewportOffset = strengthSlider.parentElement.getBoundingClientRect();
        let mouseX = e.clientX - viewportOffset.left;

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
    }
};

const mousedown = function mousedown(e) {
    if (e.target == playground) {
        playgroundDown = true;
    } else if (e.target == strengthSlider) {
        strengthSliderDown = true;
    } else if (e.target == strengthbox) {
        strengthSliderDown = true;
        let viewportOffset = strengthbox.getBoundingClientRect();
        let mouseX = e.clientX - viewportOffset.left;

        let strength;

        strengthSlider.style.left = (100 * mouseX / viewportOffset.width) + "%";
        strength = (mouseX / viewportOffset.width) * MAX_STRENGTH;
        myTank.setStrength(strength);
    }
};

const mouseup = function mouseup() {
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

const changeAngle = function changeAngle(tank) {
    allTanks[tank.id].setAngle(tank.angle);
    allTanks[tank.id].setStrength(tank.strength);
};

const startGame = function startGame(gameObject) {
    game = gameObject;
    drawLandscape(game.landscape);
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
    document.addEventListener("touchstart", mousedown);
    document.addEventListener("mouseup", mouseup);
    document.addEventListener("touchend", mouseup);
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("touchmove", mousemove);
    //startWindow.style.display = "none";
    startWindow.style.height = 0;
};

const addTank = function addTank(lambdas, context, tankObject) {
    let newTank = new Tank(tankObject.id, lambdas, context, tankObject.x, tankObject.angle, tankObject.color);
    allTanks.push(newTank);
    return newTank;
};

const drawCannonball = function drawCannonball(centerX, centerY) {
    playgroundContext.beginPath();
    playgroundContext.arc(centerX, centerY, CANNONBALL_RADIUS, 0, 2 * Math.PI);
    playgroundContext.fillStyle = "#ffff00";
    playgroundContext.fill();
};

const clearCannonball = function clearCannonball(centerX, centerY) {
    playgroundContext.beginPath();
    playgroundContext.arc(centerX, centerY, CANNONBALL_RADIUS + 1, 0, 2 * Math.PI);
    playgroundContext.fillStyle = BACKGROUND_COLOR;
    playgroundContext.fill();
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

};

const hideElement = function hideElement(element) {
    element.style.display = "none";
};

const showElement = function showElement(element) {
    element.style.display = "block";
};

const playgroundResize = function playgroundResize() {
    windowScale = playground.clientHeight / HEIGHT;
};

window.addEventListener("load", initialize);
