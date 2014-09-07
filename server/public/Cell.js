var Cell = function(x, y) {
    this.coord = {x: x, y: y};
    this.active = false; // is the cell currently being touched?
    this.element = $('<div class="cell" draggable="false"></div>');
    this.element.get(0).jsObj = this; // a bit hacky but it allows us to get a reference to the Cell from the DOM elem

    this.element.get(0).addEventListener('mousedown', function() {
        this.activate();
    }.bind(this));

    this.element.get(0).addEventListener('mouseup', function() {
        this.deactivate();
    }.bind(this));

    this.element.get(0).addEventListener('mouseover', function (event) {
        if (event.which != 0) {
            // user is dragging
            this.activate();
        }
        // console.log(event);
    }.bind(this));

    this.element.get(0).addEventListener('mouseout', function (event) {
        if (this.active) {
            this.deactivate();
        }
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
Cell.prototype.activate = function() {
    console.log('activated ' + this.coord.x + ', ' + this.coord.y);
    this.active = true;
    this.element.addClass('active');
}

Cell.prototype.deactivate = function() {
    console.log('deactivate ' + this.coord.x + ', ' + this.coord.y);
    this.active = false;
    this.element.removeClass('active');
}