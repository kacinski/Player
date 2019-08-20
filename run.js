let onplay = false;

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
    let arrows = trackKeys(arrowCodes);

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
                                onplay = false;
                                runGame(GAME_LEVELS, DOMDisplay);
                            }

                        }
                    }else if (n < plans.length - 1)
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
