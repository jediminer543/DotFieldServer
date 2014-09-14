var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var WebSocketServer = require('ws').Server;
var EventedWebSocket = require('./EventedWebSocket');

var config = require('../config.json');

var WEB_PORT = 47284;

app.set('view engine', 'ejs');
app.set('port', process.env.PORT || WEB_PORT);
app.use(express.static(__dirname + '/public'));

server.listen(app.get('port'), function() {
    console.log('Web server listening on port %d', server.address().port);
});

app.get('/', function (req, res) {
    res.render('index', {config: config});
});



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
    this.colorIndex = Math.floor(Math.random() * colors.length);

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
        app: 'GravityBlocks',
        id: this.clientId,
        colors: colors,
        colorIndex: this.colorIndex
    });
}



var GravityServer = function (io, cubeManager) {
    this.clients = {};
    this.burnedClientIds = [];
    this.cubeManager = cubeManager; // used to communicate with connected cube(s)

    io.on('connection', this.onClientConnected.bind(this));
}

GravityServer.prototype.getNextClientId = function () {
    var randomStr = null;
    do {
        randomStr = (+new Date * Math.random()).toString(36).replace('.', '')
    } while (this.burnedClientIds.indexOf(randomStr) > -1);

    this.burnedClientIds.push(randomStr);

    return randomStr;
}

GravityServer.prototype.onClientConnected = function (socket) {
    socket.on('join', function (id) {
        if (id == null) {
            // This is a new client
            id = this.getNextClientId();
            var clientObj = new ConnectedClient(id, socket);

            clientObj.on('activate', function (data) {
                var payload = {
                    color: clientObj.colorIndex,
                    coords: data.coords
                };
                this.broadcastToClients('activate', payload, clientObj.clientId);
                this.cubeManager.sendToCubes('activate', payload);
            }.bind(this));

            clientObj.on('deactivate', function (data) {
                var payload = {
                    coords: data.coords
                };
                this.broadcastToClients('deactivate', payload, clientObj.clientId);
                this.cubeManager.sendToCubes('deactivate', payload);
            }.bind(this));

            this.clients[id] = clientObj;
        } else {
            // This client says it has been connected before, and is reconnecting
            // The server may have been restarted, so check that the client exists before blindly reconnecting them
            if (id in this.clients) {
                console.log('client ' + id + ' reconnected');
                this.clients[id].setSocket(socket);
            } else {
                // This client hasn't been seen before, so the server has probably been restarted.
                // Tell the client to reload the page
                socket.emit('restart');
                return;
            }
        }

        this.clients[id].sendWelcome();
    }.bind(this));
}

GravityServer.prototype.broadcastToClients = function (message, data, exceptClientId) {
    exceptClientId = exceptClientId || -1;
    Object.keys(this.clients).forEach(function (clientId) {
        var client = this.clients[clientId];
        if (client.clientId == exceptClientId) return;

        client.send(message, data);
    }.bind(this));
}






var CubeClientManager = function(config) {
    this.wss = new WebSocketServer({port: config.cubeClientPort});

    this.connectedCubes = [];

    this.wss.on('connection', function (ws) {
        var ews = new EventedWebSocket(ws);
        ews.on('hello', function() {
            console.log('Cube client connected');

            ews.send('welcome', {
                app: 'GravityBlocks',
                colors: colors
            });

            this.connectedCubes.push(ews);
        }.bind(this));
    }.bind(this));
}

/**
 * Emit an "event" with optional data object (it must be an object) to all connected cube clients
 */
CubeClientManager.prototype.sendToCubes = function (event, data) {
    this.connectedCubes.forEach(function (cubeEws) {
        cubeEws.send(event, data, function (err) {
            if (err) {
                // It doesn't matter what the error is, it'll be bad news regardless, so bin this client
                var idx = this.connectedCubes.indexOf(cubeEws);
                if (idx !== -1) {
                    this.connectedCubes.splice(idx, 1);
                    console.log('Cube client connection terminated due to error', err);
                }
            }
        }.bind(this));
    }.bind(this));
}








var cubeManager = new CubeClientManager(config);
var gServer = new GravityServer(io, cubeManager);

