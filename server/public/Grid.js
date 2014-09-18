var Grid = function(size, containerElem) {
    this.size = size; // grid size
    this.container = containerElem; // the DOM element that will contain the grid
    this.cells = [];

    for (row=0; row<this.size; row++) {
        this.cells[row] = [];
        for (col=0; col<this.size; col++) {
            this.cells[row][col] = new Cell(row, col);
            this.cells[row][col].bind('activate', this.cellActivated.bind(this));
            this.cells[row][col].bind('deactivate', this.cellDeactivated.bind(this));
        }
    }

    // Insert all cells into the DOM
    this.domGrid = $('<div class="grid"></div>');
    this.cells.forEach(function (row) {
        this.domGrid.append(this.createDOMRow(row));
    }.bind(this));
    this.container.append(this.domGrid);

    // Handle touch events to emulate touchEnter or touchLeave behaviour
    new TouchDrag($('#gridContainer').get(0));
}

Grid.prototype.createDOMRow = function(rowOfCells) {
    var row = $('<div class="row" draggable="false"></div>');
    row.append(rowOfCells.map(function(c) { return c.element; }));
    return row;
}

Grid.prototype.cellActivated = function (cellCoord) {
    this.trigger('activate', cellCoord);
}

Grid.prototype.cellDeactivated = function (cellCoord) {
    this.trigger('deactivate', cellCoord);
}

Grid.prototype.activateCell = function (row, col) {
    console.log('incoming activate (row/col)', row, col);
    this.cells[row][col].activate();
}

Grid.prototype.deactivateCell = function (row, col) {
    console.log('incoming deactivate (row/col)', row, col);
    this.cells[row][col].deactivate();
}

MicroEvent.mixin(Grid);
