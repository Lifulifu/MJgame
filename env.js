//constants
const HEIGHT = 600;
const WIDTH = 1000;
const TILE_W = 46;
const TILE_H = 60;
const PLAT_W = TILE_W*15;

// game vars
var yama = []; // mjID=0~135
var shooting; // interval func

// matter.js stuff
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    Query = Matter.Query;

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.getElementById('container'),
    engine: engine,
    options: {
        height: HEIGHT,
        width: WIDTH,
        background: '#0f0f13',
        wireframes: false
    }
});

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.9,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

Render.run(render);
render.mouse = mouse;

//--------------------

function initWorld() {
    // reset yama
    yama = [];
    for(let i=0; i<=33; i++)
        for(let j=0; j<4; j++) // 4 tiles
            yama.push(i);
    
    // add platform
    var platform = Bodies.rectangle(WIDTH*0.5, 200, PLAT_W, 20, { isStatic: true });
    World.add(world, [platform]);
    
}

function resetWorld() {
    yama = [];
    // stop shooting
    clearInterval(shooting);
    // remove all bodies
    let l = world.bodies.length;
    for(let i=l-1; i>=0; i--){ //remove from back
        Matter.Composite.remove(world, world.bodies[i]);
    }
    // clear render callback
    Events.off(render);
}


// take a tile from yama and shoot it
function shootTile() {
    if(yama.length > 0){
        //random draw from yama
        var mjID = yama.splice(Math.floor(Math.random()*yama.length), 1);
        var x = WIDTH * 0.5 + Math.random()*400 - 200; // center +- 200
        var y = HEIGHT + 50;
        var tile = Bodies.rectangle(x, y, TILE_W, TILE_H, {
            chamfer: { radius: 5 },
            angle: Math.random()*2*Math.PI,
            render: {sprite:{ texture: textures[mjID] }}
        });
        tile.mjID = mjID;
        World.add(world, tile);

        Body.setVelocity(tile, { // initial speed
            x: Math.random() * 20 - 10, // +-10
            y: (Math.random() * 10 + 15) * -1, // 10 + 0~10
        });

    }else{
        console.log('yama out of tiles.')
    }
}

// remove tiles if out of bounds, and put back to yama
function removeTiles(){
    let l = world.bodies.length;
    for(let i=l-1; i>=0; i--){ // loop from back
        if(world.bodies[i].position.y > 1000){
            yama.push(world.bodies[i].mjID);
            Matter.Composite.remove(world, world.bodies[i]);
        }
    }
}

// check tiles on platform
function tilesOnPlatform(){
    var startPoint = {x: 0.5*(WIDTH-PLAT_W), y: 400-25-1};
        endPoint = {x: 0.5*(WIDTH+PLAT_W), y: 400-25-1}
    var collisions = Query.ray(world.bodies, startPoint, endPoint);
    var IDs = [];
    for(var collision of collisions){
        IDs.push(collision.bodyA.mjID);
    }
    console.log(IDs);
}










