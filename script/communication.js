/**
 * Created by reiem on 04.05.2017.
 */
const socket = io();

const eventEmit = function eventEmit(type, gameObject) {
    if (game === undefined) {
        socket.emit(type);
    } else {
        let game = JSON.stringify(gameObject);
        socket.emit(type, game);
    }
};

const initiateGame = function initiateGame() {
    socket.emit("start");
};

socket.on("startgame", function(msg) {
    try {
        let game = JSON.parse(msg);
        startGame(game);
    } catch (ex) {
        console.error("Could not parse JSON object" + msg, ex);
    }
});

socket.on("startround", function() {
    startRound();
});

socket.on("fire-broadcast", function(msg) {
    try {
        let game = JSON.parse(msg);
        for (let i = 0; i < game.allTanks.length; i++) {
            fire(game.allTanks[i]);
            if (game.allTanks[i].hit) {
                console.log("Hit");
            }
        }
    } catch (ex) {
        console.error("Could not parse JSON object" + msg, ex);
    }
});

socket.on("opponent-broadcast", function(msg) {
    try {
        let tank = JSON.parse(msg);
        opponentShotFired(tank);
    } catch (ex) {
        console.error("Could not parse JSON object" + msg, ex);
    }
});

socket.on("angle-broadcast", function(msg) {
    try {
        let tank = JSON.parse(msg);
        changeAngle(tank);
    } catch (ex) {
        console.error("Could not parse JSON object" + msg, ex);
    }
});
