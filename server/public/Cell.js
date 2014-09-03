var Cell = function(x, y) {
    this.x = x;
    this.y = y;
    this.element = $('<div class="cell"></div>');

    this.element.get(0).addEventListener('mousedown', function() {
        this.element.addClass('active');
    }.bind(this));

    this.element.get(0).addEventListener('mouseup', function() {
        this.element.removeClass('active');
    }.bind(this));
}

Cell.prototype.attachTouchUpHandler = function (callback /* x, y */) {
    callback.bind(this, this.x, this.y);
    this.element.get(0).addEventListener('click', callback.bind(this, this.x, this.y));
}