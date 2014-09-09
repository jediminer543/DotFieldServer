var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var WEB_PORT = 47284;

app.set('view engine', 'ejs');
app.set('port', process.env.PORT || WEB_PORT);
app.use(express.static(__dirname + '/public'));

server.listen(app.get('port'), function() {
    console.log('Web server listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// io.on('connection', function (socket) {
//     socket.emit('welcome', { app: 'GravityBlocks' });

//     socket.on('activate', function (data) {
//         console.log('activate', data);
//         socket.broadcast.emit('activate', {x: data.x, y: data.y});
//     });

//     socket.on('deactivate', function (data) {
//         console.log('deactivate', data);
//         socket.broadcast.emit('deactivate', {x: data.x, y: data.y});
//     });
// });



var colors = [
    [255, 255, 255], // white
    [255, 0, 0], // red
    [0, 255, 0], // green
    [0, 0, 255], // blue
    [255, 255, 0], // yellow
    [255, 0, 255], // pink
    [0, 255, 255], // cyan
    [255, 153, 0], // orange
];

var ConnectedClient = function (clientId, socket) {
    this.clientId = clientId;
    this.socket = socket;
    this.handshaken = false;
    this.colorIndex = Math.floor(Math.random() * colors.length);

    console.log('client ' + this.clientId + ' connected');

    /* Client handshaking procedure
     * Server sends client "welcome"
     * In response, client sends server "hello"
     */
    this.socket.emit('welcome', {
        app: 'GravityBlocks',
        id: this.clientId,
        colors: colors,
        colorIndex: this.colorIndex
    });

    this.socket.on('hello', function () {
        console.log('client ' + this.clientId + ' handshaken');
        this.handshaken = true;
        this.initMsgReceivers();
    }.bind(this));
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
}

ConnectedClient.prototype.send = function (message, data) {
    this.socket.emit(message, data);
}



var GravityServer = function (io) {
    this.clients = [];
    this.nextClientId = 1;

    io.on('connection', this.onClientConnected.bind(this));
}

GravityServer.prototype.getNextClientId = function () {
    return this.nextClientId++;
}

GravityServer.prototype.onClientConnected = function (socket) {
    var id = this.getNextClientId();
    var clientObj = new ConnectedClient(id, socket);

    clientObj.on('activate', function (data) {
        this.broadcastToClients(
            'activate',
            {
                color: clientObj.colorIndex,
                coords: data.coords
            },
            clientObj.clientId
        );
    }.bind(this));

    clientObj.on('deactivate', function (data) {
        this.broadcastToClients(
            'deactivate',
            {
                coords: data.coords
            },
            clientObj.clientId
        );
    }.bind(this));

    this.clients[id] = clientObj;
}

GravityServer.prototype.broadcastToClients = function (message, data, exceptClientId) {
    exceptClientId = exceptClientId || -1;
    this.clients.forEach(function (client) {
        if (client.clientId == exceptClientId) return;

        client.send(message, data);
    });
}







var gServer = new GravityServer(io);

