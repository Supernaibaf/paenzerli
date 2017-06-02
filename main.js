/**
 * Created by reiem on 12.05.2017.
 */

const server = require('./server/server');
const communication = require('./server/communication');
const Game = require('./server/game');
const Player = require('./server/player');
const constant = require('./server/const');

let gameIndex = 0;
let games = [];
let players = {};

const newGame = function newGame() {
    let game = new Game(gameIndex);
    games[gameIndex] = game;
    gameIndex++;
    return game;
};

const endConnection = function endConnection(id) {
    players[id] = null;
};

const freeGame = function freeGame() {
    for (let i = 0; i < games.length; i++) {
        if (games[i].isOpen()) {
            return games[i];
        }
    }
    return newGame();
};

const initializePlayer = function initializePlayer(socket) {
    let id = constant.parseStringToCookie(socket.handshake.headers.cookie)['paenzerliUID'];
    if (!players.hasOwnProperty(id) || players[id] === null) {
        let player = new Player(socket, id, endConnection);
        let game = freeGame();
        players[id] = player;
        game.addPlayer(player);
        player.setGame(game);
    } else {
        console.error("User started twice!", socket.id);
    }
};

server.start();
server.io.on('connection', function(socket) {
    socket.on('start', function() {
        initializePlayer(socket);
    });
});
