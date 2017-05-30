/**
 * Created by reiem on 12.05.2017.
 */

const constant = require('./const');
const ls = require('./landscape');
const Tank = require('./tank');

class Game {
    constructor(id) {
        this.id = id;
        this.playerList = [];
        this.tankList = {};
        this.open = true;
        this.end = false;
        this.landscape = ls.newLandscape();
        this.rank = 0;
        this.timer = null;
        this.fireTimer = null;
    }

    startRound() {
        clearTimeout(this.timer);
        this.open = false;
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].startRound();
        }
        this.timer = setTimeout((this.start).bind(this), 1);
    }

    fire(tank) {
        let x = Math.floor(tank.x / 10);
        if (!this.tankList[tank.index].setWeapon(tank.weapon)) {
            console.error("Error setting weapon");
            return;
        }
        this.tankList[tank.index].setPosition(x, this.landscape.points);
        this.tankList[tank.index].setStrength(tank.strength);
        this.tankList[tank.index].setAngle(tank.angle);
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].opponentShot(tank);
        }
        this.allFire(false);
    }

    allFire(force) {
        let allTanksFired = true;
        let allTanks = {};
        for (let i = 0; i < this.playerList.length; i++) {
            if (!this.playerList[i].hasFired() && !this.playerList[i].isDead()) {
                allTanksFired = false;
            }
            if (!this.playerList[i].isDead()) {
                allTanks[this.playerList[i].getTank()] = this.tankList[this.playerList[i].getTank()].getObject();
            }
        }
        if (allTanksFired || force) {
            clearTimeout(this.fireTimer);
            let end = false;
            for (let i = 0; i < this.playerList.length; i++) {
                if (allTanks.hasOwnProperty(this.playerList[i].getTank())) {
                    if (allTanks[this.playerList[i].getTank()].mode === "fire") {
                        let shot = this.tankList[this.playerList[i].getTank()].simulateShot(this.landscape.points, allTanks);
                        allTanks[this.playerList[i].getTank()].shot = shot;
                        for (let j = 0; j < shot.hits.length; j++) {
                            if (this.tankList.hasOwnProperty(shot.hits[j]) && allTanks.hasOwnProperty(shot.hits[j])) {
                                let life = this.tankList[shot.hits[j]].hit(constant.WEAPONS[allTanks[this.playerList[i].getTank()].weapon].strength);
                                allTanks[shot.hits[j]].life = life;
                                if (life <= 0) {
                                    let change = this.tankList[shot.hits[j]].getPlayer().setDead(this.rank);
                                    if (change) {
                                        this.rank--;
                                        if (this.rank == 1) {
                                            end = true;
                                        }
                                    }
                                }
                            }
                        }
                    } else if (allTanks[this.playerList[i].getTank()].mode === "drive") {
                        this.tankList[this.playerList[i].getTank()].setMode("fire");
                    }
                }
            }
            for (let i = 0; i < this.playerList.length; i++) {
                this.playerList[i].fire(allTanks);
            }
            if (end) {
                this.endGame(false);
            } else {
                this.fireTimer = setTimeout((function () {
                    this.allFire(true);
                }).bind(this), constant.MAX_FIRE_TIME);
            }
        }
    }

    endGame(force) {
        this.end = true;
        for (let i = 0; i < this.playerList.length; i++) {
            if (!this.playerList[i].isDead()) {
                this.playerList[i].setDead(this.rank);
            }
            this.playerList[i].endGame(force);
        }
        for (let i = this.playerList.length - 1; i >= 0; i--) {
            this.playerList[i].deletePlayer();
        }
    }

    start() {
        this.timer = null;
        let game = this.getObject();
        this.rank = this.playerList.length;
        let positions = [];
        for (let i = 0; i < this.playerList.length; i++) {
            let x;
            let uniquePosition = false;
            while (!uniquePosition) {
                uniquePosition = true;
                x = Math.floor((constant.WIDTH / 10) * Math.random());
                for (let i = 0; i < positions.length; i++) {
                    if (x >= positions[i] - 10 && x <= positions[i] + 10) {
                        uniquePosition = false;
                        break;
                    }
                }
            }
            positions.push(x);
            let y = this.landscape.points[x];
            let tank = new Tank(i, x * 10, y + constant.DELTA_Y);
            this.tankList[i] = tank;
            this.playerList[i].setTank(i);
            tank.setPlayer(this.playerList[i]);
            game.alltanks[i] = tank.getObject();
        }
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].startGame(game);
        }
        this.fireTimer = setTimeout((function () {
            this.allFire(true);
        }).bind(this), constant.MAX_FIRE_TIME);
    }

    isOpen() {
        return this.open;
    }

    addPlayer(player) {
        this.playerList.push(player);
        if (this.playerList.length == constant.MAX_PLAYERS) {
            this.startRound();
        } else if (this.playerList.length == constant.MIN_PLAYERS) {
            this.timer = setTimeout((this.startRound).bind(this), constant.MAX_TIME_DELAY);
        }
    }

    removePlayer(player) {
        let index = this.playerList.indexOf(player);
        if (index > -1) {
            let tank = this.tankList[this.playerList[index].getTank()];
            this.rank--;
            this.playerList.splice(index, 1);
            if (this.playerList.length <= constant.MIN_PLAYERS) {
                clearTimeout(this.timer);
            }
            if (!this.open && !this.end) {
                let playersAlive = 0;
                for (let i = 0; i < this.playerList.length; i++) {
                    this.playerList[i].dead(tank.getObject());
                    if (!this.playerList[i].isDead()) {
                        playersAlive++;
                    }
                }
                if (playersAlive <= 1) {
                    this.endGame(true);
                }
            }
        }
    }

    getObject() {
        return {
            id: this.id,
            landscape: this.landscape,
            alltanks: {}
        }
    }

}

module.exports = Game;
