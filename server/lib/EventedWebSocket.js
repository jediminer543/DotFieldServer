var util = require('util');
var EventEmitter = require('events').EventEmitter;

var EventedWebSocket = function (ws) {
    this.ws = ws;

    this.ws.on('message', function (messageBuffer) {
        const messageText = messageBuffer.toString();
    	this.emit('message', messageText); // send the raw message just in case it's wanted
    	
        var msgParts = messageText.split('|', 1);
        if (msgParts.length == 1) {
            this.emit(msgParts[0]);
        } else {
            this.emit(msgParts[0], JSON.parse(msgParts[1]));
        }
    }.bind(this));
}

util.inherits(EventedWebSocket, EventEmitter);

// Emit an "event" through the Websocket connection
EventedWebSocket.prototype.send = function (event, data, callback /* error */) {
    if (typeof data === 'undefined') {
        var dataToSend = event;
    } else {
        var dataToSend = event + '|' + JSON.stringify(data);
    }

    this.ws.send(dataToSend, function (err) {
        if (callback) {
            callback(err || null);
        }
    });
}


module.exports = EventedWebSocket;