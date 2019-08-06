function Vector(x, y) {
    this.x = x; this.y = y;
}

Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
    return new Vector(this.x * factor, this.y * factor);
};

function DOMDisplay(parent, level) {
    this.wrap = parent.appendChild(elt("div", "game"));
    this.level = level;

    this.wrap.appendChild(this.drawBackground());
    this.actorLayer = null;
    this.drawFrame();
}

let scale = 20;

DOMDisplay.prototype.drawBackground = function() {
    let table = elt("table", "background");
    table.style.width = this.level.width * scale + "px";
    this.level.grid.forEach(function(row) {
        let rowElt = table.appendChild(elt("tr"));
        rowElt.style.height = scale + "px";
        row.forEach(function(type) {
            rowElt.appendChild(elt("td", type));
        });
    });
    return table;
};

DOMDisplay.prototype.drawActors = function() {
    let wrap = elt("div");
    this.level.actors.forEach(function(actor) {
        let rect = wrap.appendChild(elt("div",
            "actor " + actor.type));
        rect.style.width = actor.size.x * scale + "px";
        rect.style.height = actor.size.y * scale + "px";
        rect.style.left = actor.pos.x * scale + "px";
        rect.style.top = actor.pos.y * scale + "px";
    });
    return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
    if (this.actorLayer)
        this.wrap.removeChild(this.actorLayer);
    this.actorLayer = this.wrap.appendChild(this.drawActors());
    this.wrap.className = "game " + (this.level.status || "");
    this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
    let width = this.wrap.clientWidth;
    let height = this.wrap.clientHeight;
    let margin = width / 3;

    // The viewport
    let left = this.wrap.scrollLeft, right = left + width;
    let top = this.wrap.scrollTop, bottom = top + height;

    let player = this.level.player;
    let center = player.pos.plus(player.size.times(0.5))
        .times(scale);

    if (center.x < left + margin)
        this.wrap.scrollLeft = center.x - margin;
    else if (center.x > right - margin)
        this.wrap.scrollLeft = center.x + margin - width;
    if (center.y < top + margin)
        this.wrap.scrollTop = center.y - margin;
    else if (center.y > bottom - margin)
        this.wrap.scrollTop = center.y + margin - height;
};
DOMDisplay.prototype.clear = function() {
    this.wrap.parentNode.removeChild(this.wrap);
};
