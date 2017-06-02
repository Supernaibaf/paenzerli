/**
 * Created by reiem on 30.05.2017.
 */

const Game = class Game {
    constructor(gui) {

        this.gui = gui;
        this.socket = new io();
        this.animations = 0;
        this.gameResult = null;

        this.socket.on("startgame", this.startGame.bind(this));
        this.socket.on("startround", this.startRound.bind(this));
        this.socket.on("endgame", this.endGame.bind(this));
        this.socket.on("fire-broadcast", this.fire.bind(this));
        this.socket.on("opponent-broadcast", this.opponentFire.bind(this));
        this.socket.on("dead-broadcast", this.opponentDead.bind(this));

        this.socket.emit("start");
    }

    conclude() {
        let cookieString = document.cookie.replace(/ /g, '');
        let cookieStrings = cookieString.split(';');
        let cookies = {};
        for (let i = 0; i < cookieStrings.length; i++) {
            let cookie = cookieStrings[i].split('=');
            cookies[cookie[0]] = cookie[1];
        }
        let playerId = cookies['paenzerliUID'];
        this.gui.interaction.disable();
        let tankObject = this.allTanks[this.myTank].getObject();
        tankObject.playerId = playerId;
        console.log(tankObject);
        this.socket.emit("fire", JSON.stringify(tankObject));
        this.gui.concluded();
    }

    drawAll() {
        this.gui.clearPlayground();
        this.gui.drawLandscape(this.landscape);
        for (let key in this.allTanks) {
            if (this.allTanks.hasOwnProperty(key)) {
                this.gui.drawTank(this.allTanks[key].getObject());
            }
        }
    }

    tankFollowMouse(mouseX, mouseY) {
        this.allTanks[this.myTank].followMouse(mouseX, mouseY);
        this.drawAll();
    }

    tankSetStrength(strength, operator) {
        let stren = this.allTanks[this.myTank].setStrength(strength, operator);
        this.gui.setStrengthSliderValue(stren);
    }

    tankSetPosition(posX, operator) {
        let x = this.allTanks[this.myTank].setPositionX(posX, operator);
        let y = this.landscape.points[Math.floor(x / 10)] + DELTA_Y;
        this.allTanks[this.myTank].setPositionY(y);
        this.drawAll();
    }

    tankSetAngle(angle, operator) {
        this.allTanks[this.myTank].setAngle(angle, operator);
        this.drawAll();
    }

    tankSetWeapon(weapon) {
        let weap = this.allTanks[this.myTank].setWeapon(weapon);
        this.gui.setActiveWeapon(weap.name, weap.amount);
    }

    startRound() {
        this.gui.initiateRound();
    }

    startGame(data) {
        let game = null;
        try {
            game = JSON.parse(data);
        } catch (ex) {
            console.error("Could not parse JSON object" + data, ex);
        }
        if (game !== null) {
            this.allTanks = {};
            this.myTank = game.mytank.toString();
            this.id = game.id;
            this.landscape = game.landscape;
            for (let key in game.alltanks) {
                if (game.alltanks.hasOwnProperty(key)) {
                    this.allTanks[key] = new Tank(game.alltanks[key]);
                    this.allTanks[key].setColor((key === this.myTank) ? MY_COLOR : COLOR_OPPONENT);
                }
            }
            this.gui.setColor(this.landscape.color);
            this.drawAll();
            Gui.setWeaponAmounts(this.allTanks[this.myTank].getAmounts());
            this.tankSetWeapon(DEFAULT_WEAPON);
            this.gui.initiateStartGame();
            this.gui.startTimer();
        }
    }

    endGame(data) {
        let result = null;
        try {
            result = JSON.parse(data);
        } catch (ex) {
            console.error("Could not parse JSON object" + data, ex);
        }
        if (result !== null) {
            this.gameResult = result;
            this.animationEnd();
        }
    }

    fire(data) {
        let tanks = null;
        try {
            tanks = JSON.parse(data);
        } catch (ex) {
            console.error("Could not parse JSON object" + data, ex);
        }
        if (tanks !== null) {
            this.animateConclusion(tanks);
        }
    }

    animateConclusion(tanks) {
        let steps = 15;
        this.animations++;
        for (let key in tanks) {
            if (tanks.hasOwnProperty(key) && this.allTanks.hasOwnProperty(key) && key != this.myTank) {
                this.allTanks[key].setColor(COLOR_OPPONENT);
            }
        }
        let animationInterval = setInterval((function() {
            steps--;
            for (let key in tanks) {
                if (tanks.hasOwnProperty(key) && this.allTanks.hasOwnProperty(key)) {
                    let thisTank = this.allTanks[key];
                    let tank = tanks[key];
                    if (steps == 0) {
                        let x = thisTank.setPositionX(tank.x);
                        let y = this.landscape.points[Math.floor(x / 10)] + DELTA_Y;
                        thisTank.setPositionY(y);
                        thisTank.setAngle(tank.angle);
                        thisTank.setStrength(tank.strength);
                        thisTank.setWeapon(tank.weapon);
                    } else {
                        let newX = thisTank.getPositionX() + (tank.x - thisTank.getPositionX()) / steps;
                        let newAngle = thisTank.getAngle() + (tank.angle - thisTank.getAngle()) / steps;
                        let x = thisTank.setPositionX(newX);
                        let y = this.landscape.points[Math.floor(x / 10)] + DELTA_Y;
                        thisTank.setPositionY(y);
                        thisTank.setAngle(newAngle);
                    }
                }
            }
            this.drawAll();
            if (steps == 0) {
                clearInterval(animationInterval);
                this.animations--;
                this.animateFire(tanks);
                this.gui.startTimer();
                this.animationEnd();
            }
        }).bind(this), 1000 / FPS);
    }

    animateFire(tanks) {
        for (let key in tanks) {
            if (tanks.hasOwnProperty(key) && this.allTanks.hasOwnProperty(key) && tanks[key].mode === "fire") {
                this.animations++;
                let thisTank = this.allTanks[key];
                let startTime = Date.now();
                let tank = tanks[key];
                let speedX = tank.strength * Math.cos(tank.angle);
                let speedY = tank.strength * Math.sin(tank.angle);
                let cannonballStartX = tank.x + (25 + CANNONBALL_RADIUS) * Math.cos(tank.angle);
                let cannonballStartY = tank.y - (25 + CANNONBALL_RADIUS) * Math.sin(tank.angle);
                let cannonballX = cannonballStartX;
                let cannonballY = cannonballStartY;

                let animationInterval = setInterval((function() {
                    this.gui.clearCannonball(cannonballX, cannonballY);
                    let time = ((Date.now()) - startTime) / 1000;
                    cannonballX = cannonballStartX + PIXEL_PER_METER * (speedX * time);
                    cannonballY = cannonballStartY - PIXEL_PER_METER * (speedY * time - (ACCELERATION / 2) * time * time);

                    if ((speedX >= 0 && cannonballX >= tank.shot.stopX)
                        || (speedX < 0 && cannonballX <= tank.shot.stopX)
                        || cannonballY > this.landscape.points[Math.floor(cannonballX / 10)]) {

                        clearInterval(animationInterval);
                        let weap = thisTank.shot();
                        if (tank.index == this.myTank) {
                            Gui.setWeaponAmounts(thisTank.getAmounts());
                            this.gui.setActiveWeapon(weap.name, weap.amount);
                        }
                        if (tank.shot.stopY !== null) {
                            this.animateExplosion(tank.shot.stopX, tank.shot.stopY, WEAPONS[tank.weapon].strength);
                        }
                        for (let i = 0; i < tank.shot.hits.length; i++) {
                            if (this.allTanks.hasOwnProperty(tank.shot.hits[i]) && this.allTanks[tank.shot.hits[i]].setLife(WEAPONS[tank.weapon].strength, "sub") <= 0) {
                                this.explodeTank(this.allTanks[tank.shot.hits[i]]);
                            }
                        }
                        this.drawAll();
                        this.animations--;
                        this.animationEnd();
                    } else {
                        this.gui.drawCannonball(cannonballX, cannonballY, tank.weapon);
                        this.gui.drawTank(thisTank);
                    }
                }).bind(this), 1000 / FPS);
            }
        }
    }

    animationEnd() {
        if (this.gameResult !== null && this.animations <= 0) {
            this.gui.stopTimer();
            let resultText = "";
            switch(this.gameResult.rank) {
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
            this.gui.initiateEnd(resultText);
        } else if (this.animations <= 0) {
            this.drawAll();
            if (this.allTanks.hasOwnProperty(this.myTank)) {
                this.gui.interaction.enable();
            }
        }
    }

    explodeTank(tank) {
        this.animateExplosion(tank.x, tank.y, 28);
        delete this.allTanks[tank.getIndex()];
    }

    animateExplosion(x, y, radius) {
        if (radius >= 5) {
            this.animations++;
            let animationRadius = 0;
            let animationInterval = setInterval((function() {
                animationRadius += 2;
                let green = ((150 / radius) * animationRadius);
                let color = "rgb(255, " + green + ", 0)";
                this.gui.drawCircle(x, y, animationRadius, color);
                if (animationRadius >= radius) {
                    clearInterval(animationInterval);
                    for (let i = 0; i < 3; i++) {
                        let newX = (Math.random() * radius) - radius / 2 + x;
                        let newY = (Math.random() * radius) - radius / 2 + y;
                        this.animateExplosion(newX, newY, radius / 2);
                    }
                    this.drawAll();
                    this.animations--;
                    this.animationEnd();
                }
            }).bind(this), 1000 / FPS);
        }
    }

    opponentFire(data) {
        let tank = null;
        try {
            tank = JSON.parse(data);
        } catch (ex) {
            console.error("Could not parse JSON object" + data, ex);
        }
        if (tank !== null && tank.index != this.myTank) {
            this.allTanks[tank.index].setColor(COLOR_SHOT);
            this.drawAll();
        }
    }

    opponentDead(data) {
        let tank = null;
        try {
            tank = JSON.parse(data);
        } catch (ex) {
            console.error("Could not parse JSON object" + data, ex);
        }
        if (tank !== null) {
            this.explodeTank(this.allTanks[tank.index]);
        }
    }
};
