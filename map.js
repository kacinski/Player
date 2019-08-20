

let wobbleSpeed = 8, wobbleDist = 0.07;

let actorChars = {
    "@": Player,
    "%": Owl,
    "o": Coin,
    "=": Lava, "|": Lava, "v": Lava
};

function Vector(x, y) {
    this.x = x; this.y = y;
}

Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
    return new Vector(this.x * factor, this.y * factor);
};

//Level

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
            else if (ch === "x")
                fieldType = "wall";
            else if (ch === "!")
                fieldType = "lava";
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }

    this.player = this.actors.filter(function(actor) {
        return actor.type === "player";
    })[0];
    this.status = this.finishDelay = null;
}

Level.prototype.isFinished = function() {
    return this.status != null && this.finishDelay < 0;
};

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

Level.prototype.obstacleAi = function(pos, size) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);
    let line = pos.y + 1;
    let cliff = xStart +1;
    if (xStart < 0 || xEnd > this.width || yStart < 0)
        return "wall";
    if(!this.grid[line][cliff] || !this.grid[line][xStart])
        return "wall";


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
    if (type === "lava" && this.status === null) {
        this.status = "lost";
        this.finishDelay = 1;
    }else if(type === "owl" && this.status === null){
        this.actors = this.actors.filter(function(other) {
            return other != actor;
        });
    }else if (type === "coin") {
        this.actors = this.actors.filter(function(other) {
            return other != actor;
        });
        if (!this.actors.some(function(actor) {
            return actor.type === "coin";
        })) {
            this.status = "won";
            this.finishDelay = 1;
        }
    }
};

//The player

function Player(pos) {
    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
}

let playerXSpeed = 7;

Player.prototype.type = "player";

Player.prototype.moveX = function(step, level, keys) {
    this.speed.x = 0;
    if (keys.left) this.speed.x -= playerXSpeed;
    if (keys.right) this.speed.x += playerXSpeed;

    let motion = new Vector(this.speed.x * step, 0);
    let newPos = this.pos.plus(motion);
    let obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle)
        level.playerTouched(obstacle);
    else
        this.pos = newPos;
};

let gravity = 30;
let jumpSpeed = 17;

Player.prototype.moveY = function(step, level, keys) {
    this.speed.y += step * gravity;
    let motion = new Vector(0, this.speed.y * step);
    let newPos = this.pos.plus(motion);
    let obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) {
        level.playerTouched(obstacle);
        if (keys.up && this.speed.y > 0){
            this.speed.y = -jumpSpeed;
        }
        else
            this.speed.y = 0;
    } else {
        this.pos = newPos;
    }
};

Player.prototype.act = function(step, level, keys) {
    this.moveX(step, level, keys);
    this.moveY(step, level, keys);

    let otherActor = level.actorAt(this);
    if (otherActor)
        level.playerTouched(otherActor.type, otherActor);

    // Losing animation
    if (level.status === "lost") {
        this.pos.y += step;
        this.size.y -= step;
    }
};

// The owl

function Owl(pos, ch){
    this.pos = pos;
    this.size = new Vector(1, 1);
    if(ch === "%"){
        this.speed = new Vector(3, 0);
    }
}

Owl.prototype.type = "owl";

// Owl.prototype.moveX = function(step, level) {
//
//     this.speed.x = 2;
//     let motion = new Vector(this.speed.x * step, 0);
//     let newPos = this.pos.plus(motion);
//     let obstacle = level.obstacleAi(newPos, this.size);
//     if (obstacle)
//         this.speed = this.speed.times(-1);
//     else
//         this.pos = newPos;
// };

// Owl.prototype.moveY = function(step, level) {
// //     this.speed.y = 1;
// //     let newPos = this.pos.plus(this.speed.times(step));
// //
// //     let obstacle = level.obstacleAi(newPos, this.size);
// //     if (obstacle)
// //         level.playerTouched(obstacle);
// //     else
// //         this.pos = newPos;
// // };

Owl.prototype.act = function(step, level) {
    let newPos = this.pos.plus(this.speed.times(step));

    if (!level.obstacleAi(newPos, this.size)){
        this.pos = newPos;
    }
    else
        this.speed = this.speed.times(-1);
    // this.moveX(step, level);
    // this.moveY(step, level);

};



// Lava

function Lava(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch === "=") {
        this.speed = new Vector(2, 0);
    } else if (ch === "|") {
        this.speed = new Vector(0, 2);
    } else if (ch === "v") {
        this.speed = new Vector(0, 3);
        this.repeatPos = pos;
    }
}
Lava.prototype.type = "lava";

Lava.prototype.act = function(step, level) {
    let newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};

// Coin

function Coin(pos) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";

Coin.prototype.act = function(step) {
    this.wobble += step * wobbleSpeed;
    let wobblePos = Math.sin(this.wobble) * wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
};
