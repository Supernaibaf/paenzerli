/**
 * Created by reiem on 03.05.2017.
 */
let app = require('express')();
let pg = require('pg');
let http = require('http').Server(app);
let io = require('socket.io')(http);
let regression = require('./script/regression.min');

const db = require("./script/db.js");

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
const TIME_DELAY = 1000;
const DEFAULT_STRENGTH = 30;
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

pool.on("error", function (err, client) {
    console.error("idle client error", err.message, err.stack);
});

const broadcastShots = function broadcastShots(gameid) {
    db.query("SELECT * FROM tankuser WHERE gameid=$1::int ORDER BY userid", [gameid], function (err, result) {
        if (err) {
            return console.error("error running query", err);
        }
        let game = {
            allTanks: []
        };
        for (let i = 0; i < result.rows.length; i++) {
            let tankObject = {
                id: i,
                x: Number(result.rows[i].tankposition),
                angle: Number(result.rows[i].tankangle),
                color: result.rows[i].tankcolor,
                strength: result.rows[i].tankstrength
            };
            game.allTanks.push(tankObject);
        }
        for (let i = 0; i < result.rows.length; i++) {
            io.sockets.connected[result.rows[i].userid].emit('fire-broadcast', JSON.stringify(game));
        }
        db.query("UPDATE tankuser SET tankfired=false WHERE gameid=$1::int", [gameid], function(err) {
            if (err) {
                return console.error("error running query", err);
            }
        });
        db.query("UPDATE game SET shotsfired=0 WHERE gameid=$1::int", [gameid], function (err) {
            if (err) {
                return console.error("error running query", err);
            }
        });
    });
};

const fire = function fire(userid, game) {
    db.query("UPDATE tankuser SET tankfired=true, tankangle=$1::decimal, tankstrength=$2::decimal WHERE gameid=$3::int AND tankfired=false AND tankdead=false AND userid=$4::text RETURNING userid", [game.tank.angle, game.tank.strength, game.id, userid], function (err, result) {
        if (err) {
            return console.error("error running query", err);
        }
        if (result.rows.length == 1) {
            db.query("UPDATE game SET shotsfired=shotsfired+1 WHERE gameid=$1::int RETURNING players, shotsfired", [game.id], function (err, result) {
                if (err) {
                    return console.error("error running query", err);
                }
                if (result.rows[0].players === result.rows[0].shotsfired) {
                    broadcastShots(game.id);
                }
            });
        } else {
            console.log("Illegal action from " + userid);
        }
    });
};

const startGame = function startGame(gameid) {
    db.query("UPDATE game SET opengame=false WHERE gameid=$1::int RETURNING players, landscape", [gameid], function (err, result) {
        if (err) {
            return console.error("error running query", err);
        }
        if (result.rows[0].players <= 1) {

        } else {
            let landscapeObject = JSON.parse(result.rows[0].landscape);
            db.query("SELECT userid, tankposition, tankangle, tankcolor, tankstrength FROM tankuser WHERE gameid=$1::int ORDER BY userid", [gameid], function (err, result) {
                if (err) {
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
                        color: result.rows[i].tankcolor,
                        strength: result.rows[i].tankstrength
                    };
                    playerObjects.push(playerObject);
                    allTanks.push(tankObject);
                }

                for (let i = 0; i < playerObjects.length; i++) {
                    playerObjects[i].alltanks = allTanks;
                    io.sockets.connected[playerObjects[i].id].emit('startround');
                }
                setTimeout(function () {
                    for (let i = 0; i < playerObjects.length; i++) {
                        try {
                            io.sockets.connected[playerObjects[i].id].emit('startgame', JSON.stringify(playerObjects[i]));
                        } catch (ex) {
                        }

                    }
                }, 5000);
            });
        }
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
    db.query("SELECT userid FROM tankuser WHERE gameid=$1::int", [game.id], function (err, result) {
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
};

const insertUser = function insertUser(socket, game) {
    if (!game.error) {
        let error = false;
        let userid = socket.id;
        let tankColor = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        let tankPosition = Math.random() * WIDTH;
        db.query("INSERT INTO tankuser(userid, tankposition, tankcolor, tankfired, tankstrength, gameid) VALUES($1::text, $2::decimal, $3::text, false, $4::decimal, $5::int)", [userid, tankPosition, tankColor, DEFAULT_STRENGTH, game.gameid], function (err) {
            if (err) {
                return console.error("error running query", err);
            }
            updateGame(game);
        });
        if (!error) {
            console.log("Connection of " + userid + " was successful");
            socket.on('fire', function (msg) {
                try {
                    let game = JSON.parse(msg);
                    fire(socket.id, game);
                } catch (ex) {
                }
            });
            socket.on('angle', function (msg) {
                try {
                    let game = JSON.parse(msg);
                    broadcastEvent('angle', socket.id, game);
                } catch (ex) {
                }
            });
            socket.on('end', function () {
                endGame(socket.id);
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

const endGame = function removeFromGame(userid) {
    db.query("UPDATE tankuser SET tankdead=true WHERE userid=$1::text", [userid], function (err) {
        if (err) {
            return console.error("error running query", err);
        }
    });
};

const updateUser = function updateUser(socket, game) {
    if (!game.error) {
        let userid = socket.id;
        let tankColor = '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6);
        let tankPosition = Math.random() * WIDTH;
        db.query("UPDATE tankuser SET tankposition=$1::decimal, tankcolor=$2::text, gameid=$3::int, tankdead=false, tankfired=false, tankstrength=$4::decimal WHERE userid=$5::text", [tankPosition, tankColor, game.gameid, DEFAULT_STRENGTH, userid], function (err) {
            if (err) {
                return console.error("error running query", err);
            }
            updateGame(game);
        });
    } else {
        console.error("Err");
    }
};

const updateGame = function updateGame(game) {
    let opengame = true;

    if (game.players + 1 == MAX_PLAYERS) {
        opengame = false;
    }

    db.query("UPDATE game SET players=$1::int, opengame=$2::boolean WHERE gameid=$3::int", [game.players + 1, opengame, game.gameid], function (err) {
        if (err) {
            return console.error("error running query", err);
        }
    });
};

const deleteUser = function deleteUser(userid) {
    db.query("DELETE FROM tankuser WHERE userid=$1::text", [userid], function (err) {
        if (err) {
            return console.error("error running query", err);
        }
        console.log(userid + " disconnected");
    });
};

const createConnection = function createConnection(socket, firstConnection) {
    let game = {
        gameid: null,
        landscape: null,
        players: null,
        wind: null
    };
    db.query("select gameid, landscape, players, wind from game where opengame is true limit 1", [], function (err, result) {
        if (err) {
            return console.error("error running query", err);
        }

        if (result.rows.length == 1) {
            game.gameid = result.rows[0].gameid;
            game.landscape = result.rows[0].landscape;
            game.players = result.rows[0].players;
            game.wind = result.rows[0].wind;
            if (game.players == 1) {
                setTimeout(function () {
                    startGame(game.gameid);
                }, TIME_DELAY);
            }
            if (firstConnection) {
                insertUser(socket, game);
            } else {
                updateUser(socket, game);
            }
        } else {
            let landscapeIndex = Math.floor(Math.random() * LANDSCAPES.length);
            let landscape = {
                name: LANDSCAPES[landscapeIndex].name,
                color: LANDSCAPES[landscapeIndex].color,
                lambdas: generateLandscapeLambdas(LANDSCAPES[landscapeIndex])
            };
            game.landscape = landscape;
            game.wind = 30;
            game.players = 0;
            db.query("INSERT INTO game(landscape, players, wind) VALUES($1::text, 0, $2::decimal) RETURNING gameid", [JSON.stringify(landscape), game.wind], function (err, result) {
                if (err) {
                    return console.error("error running query", err);
                }
                game.gameid = result.rows[0].gameid;
                if (firstConnection) {
                    insertUser(socket, game);
                } else {
                    updateUser(socket, game);
                }
            });
        }
    });
};

app.get('/*', function (req, res) {
    res.sendFile(__dirname + req.url);
});

io.on('connection', function (socket) {
    let firstConnection = true;
    socket.on('start', function () {
        createConnection(socket, firstConnection);
        firstConnection = false;
    });
});

io.emit('some event', {for: 'everyone'});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
