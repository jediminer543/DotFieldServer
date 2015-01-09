var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var CubeClientManager = require('./lib/CubeClientManager');
var DotFieldServer = require('./lib/DotFieldServer');

var config = require(__dirname + '/../config.json');

var COLORS = [
    // [255, 255, 255], // white
    [255, 0, 0], // red 0
    [0, 255, 0], // green 1
    [0, 0, 255], // blue 2
    [255, 220, 0], // yellow - has a reduced amount of green to remove green tint 3
    [255, 0, 255], // pink 4
    [0, 255, 255], // cyan 5
    [255, 90, 0], // orange - has a reduced amount of green to make less yellowy 6
];
var PALETTE_COLORS = [
    0, // red
    6, // orange
    3, // yellow
    1, // green
    5, // cyan
    2, // blue
    4, // pink
];

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || config.listenWebPort);
app.use(express.static(__dirname + '/public'));

server.listen(app.get('port'), function() {
    console.log('Web server listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
    res.render('index', {config: config});
});

var cubeManager = new CubeClientManager(config, COLORS);
var dfServer = new DotFieldServer(io, cubeManager, COLORS, PALETTE_COLORS, config.inactivityAutopilotStart || 10);
