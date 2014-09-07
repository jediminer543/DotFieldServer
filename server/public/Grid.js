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



    var currentTouches = {};

    // Attach touch events to the main grid
    this.domGrid.get(0).addEventListener('touchstart', function (event) {
        // TODO: handle multiple touches?
        var touchEv = event.changedTouches[0];
        var hoverElem = document.elementFromPoint(touchEv.pageX, touchEv.pageY);

        if ('jsObj' in hoverElem) {
            // we have touched on a cell
            currentTouches[touchEv.identifier] = hoverElem.jsObj; // save the current cell
            hoverElem.jsObj.activate();
        } else {
            // we have touched on a non-cell
            currentTouches[touchEv.identifier] = null;
        }
    });

    this.domGrid.get(0).addEventListener('touchmove', function (event) {
        var touchEv = event.changedTouches[0];
        var ident = touchEv.identifier;
        var hoverElem = document.elementFromPoint(touchEv.pageX, touchEv.pageY);

        // possible options:
        // moved from cell to different cell
        // moved from non-cell to cell
        // moved from cell to non-cell
        // moved from cell to same cell - do nothing
        // moved from non-cell to non-cell - we don't care

        if (currentTouches[ident] != null && hoverElem != null && 'jsObj' in hoverElem && currentTouches[ident] != hoverElem.jsObj) {
            // moved from cell to different cell
            currentTouches[ident].deactivate();
            hoverElem.jsObj.activate();
            currentTouches[ident] = hoverElem.jsObj;
        } else if (currentTouches[ident] == null && hoverElem != null && 'jsObj' in hoverElem) {
            // moved from non-cell to cell
            hoverElem.jsObj.activate();
            currentTouches[ident] = hoverElem.jsObj;
        } else if (currentTouches[ident] != null && (hoverElem == null || !('jsObj' in hoverElem))) {
            // moved from cell to non-cell
            currentTouches[ident].deactivate();
            currentTouches[ident] = null;
        }
    });

    this.domGrid.get(0).addEventListener('touchend', function (event) {
        var touchEv = event.changedTouches[0];
        var ident = touchEv.identifier;

        if (ident in currentTouches && currentTouches[ident] != null) {
            // we have removed a finger, and it was on a cell when it lifted up
            currentTouches[ident].deactivate();
            delete currentTouches[ident];
        }
    });

    // todo add touchcancel
}

Grid.prototype.createDOMRow = function(rowOfCells) {
    var row = $('<div class="row" draggable="false"></div>');
    row.append(rowOfCells.map(function(c) { return c.element; }));
    return row;
}

Grid.prototype.cellTapped = function(x, y) {
    console.log('cellTapped', x, y);
}