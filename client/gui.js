/**
 * Created by reiem on 30.05.2017.
 */

const Gui = class Gui {
    constructor() {
        this.game = null;
        this.interaction = null;
    }

    initialize() {

        this.weaponChooseVisible = false;

        this.timerInterval = null;

        this.body = document.body;
        this.gameWindow = document.body.querySelector("#game-window");
        this.startWindow = document.body.querySelector("#start-window");
        this.startButton = document.body.querySelector("#start-button");
        this.startTime = document.body.querySelector("#start-time");
        this.startCountdown = document.body.querySelector("#start-countdown");
        this.startWait = document.body.querySelector("#start-waiting");
        this.endButton = document.body.querySelector("#end-button");
        this.endRank = document.body.querySelector("#end-rank");
        this.timeLine = document.body.querySelector("#time-line > span");
        this.weaponNavigation = document.querySelector("#game-window > nav");
        this.weaponElements = document.body.querySelectorAll("#weapon-choose > section > article");
        this.weaponDisplay = document.body.querySelector("#weapon-display");
        this.strengthbox = document.body.querySelector("#strength");
        this.strengthSlider = document.body.querySelector("#strength > span");
        this.weaponChoose = document.body.querySelector("#weapon-choose");
        this.playground = document.body.querySelector("#playground");
        this.playground.width = WIDTH;
        this.playground.height = HEIGHT;
        if (this.playground.getContext) {
            this.playgroundContext = this.playground.getContext("2d");
        }

        this.startButton.addEventListener("click", this.startGame.bind(this));

        this.interaction = new Interaction(this);
        this.initiateWelcome();
    }

    startTimer() {
        this.timeLine.style.background = "#3c5b85";
        clearInterval(this.timerInterval);
        let startTime = Date.now();
        this.timerInterval = setInterval((function() {
            let time = Date.now() - startTime;
            let value = 100 - (100 / MAX_FIRE_TIME * time);
            if (value <= 0) {
                clearInterval(this.timerInterval);
            } else {
                this.timeLine.style.width = value + "%";
            }
        }).bind(this), 33);
        this.timeLine.style.display = "block";
    }

    stopTimer() {
        clearInterval(this.timerInterval);
        Gui.hideElement(this.timeLine);
    }

    drawCannonball(x, y, weapon) {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            this.playgroundContext.beginPath();
            this.playgroundContext.arc(x, y, CANNONBALL_RADIUS, 0, 2 * Math.PI);
            this.playgroundContext.fillStyle = WEAPONS[weapon].color;
            this.playgroundContext.fill();
        } else {
            let img = new Image();
            img.src = WEAPONS[weapon].img;
            this.playgroundContext.drawImage(img, x - CANNONBALL_RADIUS * 3, y - CANNONBALL_RADIUS * 3, CANNONBALL_RADIUS * 6, CANNONBALL_RADIUS * 6);
        }
    }

    clearCannonball(x, y) {
        this.playgroundContext.fillStyle = BACKGROUND_COLOR;
        this.playgroundContext.fillRect(x - CANNONBALL_RADIUS * 3, y - CANNONBALL_RADIUS * 3, CANNONBALL_RADIUS * 6, CANNONBALL_RADIUS * 6);
    }

    concluded() {
        this.timeLine.style.background = "#4a8517";
    }

    static disableButtons() {
        document.body.querySelector("button[name=fire]").setAttribute("disabled", "disabled");
        document.body.querySelector("button[name=weapon]").setAttribute("disabled", "disabled");
    }

    static enableButtons() {
        document.body.querySelector("button[name=fire]").removeAttribute("disabled");
        document.body.querySelector("button[name=weapon]").removeAttribute("disabled");
    }

    getGame() {
        return this.game;
    }

    setStrengthSliderValue(value) {
        this.strengthSlider.style.left = (100 * value / MAX_STRENGTH) + "%";
    }

    setActiveWeapon(weapon, amount) {
        this.weaponDisplay.getElementsByTagName("span")[0].innerHTML = (amount >= 1000) ? "&#8734;" : amount;
        this.weaponDisplay.className = weapon;
        for (let i = 0; i < this.weaponElements.length; i++) {
            if (this.weaponElements[i].id == weapon) {
                this.weaponElements[i].className = "active";
            } else {
                this.weaponElements[i].className = "";
            }
        }
    }

    static setWeaponAmounts(amounts) {
        for (let key in amounts) {
            if (amounts.hasOwnProperty(key)) {
                let weaponElement = document.getElementById(key);
                weaponElement.getElementsByClassName("amount")[0].innerHTML = (amounts[key] > 1000) ? "&#8734;" : amounts[key];
            }
        }
    }

    showWeapons() {
        this.weaponChoose.style.height = "90%";
        this.weaponChoose.style.width = "100%";
        this.weaponChoose.style.top = 0;
        this.weaponChoose.style.left = 0;
        document.body.querySelector("button[name=fire]").setAttribute("disabled", "disabled");
        this.weaponChooseVisible = true;
    };

    hideWeapons() {
        this.weaponChoose.style.height = 0;
        this.weaponChoose.style.width = 0;
        this.weaponChoose.style.top = "90%";
        this.weaponChoose.style.left = "100%";
        document.body.querySelector("button[name=fire]").removeAttribute("disabled");
        this.weaponChooseVisible = false;
    };

    initiateWelcome() {
        this.playgroundContext.clearRect(0, 0, WIDTH, HEIGHT);
        this.startButton.style.display = "inline-block";
        this.startWindow.style.height = "100%";
        this.gameWindow.style.filter = "blur(10px)";
        Gui.hideElement(this.startWait);
        Gui.hideElement(this.startCountdown);
        Gui.hideElement(this.endButton);
        Gui.hideElement(this.endRank);
        Gui.hideElement(this.timeLine);
    };

    initiateStartGame() {
        this.hideAll();
        this.gameWindow.style.filter = "none";
        this.startWindow.style.height = 0;
    }

    initiateStart() {
        this.startWait.style.display = "block";
        this.gameWindow.style.filter = "blur(10px)";
        this.startWindow.style.height = "100%";
        Gui.hideElement(this.startButton);
        Gui.hideElement(this.startCountdown);
        Gui.hideElement(this.endButton);
        Gui.hideElement(this.endRank);
        Gui.hideElement(this.timeLine);
    }

    initiateRound() {
        this.startWindow.style.height = "100%";
        this.countdownStart();
        Gui.hideElement(this.startButton);
        Gui.hideElement(this.startWait);
        Gui.hideElement(this.endButton);
        Gui.hideElement(this.endRank);
        Gui.hideElement(this.timeLine);
    }

    initiateEnd(resultText) {
        this.endRank.innerHTML = resultText;
        this.endRank.style.display = "block";
        this.endButton.style.display = "inline-block";
        Gui.hideElement(this.startButton);
        Gui.hideElement(this.startCountdown);
        Gui.hideElement(this.startWait);
        Gui.hideElement(this.timeLine);
        this.startButton.removeEventListener("click", this.initiateStart.bind(this));
        this.endButton.addEventListener("click", this.initiateWelcome.bind(this));
        this.gameWindow.style.filter = "blur(10px)";
        this.startWindow.style.height = "100%";
    }

    countdownStart() {
        let countdown = 5;
        this.startTime.innerHTML = countdown;
        this.startCountdown.style.display = "block";
        let countdownInterval = setInterval((function () {
            countdown--;
            this.startTime.innerHTML = countdown;
            if (countdown == 0) {
                clearInterval(countdownInterval);
            }
        }).bind(this), 1000);
    }

    clearPlayground() {
        this.playgroundContext.clearRect(0, 0, WIDTH, HEIGHT);
    }

    drawLandscape(landscape) {
        this.playgroundContext.fillStyle = landscape.color;
        this.playgroundContext.beginPath();
        for (let i = 0; i <= WIDTH; i += 10) {
            this.playgroundContext.lineTo(i, landscape.points[i / 10]);
        }
        this.playgroundContext.lineTo(WIDTH, HEIGHT);
        this.playgroundContext.lineTo(0, HEIGHT);
        this.playgroundContext.closePath();
        this.playgroundContext.fill();
    }

    drawTank(tank) {
        let pipeEndX = 24 * Math.cos(tank.angle);
        let pipeEndY = -24 * Math.sin(tank.angle);
        let lifeWidth = (36 / 100) * tank.life - 18;
        this.playgroundContext.beginPath();
        this.playgroundContext.lineTo(tank.x, tank.y);
        this.playgroundContext.lineTo(tank.x + pipeEndX, tank.y + pipeEndY);
        this.playgroundContext.strokeStyle = "#000000";
        this.playgroundContext.lineWidth = 8;
        this.playgroundContext.stroke();
        this.playgroundContext.beginPath();
        this.playgroundContext.arc(tank.x, tank.y, 12, 0, 2 * Math.PI);
        this.playgroundContext.fillStyle = tank.color;
        this.playgroundContext.closePath();
        this.playgroundContext.fill();
        this.playgroundContext.beginPath();
        this.playgroundContext.lineTo(tank.x, tank.y);
        this.playgroundContext.lineTo(tank.x + 18, tank.y);
        this.playgroundContext.lineTo(tank.x + 24, tank.y + 6);
        this.playgroundContext.lineTo(tank.x + 24, tank.y + 12);
        this.playgroundContext.lineTo(tank.x + 18, tank.y + 18);
        this.playgroundContext.lineTo(tank.x - 18, tank.y + 18);
        this.playgroundContext.lineTo(tank.x - 24, tank.y + 12);
        this.playgroundContext.lineTo(tank.x - 24, tank.y + 6);
        this.playgroundContext.lineTo(tank.x - 18, tank.y);
        this.playgroundContext.lineTo(tank.x, tank.y);
        this.playgroundContext.closePath();
        this.playgroundContext.fillStyle = "#555555";
        this.playgroundContext.fill();
        this.playgroundContext.beginPath();
        this.playgroundContext.lineTo(tank.x - 18, tank.y + 6);
        this.playgroundContext.lineTo(tank.x + lifeWidth, tank.y + 6);
        this.playgroundContext.lineTo(tank.x + lifeWidth, tank.y + 12);
        this.playgroundContext.lineTo(tank.x - 18, tank.y + 12);
        this.playgroundContext.closePath();
        this.playgroundContext.fillStyle = "#ff0000";
        this.playgroundContext.fill();
    }

    drawCircle(x, y, radius, color) {
        this.playgroundContext.beginPath();
        this.playgroundContext.arc(x, y, radius, 0, 2 * Math.PI);
        this.playgroundContext.fillStyle = color;
        this.playgroundContext.closePath();
        this.playgroundContext.fill();
    }

    setColor(color) {
        this.weaponNavigation.style.backgroundColor = color;
        this.body.style.backgroundColor = Gui.shadeColor(color, -0.4);
    }

    static shadeColor(color, percent) {
        let f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
        return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

    static hideElement(element) {
        element.style.display = "none";
    }

    hideAll() {
        Gui.hideElement(this.startCountdown);
        Gui.hideElement(this.startButton);
        Gui.hideElement(this.startWait);
        Gui.hideElement(this.endButton);
        Gui.hideElement(this.endRank);
        Gui.hideElement(this.timeLine);
    };

    startGame() {
        this.initiateStart();
        this.game = new Game(this);
    }
};

(function () {
    let userInterface = new Gui();
    window.addEventListener("load", userInterface.initialize.bind(userInterface));
})();
