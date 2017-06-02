/**
 * Created by reiem on 13.05.2017.
 */

let gameEnd = null;

const initialize = function initialize() {
    initializeElements();
    initiateWelcome();
};

const startGame = function startGame(game) {
    landscape = game.landscape;
    allTanks = [];
    for (let key in game.alltanks) {
        if (game.alltanks.hasOwnProperty(key)) {
            allTanks[key] = new Tank(
                playgroundContext,
                game.mytank == key,
                game.alltanks[key].index,
                game.alltanks[key].x,
                game.alltanks[key].y,
                game.alltanks[key].angle,
                game.alltanks[key].strength,
                fireEnd
            );
            if (game.mytank == key) {
                myTank = allTanks[key];
            }
        }
    }
    initiateStartGame();
};

const endGame = function endGame(result) {
    gameEnd = result;
    disableGameInteraction();
    if (result.force) {
        initiateEnd(gameEnd.rank);
    }
};

const fireEnd = function fireEnd() {
    setActiveWeapon(myTank.getWeapon());
    redrawPlayground();
    if (gameEnd !== null) {
        let allTanksFired = true;
        for (let key in allTanks) {
            if (allTanks.hasOwnProperty(key)) {
                if (!allTanks[key].hasFired()) {
                    allTanksFired = false;
                    break;
                }
            }
        }
        if (allTanksFired) {
            initiateEnd(gameEnd.rank);
        }
    }
};

const fireTank = function fireTank(tank) {
    allTanks[tank.index].setAngle(tank.angle);
    allTanks[tank.index].setStrength(tank.strength);
    allTanks[tank.index].setPosition(tank.x);
    allTanks[tank.index].setWeapon(tank.weapon);
    if (tank.mode === "fire") {
        allTanks[tank.index].fire(tank.shot);
    }
    allTanks[tank.index].resetShot();
};

const opponentFire = function opponentFire(tank) {
    allTanks[tank.index].setShot();
};

const opponentDead = function opponentDead(tank) {
    allTanks[tank.index].tankHit(MAX_LIFE);
};

window.addEventListener("load", initialize);
