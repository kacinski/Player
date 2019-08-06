
Lava.prototype.act = function(step, level) {
    let newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};

let wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.act = function(step) {
    this.wobble += step * wobbleSpeed;
    let wobblePos = Math.sin(this.wobble) * wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

let playerXSpeed = 7;

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
        if (keys.up && this.speed.y > 0)
            this.speed.y = -jumpSpeed;
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
    if (level.status == "lost") {
        this.pos.y += step;
        this.size.y -= step;
    }
};

function trackKeys(codes) {
    let pressed = Object.create(null);
    function handler(event) {
        if (codes.hasOwnProperty(event.keyCode)) {
            let down = event.type == "keydown";
            pressed[codes[event.keyCode]] = down;
            event.preventDefault();

        }
    }
    addEventListener("keydown", handler);
    addEventListener("keyup", handler);
    return pressed;
}

let arrowCodes = {37: "left", 38: "up", 39: "right"};

let arrows = trackKeys(arrowCodes);

function runLevel(level, Display, andThen) {
    let display = new Display(document.body, level);
    runAnimation(function(step) {
        level.animate(step, arrows);
        display.drawFrame(step);
        if (level.isFinished()) {
            display.clear();
            if (andThen)
                andThen(level.status);
            return false;
        }
    });
}

function runGame(plans, Display) {
    function startLevel(n) {
        runLevel(new Level(plans[n]), Display, function(status) {
            if (status == "lost")
                startLevel(n);
            else if (n < plans.length - 1)
                startLevel(n + 1);
            else
                console.log("You win!");
        });
    }
    startLevel(0);
}

function runAnimation(frameFunc) {
    let lastTime = null;
    function frame(time) {
        let stop = false;
        if (lastTime != null) {
            let timeStep = Math.min(time - lastTime, 100) / 1000;
            stop = frameFunc(timeStep) === false;
        }
        lastTime = time;
        if (!stop)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
