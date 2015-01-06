var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var WebSocketServer = require('ws').Server;
var CubeClientManager = require('./lib/CubeClientManager');
var DotFieldServer = require('./lib/DotFieldServer');

var config = require(__dirname + '/../config.json');

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



var colors = [
    // [255, 255, 255], // white
    [255, 0, 0], // red
    [0, 255, 0], // green
    [0, 0, 255], // blue
    [255, 220, 0], // yellow - has a reduced amount of green to remove green tint
    [255, 0, 255], // pink
    [0, 255, 255], // cyan
    [255, 90, 0], // orange - has a reduced amount of green to make less yellowy
];
var faces = ['top', 'front', 'left', 'right', 'back', 'bottom'];

var ConnectedClient = function (clientId, socket) {
    this.clientId = clientId;
    this.socket = socket;
    this.startColorIndex = Math.floor(Math.random() * colors.length);
    do {
        this.endColorIndex = Math.floor(Math.random() * colors.length);
    } while (this.startColorIndex == this.endColorIndex);
    this.selectedFace = 'front';

    console.log('client ' + this.clientId + ' connected');

    this.initMsgReceivers();
}
util.inherits(ConnectedClient, EventEmitter);

ConnectedClient.prototype.initMsgReceivers = function () {
    this.socket.on('activate', function (coords) {
        this.emit('activate', {
            id: this.clientId,
            coords: coords
        });
    }.bind(this));

    this.socket.on('deactivate', function (coords) {
        this.emit('deactivate', {
            id: this.clientId,
            coords: coords
        });
    }.bind(this));

    this.socket.on('nyan', function (coords) {
        this.emit('nyan', {
            id: this.clientId,
            coords: coords
        });
    }.bind(this));

    this.socket.on('faceselect', function (face) {
        if (faces.indexOf(face) !== -1) {
            this.selectedFace = face;
        }
    }.bind(this));

    this.socket.on('colorselect', function (data) {
        if (data.isStartColor) {
            this.startColorIndex = data.colorIndex;
        } else {
            this.endColorIndex = data.colorIndex;
        }
    }.bind(this));
}

ConnectedClient.prototype.setSocket = function (socket) {
    this.socket.removeAllListeners();
    this.socket = socket;
    this.initMsgReceivers();
}

ConnectedClient.prototype.send = function (message, data) {
    this.socket.emit(message, data);
}

ConnectedClient.prototype.sendWelcome = function() {
    /* Client handshaking procedure
     * Client sends "join" to server, which will have either null or a client ID as data.
     * If the client sends an ID, the server reconnects the client to an existing ConnectedClient, or
     * If the client doesn't send an ID, the server allocates them one
     * The server then sends the client "welcome" along with their ID and other app data
     */
    this.socket.emit('welcome', {
        app: 'DotField',
        id: this.clientId,
        colors: colors,
        startColorIndex: this.startColorIndex,
        endColorIndex: this.endColorIndex,
        face: this.selectedFace
    });
}
























function randomInRange(min, max) {
    return Math.floor((Math.random() * (max-min)) + min);
}





var cubeManager = new CubeClientManager(config);
var dfServer = new DotFieldServer(io, cubeManager, config.inactivityAutopilotStart || 10);

