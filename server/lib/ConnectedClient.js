var util = require('util');
var EventEmitter = require('events').EventEmitter;

var ConnectedClient = function (clientId, socket, faces, colors) {
    this.clientId = clientId;
    this.socket = socket;
    this.faces = faces;
    this.colors = colors;
    this.startColorIndex = Math.floor(Math.random() * this.colors.length);
    do {
        this.endColorIndex = Math.floor(Math.random() * this.colors.length);
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
        if (this.faces.indexOf(face) !== -1) {
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
        colors: this.colors,
        startColorIndex: this.startColorIndex,
        endColorIndex: this.endColorIndex,
        face: this.selectedFace
    });
}

module.exports = ConnectedClient;
