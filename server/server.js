/**
 * Created by reiem on 12.05.2017.
 */
const app = require('express')();
const http = require('http').Server(app);
const p = require('path');
const io = require('socket.io')(http);

const generateUID = function generateUID()
{
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(let i = 0; i < 30; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

const start = function start() {

    const DIRECTORY = p.dirname(module.parent.filename) + "/";

    app.get('/', function(req, res) {
        res.sendFile(DIRECTORY + 'index.html');
        res.cookie('paenzerliUID', generateUID(), null);
    });

    app.get('/icons/*', function (req, res) {
        res.sendFile(DIRECTORY + req.url);
    });

    app.get('/images/*', function (req, res) {
        res.sendFile(DIRECTORY + req.url);
    });

    app.get('/client/*', function (req, res) {
        res.sendFile(DIRECTORY + req.url);
    });

    app.get('/style/*', function (req, res) {
        res.sendFile(DIRECTORY + req.url);
    });

    app.get('/socket.io/*', function (req, res) {
        res.sendFile(DIRECTORY + req.url);
    });

    http.listen(80, function () {
        console.log('listening on *:80');
    });

};

module.exports.start = start;
module.exports.io = io;
