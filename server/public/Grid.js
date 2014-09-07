var Grid = function(size, containerElem) {
    this.size = size; // grid size
    this.container = containerElem; // the DOM element that will contain the grid
    this.cells = [];

    for (x=0; x<this.size; x++) {
        this.cells[x] = [];
        for (y=0; y<this.size; y++) {
            this.cells[x][y] = new Cell(x, y);
            this.cells[x][y].attachTouchUpHandler(this.cellTapped);
        }
    }

    // Insert all cells into the DOM
    this.domGrid = $('<div class="grid"></div>');
    this.cells.forEach(function (row) {
        this.domGrid.append(this.createDOMRow(row));
    }.bind(this));
    this.container.append(this.domGrid);
}

Grid.prototype.createDOMRow = function(rowOfCells) {
    var row = $('<div class="row" draggable="false"></div>');
    row.append(rowOfCells.map(function(c) { return c.element; }));
    return row;
}

Grid.prototype.cellTapped = function(x, y) {
    console.log(x, y);
}