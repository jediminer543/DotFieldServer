var Grid = function(size, containerElem) {
    this.size = size; // grid size
    this.container = containerElem; // the DOM element that will contain the grid
    this.cells = [];

    for (x=0; x<this.size; x++) {
        this.cells[x] = [];
        for (y=0; y<this.size; y++) {
            this.cells[x][y] = new Cell(x, y);
            this.cells[x][y].bind('activate', this.cellActivated.bind(this));
            this.cells[x][y].bind('deactivate', this.cellDeactivated.bind(this));
        }
    }

    // Insert all cells into the DOM
    this.domGrid = $('<div class="grid"></div>');
    this.cells.forEach(function (row) {
        this.domGrid.append(this.createDOMRow(row));
    }.bind(this));
    this.container.append(this.domGrid);

    // Handle touch events to emulate touchEnter or touchLeave behaviour
    new TouchDrag(document.body);
}

Grid.prototype.createDOMRow = function(rowOfCells) {
    var row = $('<div class="row" draggable="false"></div>');
    row.append(rowOfCells.map(function(c) { return c.element; }));
    return row;
}

Grid.prototype.cellActivated = function (cellCoord) {
    console.log('activate', cellCoord);
    this.trigger('activate', cellCoord);
}

Grid.prototype.cellDeactivated = function (cellCoord) {
    console.log('deactivate', cellCoord);
    this.trigger('deactivate', cellCoord);
}

Grid.prototype.activateCell = function (x, y) {
    console.log('incoming activate', x, y);
    this.cells[x][y].activate();
}

Grid.prototype.deactivateCell = function (x, y) {
    console.log('incoming deactivate', x, y);
    this.cells[x][y].deactivate();
}

MicroEvent.mixin(Grid);
