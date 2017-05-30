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

const sendStart = function sendStart() {
    socket.emit("start");
};

const sendFire = function sendFire(data) {
    socket.emit("fire", JSON.stringify(data));
};

socket.on("startgame", function(data) {
    let game = null;
    try {
        game = JSON.parse(data);
    } catch (ex) {
        console.error("Could not parse JSON object" + data, ex);
    }
    if (game !== null) {
        startGame(game);
    }
});

socket.on("startround", function() {
    initiateRound();
});

socket.on("endgame", function(data) {
    let result = null;
    try {
        result = JSON.parse(data);
    } catch (ex) {
        console.error("Could not parse JSON object" + data, ex);
    }
    if (result !== null) {
        endGame(result);
    }
});

socket.on("fire-broadcast", function(msg) {
    let allTanks = null;
    try {
        allTanks = JSON.parse(msg);
    } catch (ex) {
        console.error("Could not parse JSON object" + msg, ex);
    }
    if (allTanks !== null) {
        for (let key in allTanks) {
            if (allTanks.hasOwnProperty(key)) {
                fireTank(allTanks[key]);
            }
        }
        if (allTanks.hasOwnProperty(myTank.getIndex())) {
            if (allTanks[myTank.getIndex()].life > 0) {
                enableGameInteraction();
                startTimer();
            }
        }
    }
});

socket.on("opponent-broadcast", function(data) {
    let tank = null;
    try {
        tank = JSON.parse(data);
    } catch (ex) {
        console.error("Could not parse JSON object" + msg, ex);
    }
    if (tank !== null) {
        opponentFire(tank);
    }
});

socket.on("dead-broadcast", function(data) {
    let tank = null;
    try {
        tank = JSON.parse(data);
    } catch (ex) {
        console.error("Could not parse JSON object" + msg, ex);
    }
    if (tank !== null) {
        opponentDead(tank);
    }
});
