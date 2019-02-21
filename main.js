// FPS
const FPS = 30;

const ship_Size = 30; //ship height
const turn_Speed = 360; // Turn Speed in deg per second
const ship_thrust = 5 // acceleartion in pixels per second per second
const friction = 0.7 // friction coefficient


/** @type {HTMLCanvasElement} */
let canv = document.getElementById("gameCanvas")
let ctx = canv.getContext("2d")

//  Ship Object
let ship = {
    //  Starting Position
    x: canv.width / 2,
    y: canv.height / 2,
    //  Heading
    a: 90 / 180 * Math.PI, //    Convert To Radians
    // size: 30,
    r: ship_Size / 2,
    rot: 0,
    thrusting: false,
    thrust: {
        x:0,
        y:0
    }
}

//  Update Game
const update = () => {
    //  Draw Background
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canv.width, canv.height)

    //  Thrust Ship
    if (ship.thrusting){
        ship.thrust.x += ship_thrust * Math.cos(ship.a) / FPS
        ship.thrust.y -= ship_thrust * Math.sin(ship.a) / FPS
    } else {
        ship.thrust.x -= friction * ship.thrust.x / FPS
        ship.thrust.y -= friction * ship.thrust.y / FPS
    }


    //  Draw Player
    ctx.strokeStyle = "white"
    ctx.lineWidth = ship_Size / 20
    ctx.beginPath()
    ctx.moveTo( //  Nose Of Ship
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    )
    ctx.lineTo( //  Rear Left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    )
    ctx.lineTo( //Rear Right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    )
    ctx.closePath();
    ctx.stroke()


    //  Rotate Player
    ship.a += ship.rot;


    //  Move Player
    ship.x += ship.thrust.x
    ship.y += ship.thrust.y
    //  Centre Dot
    ctx.fillStyle = "red"
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
}


const keyDown = ( /** @type {KeyboardEvent} */ ev) => {
    switch (ev.keyCode) {
        case 37: // Left Arrow (Rotate Left)
            ship.rot = turn_Speed / 180 * Math.PI / FPS
            break;
        case 38: // Up Arrow (Forward)
            ship.thrusting = true

            break;
        case 39: // Right Arrow (Rotate Right)
            ship.rot = -turn_Speed / 180 * Math.PI / FPS
            break;
    }
}

const keyUp = ( /** @type {KeyboardEvent} */ ev) => {
    switch (ev.keyCode) {
        case 37: // Left Arrow (Stop Rotate Left)
            ship.rot = 0
            break;
        case 38: // Up Arrow (Stop Forward)
            ship.thrusting = false
            break;
        case 39: // Right Arrow (Stop Rotate Right)
            ship.rot = 0
            break;
    }
}

//  Event Handlers
document.addEventListener("keydown", keyDown)
document.addEventListener("keyup", keyUp)


//  Game Loop

setInterval(update, 1000 / FPS);