/**
 * Created by reiem on 03.05.2017.
 */
let app = require('express')();
let pg = require('pg');
let http = require('http').Server(app);
let io = require('socket.io')(http);
let regression = require('./script/regression.min');

const config = {
    user: "tankadmin",
    database: "tank",
    password: "tankadmin",
    host: "localhost",
    port: 5432,
    max: 1,
    idleTimeoutMillis: 30000
};

const MAX_PLAYERS = 4;
const WIDTH = 1600;
const HEIGHT = 1040;
const TIME_DELAY = 1000;
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

const pool = new pg.Pool(config);

const fire = function fire(userid, game) {
    pool.connect(function (err, client, done) {
        if (err) {
            done(err);
            return console.error('error fetching client from pool', err);
        }
        client.query("SELECT userid FROM tankuser WHERE gameid=$1::int", [game.id], function(err, result) {
            done(err);
            if (err) {
                return console.error("error running query", err);
            }
            let useridValid = false;
            for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].userid === userid) {
                    useridValid = true;
                }
            }
            if (useridValid) {
                for (let i = 0; i < result.rows.length; i++) {
                    if (result.rows[i].userid !== userid) {
                        io.sockets.connected[result.rows[i].userid].emit('fire-broadcast', JSON.stringify(game.tank));
                    }
                }
            }
        });
    });
};

const startGame = function startGame(gameid) {
    pool.connect(function (err, client, done) {
        if (err) {
            done(err);
            error = true;
            return console.error('error fetching client from pool', err);
        }
        client.query("UPDATE game SET opengame=false WHERE gameid=$1::int RETURNING players, landscape", [gameid], function (err, result) {

            if (err || result.rows.length !== 1) {
                done(err);
                error = true;
                return console.error("error running query", err);
            }
            if (result.rows[0].players <= 1) {
                done(err);
            } else {
                let landscapeObject = JSON.parse(result.rows[0].landscape);
                client.query("SELECT userid, tankposition, tankangle, tankcolor FROM tankuser WHERE gameid=$1::int", [gameid], function (err, result) {
                    done(err);
                    if (err) {
                        error = true;
                        return console.error("error running query", err);
                    }
                    let playerObjects = [];
                    let allTanks = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        let playerObject = {
                            id: result.rows[i].userid,
                            gameid: gameid,
                            landscape: landscapeObject,
                            mytank: i,
                            alltanks: null
                        };
                        let tankObject = {
                            id: i,
                            x: Number(result.rows[i].tankposition),
                            angle: Number(result.rows[i].tankangle),
                            color: result.rows[i].tankcolor
                        };
                        playerObjects.push(playerObject);
                        allTanks.push(tankObject);
                    }

                    for (let i = 0; i < playerObjects.length; i++) {
                        playerObjects[i].alltanks = allTanks;
                        io.sockets.connected[playerObjects[i].id].emit('startround');
                    }
                    setTimeout(function() {
                        for (let i = 0; i < playerObjects.length; i++) {
                            io.sockets.connected[playerObjects[i].id].emit('startgame', JSON.stringify(playerObjects[i]));
                        }
                    }, 5000);
                });
            }
        });
    });
};

const generateLandscapeLambdas = function generateLandscapeLambdas(landscape) {
    let coordinates = [];
    let counter = 0;
    for (let i = 0; i <= WIDTH; i += landscape.randomPointDistance) {
        let x = i;
        let y = Math.random() * landscape.randomSize + landscape.topDistance;
        coordinates[counter] = [x, y];
        counter++;
    }

    return regression("polynomial", coordinates, landscape.degreesOfFreedom).equation;
};

const broadcastEvent = function broadcastEvent(eventType, userid, game) {
    pool.connect(function (err, client, done) {
        if (err) {
            done(err);
            return console.error('error fetching client from pool', err);
        }
        client.query("SELECT userid FROM tankuser WHERE gameid=$1::int", [game.id], function(err, result) {
            done(err);
            if (err) {
                return console.error("error running query", err);
            }
            let useridValid = false;
            for (let i = 0; i < result.rows.length; i++) {
                if (result.rows[i].userid === userid) {
                    useridValid = true;
                }
            }
            if (useridValid) {
                for (let i = 0; i < result.rows.length; i++) {
                    if (result.rows[i].userid !== userid) {
                        io.sockets.connected[result.rows[i].userid].emit(eventType + '-broadcast', JSON.stringify(game.tank));
                    }
                }
            }
        });
    });
};

const insertUser = function insertUser(socket, game, client, done) {
    if (!game.error) {
        let error = false;
        let userid = socket.id;
        let tankColor = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        let tankPosition = Math.random() * WIDTH;
        client.query("INSERT INTO tankuser(userid, tankposition, tankcolor, gameid) VALUES($1::text, $2::decimal, $3::text, $4::int)", [userid, tankPosition, tankColor, game.gameid], function (err, result) {
            if (err) {
                done(err);
                error = true;
                return console.error("error running query", err);
            }
            updateGame(client, game, done);
        });
        if (!error) {
            console.log("Connection of " + userid + " was successful");
            socket.on('fire', function (msg) {
                try {
                    let game = JSON.parse(msg);
                    broadcastEvent('fire', socket.id, game);
                } catch (ex) {}
            });
            socket.on('angle', function (msg) {
                try {
                    let game = JSON.parse(msg);
                    broadcastEvent('angle', socket.id, game);
                } catch (ex) {}
            });
            socket.on('disconnect', function () {
                deleteUser(socket.id);
            });
        } else {
            console.log("Connection of " + userid + " failed");
        }
    } else {
        console.error("Err");
    }
};

const updateGame = function updateGame(client, game, done) {
    let opengame = true;

    if (game.players + 1 == MAX_PLAYERS) {
        opengame = false;
    }

    client.query("UPDATE game SET players=$1::int, opengame=$2::boolean WHERE gameid=$3::int", [game.players + 1, opengame, game.gameid], function (err, result) {
        if (err) {
            done(err);
            error = true;
            return console.error("error running query", err);
        }
        done(err);
    });
};

const deleteUser = function deleteUser(userid) {
    pool.connect(function (err, client, done) {
        if (err) {
            done(err);
            return console.error('error fetching client from pool', err);
        }
        client.query("DELETE FROM tankuser WHERE userid=$1::text", [userid], function (err, result) {
            done(err);
            if (err) {
                return console.error("error running query", err);
            }
            console.log(userid + " disconnected");
        });
    });
};

const createConnection = function createConnection(socket) {
    let game = {
        gameid: null,
        landscape: null,
        players: null,
        error: false
    };
    pool.connect(function (err, client, done) {
        if (err) {
            done(err);
            game.error = true;
            return console.error('error fetching client from pool', err);
        }
        client.query("select gameid, landscape, players from game where opengame is true limit 1", [], function (err, result) {
            if (err) {
                done(err);
                game.error = true;
                return console.error("error running query", err);
            }

            if (result.rows.length == 1) {
                game.gameid = result.rows[0].gameid;
                game.landscape = result.rows[0].landscape;
                game.players = result.rows[0].players;
                if (game.players == 1) {
                    setTimeout(function () {
                        startGame(game.gameid);
                    }, TIME_DELAY);
                }
                insertUser(socket, game, client, done);
            } else {
                let landscapeIndex = Math.floor(Math.random() * LANDSCAPES.length);
                let landscape = {
                    name: LANDSCAPES[landscapeIndex].name,
                    color: LANDSCAPES[landscapeIndex].color,
                    lambdas: generateLandscapeLambdas(LANDSCAPES[landscapeIndex])
                };
                game.landscape = landscape;
                game.players = 0;
                client.query("INSERT INTO game(landscape, players) VALUES($1::text, 0) RETURNING gameid", [JSON.stringify(landscape)], function (err, result) {
                    if (err) {
                        done(err);
                        game.error = true;
                        return console.error("error running query", err);
                    }
                    let gameid = result.rows[0].gameid;
                    game.gameid = gameid;
                    insertUser(socket, game, client, done);
                });
            }
        });
    });
};

app.get('/*', function (req, res) {
    res.sendFile(__dirname + req.url);
});

io.on('connection', function (socket) {
    socket.on('start', function () {
        createConnection(socket);
    });
});

io.emit('some event', {for: 'everyone'});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
