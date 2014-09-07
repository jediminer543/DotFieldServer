var Cell = function(x, y) {
    this.coord = {x: x, y: y};
    this.active = false; // is the cell currently being touched?
    this.element = $('<div class="cell" draggable="false"></div>');
    this.element.get(0).jsObj = this; // a bit hacky but it allows us to get a reference to the Cell from the DOM elem

    this.element.get(0).addEventListener('mousedown', function() {
        this.activate(true);
    }.bind(this));

    this.element.get(0).addEventListener('mouseup', function() {
        this.deactivate(true);
    }.bind(this));

    this.element.get(0).addEventListener('mouseover', function (event) {
        if (event.which != 0) {
            // user is dragging
            this.activate(true);
        }
    }.bind(this));

    this.element.get(0).addEventListener('mouseout', function (event) {
        if (this.active) {
            this.deactivate(true);
        }
    }.bind(this));

    this.bind('tdActivate', this.activate.bind(this, true));
    this.bind('tdDeactivate', this.deactivate.bind(this, true));
}

// The cell was pressed on/dragged over/clicked on. Basically, the event that
// should make the cell light up because it is being interacted with.
// Called by TouchDrag
Cell.prototype.activate = function(refireEvent) {
    if (this.active) return;

    this.active = true;
    this.element.addClass('active');

    // Refire the event for the Grid class to listen to
    if (refireEvent) {
        this.trigger('activate', this.coord);
    }
}

// The cell has stopped being dragged over/touched. Called by TouchDrag
Cell.prototype.deactivate = function(refireEvent) {
    if (!this.active) return;

    this.active = false;
    this.element.removeClass('active');

    // Refire the event for the Grid class to listen to
    if (refireEvent) {
        this.trigger('deactivate', this.coord);
    }
}

MicroEvent.mixin(Cell);