/*
 * A kind-of polyfill for the touchEnter and touchLeave events which don't exist any more.
 * Allows you to start touching on an element and as the finger moves over other elements, call methods
 * informing the element when the finger is over it, and when the finger leaves it.
 *
 * Only DOM elements that have a 'jsObj' Javascript object property defined will have events triggered
 * on them. The MicroEvent library needs to be mixed into the receiving class for it to not crash.
 */
var TouchDrag = function(eventTarget) {
    this.eventTarget = eventTarget;

    this.currentTouches = {}; // touch identifiers => js object representing hovered DOM element

    this.eventTarget.addEventListener('touchstart', this._handleTouchStart.bind(this));
    this.eventTarget.addEventListener('touchmove', this._handleTouchMove.bind(this));
    this.eventTarget.addEventListener('touchend', this._handleTouchUp.bind(this));
    this.eventTarget.addEventListener('touchcancel', this._handleTouchUp.bind(this));
}

TouchDrag.prototype._handleTouchStart = function (event) {
    // TODO: handle multiple touches?
    var touchEv = event.changedTouches[0];
    var hoverElem = document.elementFromPoint(touchEv.pageX, touchEv.pageY);

    if ('jsObj' in hoverElem) {
        // we have touched on a cell
        this.currentTouches[touchEv.identifier] = hoverElem.jsObj; // save the current cell
        hoverElem.jsObj.trigger('tdActivate');
    } else {
        // we have touched on a non-cell
        this.currentTouches[touchEv.identifier] = null;
    }
}

TouchDrag.prototype._handleTouchMove = function (event) {
    var touchEv = event.changedTouches[0];
    var ident = touchEv.identifier;
    var hoverElem = document.elementFromPoint(touchEv.pageX, touchEv.pageY);

    // possible options:
    // moved from cell to different cell
    // moved from non-cell to cell
    // moved from cell to non-cell
    // moved from cell to same cell - do nothing
    // moved from non-cell to non-cell - we don't care

    if (this.currentTouches[ident] != null && hoverElem != null && 'jsObj' in hoverElem && this.currentTouches[ident] != hoverElem.jsObj) {
        // moved from cell to different cell
        this.currentTouches[ident].trigger('tdDeactivate');
        hoverElem.jsObj.trigger('tdActivate');
        this.currentTouches[ident] = hoverElem.jsObj;
    } else if (this.currentTouches[ident] == null && hoverElem != null && 'jsObj' in hoverElem) {
        // moved from non-cell to cell
        hoverElem.jsObj.trigger('tdActivate');
        this.currentTouches[ident] = hoverElem.jsObj;
    } else if (this.currentTouches[ident] != null && (hoverElem == null || !('jsObj' in hoverElem))) {
        // moved from cell to non-cell
        this.currentTouches[ident].trigger('tdDeactivate');
        this.currentTouches[ident] = null;
    }
}

TouchDrag.prototype._handleTouchUp = function (event) {
    var touchEv = event.changedTouches[0];
    var ident = touchEv.identifier;

    if (ident in this.currentTouches && this.currentTouches[ident] != null) {
        // we have removed a finger, and it was on a cell when it lifted up
        this.currentTouches[ident].trigger('tdDeactivate');
        delete this.currentTouches[ident];
    }
}