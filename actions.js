let onplay = false;

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
    if (level.status === "lost") {
        this.pos.y += step;
        this.size.y -= step;
    }
};

function trackKeys(codes) {
    let pressed = Object.create(null);
    function handler(event) {
        if (codes.hasOwnProperty(event.keyCode)) {
            let down = event.type === "keydown";
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


function resume() {
    document.body.style.background = "white";
    return check = true;
}
function pause(){
    document.body.style.background = "grey";
    return check = false;
}

function runLevel(level, Display, andThen) {
    let display = new Display(document.body, level);

    runAnimation(function(step) {
        if(!check) return;
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
resume();

    function runGame(plans, Display) {

        if(!onplay) {
        let lifes = 3;

        function startLevel(n) {
            onplay = true;
            if (lifes > 0) {
                runLevel(new Level(plans[n]), Display, function (status) {

                    if (status === "lost") {
                        lifes = lifes - 1;
                        startLevel(n);
                        if (lifes === 0) {
                            let conf = confirm("You loose! Try new game?");
                            if (!conf) {
                                location.reload();
                            } else {
                                startLevel(0);
                            }

                        }
                    } else if (n < plans.length - 1)
                        startLevel(n + 1);
                    else
                        alert("You win!");
                });
            }
            document.getElementById("lifes").innerHTML = lifes.toString();

        }

        startLevel(0);
    }
}
