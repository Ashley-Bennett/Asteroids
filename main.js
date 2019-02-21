// FPS
const FPS = 30;

const ship_Size = 30; //ship height
const turn_Speed = 360; // Turn Speed in deg per second
const ship_thrust = 5 // acceleartion in pixels per second per second
const friction = 0.7 // friction coefficient
const roids_Num = 3 //starting asteroids
const roids_Jag = 0.3 //jaggedness of asteroids 0 = none 1 = lots
const roids_Speed = 50 // max speed
const roids_Size = 100 // starting size of asteroids
const roids_Vert = 10 //average sides (verts)

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
        x: 0,
        y: 0
    }
}

//  Asteroids object

let roids = [];

const newAsteroid = (x, y) => {
    let roid = {
        x: x,
        y: y,
        xv: Math.random() * roids_Speed / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * roids_Speed / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: roids_Size / 2,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (roids_Vert + 1) + roids_Vert / 2),
        offs: []
    }

    //create offset array
    for (let i = 0; i < roid.vert; i++){
        roid.offs.push(Math.random() * roids_Jag * 2 + 1 - roids_Jag)
    }
    return roid
}




const distBetweenPoints = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 -x1, 2) + Math.pow(y2 - y1, 2))
}

const createAsteroidsBelt = () => {
    roids = [];
    let x, y;
    for (let i = 0; i < roids_Num; i++) {
        do{
        x = Math.floor(Math.random() * canv.width)
        y = Math.floor(Math.random() * canv.height)
        } while (distBetweenPoints(ship.x, ship.y, x, y) < roids_Size * 2 + ship.r)
        roids.push(newAsteroid(x, y))
    }
}



createAsteroidsBelt()

//  Update Game
const update = () => {
    //  Draw Background
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canv.width, canv.height)

    //  Thrust Ship
    if (ship.thrusting) {
        ship.thrust.x += ship_thrust * Math.cos(ship.a) / FPS
        ship.thrust.y -= ship_thrust * Math.sin(ship.a) / FPS
        // draw thruster
        // ctx.fillStyle = "red"
        ctx.strokeStyle = "orange"
        ctx.lineWidth = ship_Size / 20
        ctx.beginPath()
        ctx.moveTo( //  rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.7 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.7 * Math.cos(ship.a))
        )
        ctx.lineTo( //  Rear centre
            ship.x - 4 / 3 * ship.r * Math.cos(ship.a),
            ship.y + 4 / 3 * ship.r * Math.sin(ship.a)
        )
        ctx.lineTo( //Rear Right
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.7 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.7 * Math.cos(ship.a))
        )
        // ctx.closePath();
        // ctx.fill()
        ctx.stroke()
    } else {
        ship.thrust.x -= friction * ship.thrust.x / FPS
        ship.thrust.y -= friction * ship.thrust.y / FPS
    }

    //  Edge of screen
    if (ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r
    } else if (ship.x > canv.width + ship.r) {
        ship.x = 0 - ship.r
    }
    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r
    } else if (ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r
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


    //Draw Asteroids
    ctx.strokeStyle = "white"
    ctx.lineWidth = ship_Size / 10
    let x, y, r, a, vert, offs;
    for (let i = 0; i < roids.length; i++) {
        //get asteroids properties
        x = roids[i].x
        y = roids[i].y
        r = roids[i].r
        a = roids[i].a
        vert = roids[i].vert
        offs = roids[i].offs
        // draw a path
        ctx.beginPath()
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a),
        )

        //draw polygon
        for (let j = 1; j < vert; j++){
            ctx.lineTo(
                x + r * offs[j] * Math.cos( a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin( a + j * Math.PI * 2 / vert)
            )
        }
        ctx.closePath()
        ctx.stroke()

        //move asteroid
        roids[i].x += roids[i].xv
        roids[i].y += roids[i].yv

        //handle edge of screen
        if (roids[i].x < 0 - roids[i].r){
            roids[i].x = canv.width + roids[i].r
        } else  if (roids[i].x > canv.width + roids[i].r){
            roids[i].x = 0 - roids[i].r
        }
        if (roids[i].y < 0 - roids[i].r){
            roids[i].y = canv.height + roids[i].r
        } else  if (roids[i].y > canv.height + roids[i].r){
            roids[i].y = 0 - roids[i].r
        }
        

        



        
    }


    //  Rotate Player
    ship.a += ship.rot;


    //  Move Player
    ship.x += ship.thrust.x
    ship.y += ship.thrust.y
    //  Centre Dot
    ctx.fillStyle = "red"
    // ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
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