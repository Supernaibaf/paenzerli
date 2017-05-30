/**
 * Created by reiem on 12.05.2017.
 */
const app = require('express')();
const http = require('http').Server(app);
const p = require('path');
const io = require('socket.io')(http);


const start = function start() {

    const DIRECTORY = p.dirname(module.parent.filename) + "/";

    app.get('/*', function (req, res) {
        res.sendFile(DIRECTORY + req.url);
    });

    app.get('/icons/*', function (req, res) {
        res.sendFile(DIRECTORY + req.url);
    });

    app.get('/script/*', function (req, res) {
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
