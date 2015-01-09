var EventedWebSocket = require('./EventedWebSocket');
var WebSocketServer = require('ws').Server;

var CubeClientManager = function(config, colors) {
    this.wss = new WebSocketServer({port: config.listenCubePort});
    this.colors = colors;
    console.log('Listening for Python pattern connection on port %d', config.listenCubePort);

    this.connectedCubes = [];

    this.wss.on('connection', function (ws) {
        var ews = new EventedWebSocket(ws);
        ews.on('hello', function() {
            console.log('Cube client connected');

            ews.send('welcome', {
                app: 'DotField',
                colors: this.colors
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

module.exports = CubeClientManager;