var Cell = function(x, y) {
    this.x = x;
    this.y = y;
    this.element = $('<div class="cell" draggable="false"></div>');

    this.element.get(0).addEventListener('mousedown', function() {
        this.element.addClass('active');
    }.bind(this));

    this.element.get(0).addEventListener('mouseup', function() {
        this.element.removeClass('active');
    }.bind(this));

    this.element.get(0).addEventListener('mouseover', function (event) {
        if (event.which != 0) {
            // user is dragging
            this.element.addClass('active');
        }
        console.log(event);
    }.bind(this));

    this.element.get(0).addEventListener('mouseout', function (event) {
        this.element.removeClass('active');
    }.bind(this));

    // this.element.get(0).addEventListener('touchstart', function (event) {
    //     console.log('touchstart', event);
    // });

    // this.element.get(0).addEventListener('touchmove', function (event) {
    //     console.log('touchmove', event);
    // });

    // this.element.get(0).addEventListener('touchend', function (event) {
    //     console.log('touchend', event);
    // });
}

Cell.prototype.attachTouchUpHandler = function (callback /* x, y */) {
    callback.bind(this, this.x, this.y);
    this.element.get(0).addEventListener('click', callback.bind(this, this.x, this.y));
}