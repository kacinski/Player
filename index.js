let simpleLevelPlan = [
    "                      ",
    "                      ",
    "  x              = x  ",
    "  x         o o    x  ",
    "  x @      xxxxx   x  ",
    "  xxxxx            x  ",
    "      x!!!!!!!!!!!!x  ",
    "      xxxxxxxxxxxxxx  ",
    "                      "
];

let actorChars = {
    "@": Player,
    "o": Coin,
    "=": Lava, "|": Lava, "v": Lava
};

function Level(plan) {
    this.width = plan[0].length;
    this.height = plan.length;
    this.grid = [];
    this.actors = [];

    for (let y = 0; y < this.height; y++) {
        let line = plan[y], gridLine = [];
        for (let x = 0; x < this.width; x++) {
            let ch = line[x], fieldType = null;
            let Actor = actorChars[ch];
            if (Actor)
                this.actors.push(new Actor(new Vector(x, y), ch));
            else if (ch == "x")
                fieldType = "wall";
            else if (ch == "!")
                fieldType = "lava";
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }

    this.player = this.actors.filter(function(actor) {
        return actor.type == "player";
    })[0];
    this.status = this.finishDelay = null;
}

Level.prototype.isFinished = function() {
    return this.status != null && this.finishDelay < 0;
};


function Player(pos) {
    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
}

Level.prototype.obstacleAt = function(pos, size) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0)
        return "wall";
    if (yEnd > this.height)
        return "lava";
    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let fieldType = this.grid[y][x];
            if (fieldType) return fieldType;
        }
    }
};

Level.prototype.actorAt = function(actor) {
    for (let i = 0; i < this.actors.length; i++) {
        let other = this.actors[i];
        if (other != actor &&
            actor.pos.x + actor.size.x > other.pos.x &&
            actor.pos.x < other.pos.x + other.size.x &&
            actor.pos.y + actor.size.y > other.pos.y &&
            actor.pos.y < other.pos.y + other.size.y)
            return other;
    }
};

let maxStep = 0.05;

Level.prototype.animate = function(step, keys) {
    if (this.status != null)
        this.finishDelay -= step;

    while (step > 0) {
        let thisStep = Math.min(step, maxStep);
        this.actors.forEach(function(actor) {
            actor.act(thisStep, this, keys);
        }, this);
        step -= thisStep;
    }
};

Level.prototype.playerTouched = function(type, actor) {
    if (type == "lava" && this.status == null) {
        this.status = "lost";
        this.finishDelay = 1;
    } else if (type == "coin") {
        this.actors = this.actors.filter(function(other) {
            return other != actor;
        });
        if (!this.actors.some(function(actor) {
            return actor.type == "coin";
        })) {
            this.status = "won";
            this.finishDelay = 1;
        }
    }
};

Player.prototype.type = "player";

function Lava(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "=") {
        this.speed = new Vector(2, 0);
    } else if (ch == "|") {
        this.speed = new Vector(0, 2);
    } else if (ch == "v") {
        this.speed = new Vector(0, 3);
        this.repeatPos = pos;
    }
}
Lava.prototype.type = "lava";

function Coin(pos) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

let simpleLevel = new Level(simpleLevelPlan);
console.log(simpleLevel.width, "by", simpleLevel.height);

function elt(name, className) {
    let elt = document.createElement(name);
    if (className) elt.className = className;
    return elt;
}








