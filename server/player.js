/**
 * Created by reiem on 12.05.2017.
 */

const constant = require('./const');

class Player {
    constructor(socket, endConnection) {
        this.socket = socket;
        this.connectionEnd = endConnection;
        this.game = null;
        this.tankIndex = null;
        this.index = null;
        this.fired = false;
        this.rank = null;
        this.initializeSocket();
    }

    disconnect() {
        this.game.removePlayer(this);
        this.connectionEnd(this.socket);
    }

    onFire(data) {
        let tank = null;
        try {
            tank = JSON.parse(data);
        } catch(ex) {
            console.error("Could not parse data from user" + data, ex);
        }
        if (tank !== null) {
            if (this.validateFire(tank)) {
                this.fired = true;
                this.game.fire(tank);
            } else {
                console.error("Validation error");
            }
        }
    }

    initializeSocket() {
        this.socket.on("disconnect", this.disconnect.bind(this));
        this.socket.on("fire", this.onFire.bind(this));
    }

    hasFired() {
        return this.fired;
    }

    fire(alltanks) {
        this.fired = false;
        this.socket.emit("fire-broadcast", JSON.stringify(alltanks));
    }

    dead(tank) {
        this.socket.emit("dead-broadcast", JSON.stringify(tank));
    }

    validateFire(tank) {
        let validateError = false;
        if (this.fired || this.rank !== null
            || typeof tank !== "object"
            || tank.index === undefined || tank.index !== this.tankIndex
            || tank.angle === undefined || tank.strength === undefined
            || tank.x === undefined || tank.x > constant.WIDTH || tank.x < 0
            || tank.weapon === undefined) {
            validateError = true;
        }
        return !validateError;
    }

    opponentShot(tank) {
        this.socket.emit("opponent-broadcast", JSON.stringify(tank));
    }

    setGame(game) {
        this.game = game;
    }

    getTank() {
        return this.tankIndex;
    }

    setTank(tankIndex) {
        this.tankIndex = tankIndex;
    }

    setDead(rank) {
        if (this.rank == null) {
            this.rank = rank;
            return true;
        }
        return false;
    }

    isDead() {
        return this.rank !== null;
    }

    startRound() {
        this.socket.emit("startround");
    }

    startGame(game) {
        game.mytank = this.tankIndex;
        this.socket.emit("startgame", JSON.stringify(game));
    }

    endGame(force) {
        let result = {
            force: force,
            rank: this.rank
        };
        this.socket.emit("endgame", JSON.stringify(result));
    }

    deletePlayer() {
        this.socket.removeAllListeners("disconnect");
        this.socket.removeAllListeners("fire");
        this.disconnect();
    }
}

module.exports = Player;
