var util = require('util');
var EventEmitter = require('events').EventEmitter;

var EventedWebSocket = function (ws) {
    this.ws = ws;

    this.ws.on('message', function (message) {
    	this.emit('message', message); // send the raw message just in case it's wanted
    	
        var msgParts = message.split('|', 1);
        if (msgParts.length == 1) {
            this.emit(msgParts[0]);
        } else {
            this.emit(msgParts[0], JSON.parse(msgParts[1]));
        }
    }.bind(this));
}

util.inherits(EventedWebSocket, EventEmitter);

// Emit an "event" through the Websocket connection
EventedWebSocket.prototype.send = function (event, data) {
    if (typeof data === 'undefined') {
        this.ws.send(event);
    } else {
        this.ws.send(event + '|' + JSON.stringify(data));
    }
}


module.exports = EventedWebSocket;