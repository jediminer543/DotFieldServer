var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Fires an event when the "reset" method hasn't been called for <idleTime> milliseconds.
 */
var IdleTrigger = function(idleTime) {
    this.idleTime = idleTime;
    this.enabled = true;
    this.reset();
}
util.inherits(IdleTrigger, EventEmitter);

IdleTrigger.prototype.raiseEvent = function() {
    this.emit('idled');
}

IdleTrigger.prototype.reset = function() {
    if (!this.enabled) return;

    clearTimeout(this.timer);
    this.timer = setTimeout(this.raiseEvent.bind(this), this.idleTime);
}

IdleTrigger.prototype.disable = function() {
    this.enabled = false;
    clearTimeout(this.timer);
}

IdleTrigger.prototype.enable = function() {
    this.enabled = true;
    this.reset();
}

module.exports = IdleTrigger;