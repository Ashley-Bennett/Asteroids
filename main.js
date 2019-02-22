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
const show_Bounding = false
const show_Centre_Dot = false
const ship_Explode_Dur = 0.3 // duration of explosion
const ship_Blink_Dur = 0.1 //blinking invincibility
const ship_Inv_Dur = 3 // invincibility
const laser_Max = 10 // max lasers on screen at once
const laser_Speed = 500 // speed of lasers in pixels per second
const laser_Dist = 0.4 // distance laser can travel 
const laser_Explode_Dur = 0.1 // duration of laser explosion





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
    explodeTime: 0,
    // size: 30,
    r: ship_Size / 2,
    canShoot: true,
    lasers: [],
    blinkTime: Math.ceil(ship_Blink_Dur * FPS),
    blinkNum: Math.ceil(ship_Inv_Dur / ship_Blink_Dur),
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}


let destroyAsteroid = (index) => {
    let x = roids[index].x
    let y = roids[index].y
    let r = roids[index].r

    //split asteroid in 2
    if (r == Math.ceil(roids_Size / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(roids_Size / 4)))
        roids.push(newAsteroid(x, y, Math.ceil(roids_Size / 4)))
    } else if (r == Math.ceil(roids_Size / 4)) {
        roids.push(newAsteroid(x, y, Math.ceil(roids_Size / 8)))
        roids.push(newAsteroid(x, y, Math.ceil(roids_Size / 8)))
    }

    //destroy asteroid
    roids.splice(index, 1)

}


//  Asteroids object

let roids = [];

const newAsteroid = (x, y, r) => {
    let roid = {
        x: x,
        y: y,
        xv: Math.random() * roids_Speed / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * roids_Speed / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (roids_Vert + 1) + roids_Vert / 2),
        offs: []
    }

    //create offset array
    for (let i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * roids_Jag * 2 + 1 - roids_Jag)
    }
    return roid
}




const distBetweenPoints = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

const createAsteroidsBelt = () => {
    roids = [];
    let x, y;
    for (let i = 0; i < roids_Num; i++) {
        do {
            x = Math.floor(Math.random() * canv.width)
            y = Math.floor(Math.random() * canv.height)
        } while (distBetweenPoints(ship.x, ship.y, x, y) < roids_Size * 2 + ship.r)
        roids.push(newAsteroid(x, y, Math.ceil(roids_Size / 2)))
    }
}

const explodeship = () => {
    ship.explodeTime = Math.ceil(ship_Explode_Dur * FPS)
    // ctx.fillStyle = "red"
    // ctx.strokeStyle = "yellow"
    // ctx.beginPath()
    // ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false)
    // ctx.fill()
    // ctx.stroke()
}

const newShip = () => {
    return {
        //  Starting Position
        x: canv.width / 2,
        y: canv.height / 2,
        //  Heading
        a: 90 / 180 * Math.PI, //    Convert To Radians
        explodeTime: 0,
        canShoot: true,
        lasers: [],
        // size: 30,
        r: ship_Size / 2,
        blinkTime: Math.ceil(ship_Blink_Dur * FPS),
        blinkNum: Math.ceil(ship_Inv_Dur / ship_Blink_Dur),
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }

}

const shootLaser = () => {
    // create laser object
    if (ship.canShoot && ship.lasers.length < laser_Max) {
        ship.lasers.push({ //from nose of ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: laser_Speed * Math.cos(ship.a) / FPS,
            yv: -laser_Speed * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        })
    }
    //prevent further shooting
    ship.canShoot = false
}

createAsteroidsBelt()

//  Update Game
const update = () => {
    let blinkOn = ship.blinkNum % 2 == 0
    let exploding = ship.explodeTime > 0
    //  Draw Background
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canv.width, canv.height)

    //  Thrust Ship
    if (ship.thrusting) {
        ship.thrust.x += ship_thrust * Math.cos(ship.a) / FPS
        ship.thrust.y -= ship_thrust * Math.sin(ship.a) / FPS
        // draw thruster
        // ctx.fillStyle = "red"
        if (!exploding && blinkOn) {
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
        }
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
    if (!exploding) {
        if (blinkOn) {
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
        }

        //handle blinking
        if (ship.blinkNum > 0) {
            //reduce blink time
            ship.blinkTime--

            //reduce blink num
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(ship_Blink_Dur * FPS)
                ship.blinkNum--
            }
        }

    } else {
        //draw explosion
        ctx.strokeStyle = "darkred"
        ctx.lineWidth = ship_Size / 20
        ctx.beginPath()
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false)
        ctx.stroke()

        ctx.strokeStyle = "red"
        ctx.lineWidth = ship_Size / 20
        ctx.beginPath()
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false)
        ctx.stroke()

        ctx.strokeStyle = "orange"
        ctx.lineWidth = ship_Size / 20
        ctx.beginPath()
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false)
        ctx.stroke()

        ctx.strokeStyle = "yellow"
        ctx.lineWidth = ship_Size / 20
        ctx.beginPath()
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false)
        ctx.stroke()

        ctx.strokeStyle = "white"
        ctx.lineWidth = ship_Size / 20
        ctx.beginPath()
        ctx.arc(ship.x, ship.y, ship.r * 0.4, 0, Math.PI * 2, false)
        ctx.stroke()
    }

    // draw lasers
    for (let i = 0; i < ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime == 0) {
            ctx.fillStyle = "salmon"
            ctx.beginPath()
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship_Size / 15, 0, Math.PI * 2, false)
            ctx.fill()
        } else {
            //draw explosion 
            ctx.fillStyle = "orangered"
            ctx.beginPath()
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false)
            ctx.fill()
            ctx.fillStyle = "salmon"
            ctx.beginPath()
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false)
            ctx.fill()
            ctx.fillStyle = "pink"
            ctx.beginPath()
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false)
            ctx.fill()
        }
    }

    if (show_Bounding) {
        ctx.strokeStyle = "lime"
        ctx.beginPath()
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false)
        ctx.stroke()
    }




    //detect laser hit on asteroid
    let ax, ay, ar, lx, ly
    for (let i = roids.length - 1; i >= 0; i--) {

        //grab asteroid properties
        ax = roids[i].x
        ay = roids[i].y
        ar = roids[i].r

        //loop over lasers
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            //grab laser properties
            lx = ship.lasers[j].x
            ly = ship.lasers[j].y

            //detect hits
            if (distBetweenPoints(ax, ay, lx, ly) < ar) {
                //remove laser
                ship.lasers.splice(j, 1)

                // remove asteroid
                destroyAsteroid(i)

                break
            }

        }
    }

    //Draw Asteroids
    let x, y, r, a, vert, offs;
    for (let i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "white"
        ctx.lineWidth = ship_Size / 10
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
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            )
        }
        ctx.closePath()
        ctx.stroke()

        if (show_Bounding) {
            ctx.strokeStyle = "lime"
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2, false)
            ctx.stroke()
        }
    }

    // Chekc For Asteroid Collision
    for (let i = 0; i < roids.length; i++)
        if (!exploding && ship.blinkNum == 0) {
            if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                explodeship()
                destroyAsteroid(i)
                break
            }
        }


    //move lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        //check dist travveld
        if (ship.lasers[i].dist > laser_Dist * canv.width) {
            ship.lasers.splice(i, 1)
            continue
        }

        //move laser
        ship.lasers[i].x += ship.lasers[i].xv
        ship.lasers[i].y += ship.lasers[i].yv

        //calc traveled distance
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2))

        ///handle edge of screen
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canv.width
        } else if (ship.lasers[i].x > canv.width) {
            ship.lasers[i].x = 0
        }

        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canv.height
        } else if (ship.lasers[i].y > canv.height) {
            ship.lasers[i].y = 0
        }

    }


    if (!exploding) {
        //  Rotate Player
        ship.a += ship.rot;


        //  Move Player
        ship.x += ship.thrust.x
        ship.y += ship.thrust.y
    } else {
        // ship = newShip()
        ship.explodeTime--
        if (ship.explodeTime == 0) {
            ship = newShip()
        }
    }


    //  Centre Dot
    if (show_Centre_Dot) {
        ctx.fillStyle = "red"
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)
    }
    for (let i = 0; i < roids.length; i++) {
        //move asteroid
        roids[i].x += roids[i].xv
        roids[i].y += roids[i].yv

        //handle edge of screen
        if (roids[i].x < 0 - roids[i].r) {
            roids[i].x = canv.width + roids[i].r
        } else if (roids[i].x > canv.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r
        }
        if (roids[i].y < 0 - roids[i].r) {
            roids[i].y = canv.height + roids[i].r
        } else if (roids[i].y > canv.height + roids[i].r) {
            roids[i].y = 0 - roids[i].r
        }
    }
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

        case 32: // Space Bar (Shoot Laser)
            shootLaser()
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
        case 32: // Space Bar (allow shooting again )
            ship.canShoot = true
            break;
    }
}

//  Event Handlers
document.addEventListener("keydown", keyDown)
document.addEventListener("keyup", keyUp)


//  Game Loop

setInterval(update, 1000 / FPS);

//1:45:15