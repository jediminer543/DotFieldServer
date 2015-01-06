var IdleTrigger = require('./IdleTrigger');
var ConnectedClient = require('./ConnectedClient');
var FACES = ['top', 'front', 'left', 'right', 'back', 'bottom'];
var COLORS = [
    // [255, 255, 255], // white
    [255, 0, 0], // red
    [0, 255, 0], // green
    [0, 0, 255], // blue
    [255, 220, 0], // yellow - has a reduced amount of green to remove green tint
    [255, 0, 255], // pink
    [0, 255, 255], // cyan
    [255, 90, 0], // orange - has a reduced amount of green to make less yellowy
];

var DotFieldServer = function (io, cubeManager, inactivityAutopilotStart) {
    this.clients = {};
    this.burnedClientIds = [];
    this.cubeManager = cubeManager; // used to communicate with connected cube(s)

    // Setup Autopilot
    this.autopilotEnabled = false;
    this.autopilotIdleCounter = new IdleTrigger(inactivityAutopilotStart * 1000);
    this.autopilotIdleCounter.on('idled', this.enableAutopilot.bind(this));
    this.enableAutopilot();

    io.on('connection', this.onClientConnected.bind(this));
}

DotFieldServer.prototype.getNextClientId = function () {
    var randomStr = null;
    do {
        randomStr = (+new Date * Math.random()).toString(36).replace('.', '')
    } while (this.burnedClientIds.indexOf(randomStr) > -1);

    this.burnedClientIds.push(randomStr);

    return randomStr;
}

DotFieldServer.prototype.onClientConnected = function (socket) {
    socket.on('join', function (id) {
        if (id == null) {
            // This is a new client
            id = this.getNextClientId();
            var clientObj = new ConnectedClient(id, socket, FACES);

            clientObj.on('activate', function (data) {
                var clientPayload = {
                    color: clientObj.startColorIndex,
                    coords: data.coords,
                    face: clientObj.selectedFace
                };
                var cubePayload = {
                    startColorIndex: clientObj.startColorIndex,
                    endColorIndex: clientObj.endColorIndex,
                    coords: data.coords,
                    face: clientObj.selectedFace
                };
                var broadcastFilter = {
                    exceptClientId: clientObj.clientId,
                    face: clientObj.selectedFace
                };
                this.broadcastToClients('activate', clientPayload, broadcastFilter);
                this.cubeManager.sendToCubes('activate', cubePayload);
                this.disableAutopilot();
                this.autopilotIdleCounter.reset();
            }.bind(this));

            clientObj.on('deactivate', function (data) {
                var payload = {
                    coords: data.coords,
                    face: clientObj.selectedFace
                };
                var broadcastFilter = {
                    exceptClientId: clientObj.clientId,
                    face: clientObj.selectedFace
                };
                this.broadcastToClients('deactivate', payload, broadcastFilter);
                // this.cubeManager.sendToCubes('deactivate', payload); // DotField doesn't actually use the deactivate event, so don't send it
                this.autopilotIdleCounter.reset();
            }.bind(this));

            clientObj.on('nyan', function (data) {
                var cubePayload = {
                    coords: data.coords,
                    face: clientObj.selectedFace
                };
                this.cubeManager.sendToCubes('nyan', cubePayload);
                this.disableAutopilot();
                this.autopilotIdleCounter.reset();
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

DotFieldServer.prototype.broadcastToClients = function (message, data, filter) {
    filter = filter || {};

    Object.keys(this.clients).forEach(function (clientId) {
        var client = this.clients[clientId];

        // Filter out a specific client
        if (filter.hasOwnProperty('exceptClientId') && client.clientId == filter.exceptClientId) return;

        // Filter clients on a specific face only
        if (filter.hasOwnProperty('face') && client.selectedFace != filter.face) return;

        client.send(message, data);
    }.bind(this));
}

/**
 * Turn Autopilot on.
 * Autopilot simulates random input, so the cube stays active and displays trails while nobody is
 * actually using it.
 * Autopilot mode is automatically disabled as soon as somebody starts interacting with it.
 * Autopilot mode is automatically enabled after a number of seconds of inactivity.
 */
DotFieldServer.prototype.enableAutopilot = function() {
    if (this.autopilotEnabled) return;

    this.autopilotEnabled = true;
    this.autopilotIdleCounter.disable();
    console.log('Autopilot engaged');

    this.autopilotInterval = setInterval(function() {
        var payload = {
            startColorIndex: randomInRange(0, COLORS.length),
            endColorIndex: randomInRange(0, COLORS.length),
            coords: {x: randomInRange(0, 8), y: randomInRange(0, 8)},
            face: FACES[randomInRange(0, FACES.length)]
        };

        this.cubeManager.sendToCubes('activate', payload);
    }.bind(this), 150);
}

DotFieldServer.prototype.disableAutopilot = function() {
    if (!this.autopilotEnabled) return;

    this.autopilotEnabled = false;
    this.autopilotIdleCounter.enable();
    console.log('Autopilot disengaged');

    clearInterval(this.autopilotInterval);
}

function randomInRange(min, max) {
    return Math.floor((Math.random() * (max-min)) + min);
}

module.exports = DotFieldServer;
