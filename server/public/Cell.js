var Cell = function(x, y) {
    this.coord = {x: x, y: y};
    this.element = $('<div class="cell" draggable="false"></div>');
    this.element.get(0).jsObj = this; // a bit hacky but it allows us to get a reference to the Cell from the DOM elem

    this.element.get(0).addEventListener('mousedown', function() {
        this.activated();
    }.bind(this));

    this.element.get(0).addEventListener('mouseup', function() {
        this.deactivated();
    }.bind(this));

    this.element.get(0).addEventListener('mouseover', function (event) {
        if (event.which != 0) {
            // user is dragging
            this.activated();
        }
        // console.log(event);
    }.bind(this));

    this.element.get(0).addEventListener('mouseout', function (event) {
        this.deactivated();
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
    callback.bind(this, this.coord.x, this.coord.y);
    this.element.get(0).addEventListener('click', callback.bind(this, this.coord.x, this.coord.y));
}

// The cell was pressed on/dragged over/clicked on. Basically, the event that
// should make the cell light up because it is being interacted with.
Cell.prototype.activated = function() {
    console.log('activated ' + this.coord.x + ', ' + this.coord.y);
    this.element.addClass('active');
}

Cell.prototype.deactivated = function() {
    console.log('deactivated ' + this.coord.x + ', ' + this.coord.y);
    this.element.removeClass('active');
}