var w = 1920;
var h = 6480;

var app = new PIXI.Application(1920, 6480, { backgroundColor: 0xffffff });
document.body.appendChild(app.view);

var textures = {
    red: []
};
for (var i in textures) {
    for (var j = 1; j <= 360; j++) {
        textures.red.push(
            PIXI.Texture.fromImage("./assets/binghu-" + i + "/binghu" + (j + "").padStart(4, 0) + ".png")
        );
    }
}

var texture_placeHolder = PIXI.Texture.fromImage("./assets/placeholder.png");
var texture_shadow = PIXI.Texture.fromImage("./assets/shade.png");
var container = new PIXI.Container();

var box = new PIXI.Sprite(textures.red[0]);
var box2 = new PIXI.Sprite(textures.red[0]);

box.shade = new PIXI.Sprite(texture_shadow);
box2.shade = new PIXI.Sprite(texture_shadow);

box.shade.blendMode = PIXI.BLEND_MODES.MULTIPLY
box2.shade.blendMode = PIXI.BLEND_MODES.MULTIPLY

box.anchor.x = box.anchor.y = 0.5;
box2.anchor.x = box2.anchor.y = 0.5;

box.shade.anchor.x = box.shade.anchor.y = 0.5;
box2.shade.anchor.x = box2.shade.anchor.y = 0.5;

box.width = box.height = 335;
box2.width = box2.height = 335;

box.shade.width = box.shade.height = 335;
box2.shade.width = box2.shade.height = 335;

box.shade.alpha = 0.4;
box2.shade.alpha = 0.4;


//generative
{
    var texture_grid = PIXI.Texture.fromImage("./assets/crossbig.png");
    var grid = new PIXI.Container();
    var gridSize = 64;
    var gen_grid = [];
    for (var x = gridSize; x < w; x += gridSize * 3) {
        for (var y = gridSize; y < h; y += gridSize * 3) {
            var sprite_grid = new PIXI.Sprite(texture_grid);
            // sprite_grid.width = sprite_grid.height = gridSize;
            sprite_grid.anchor.x = sprite_grid.anchor.y = 0.5;
            sprite_grid.position.x = x + gridSize / 2;
            sprite_grid.position.y = y + gridSize / 2;
            sprite_grid.scale.x = sprite_grid.scale.y = 0.1;
            sprite_grid.tint = 0x666666;
            sprite_grid.blendMode = PIXI.BLEND_MODES.MULTIPLY;
            sprite_grid.alpha = 0.5;
            gen_grid.push(sprite_grid);
            grid.addChild(sprite_grid);
        }
    }
}

container.addChild(grid);

//track
{
    var track = new PIXI.Container();
    var texture_track = PIXI.Texture.fromImage("./assets/track.png");
    var texture_aim = PIXI.Texture.fromImage("./assets/aim.png");

    var sprite_track = new PIXI.Sprite(texture_track);
    var sprite_aim = new PIXI.Sprite(texture_aim);

    track.addChild(sprite_track);
    track.addChild(sprite_aim);

    sprite_aim.anchor.x = sprite_aim.anchor.y = 0.5;
    sprite_aim.position.x = w / 2;
    sprite_aim.position.y = 1297.3;


    sprite_aim.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    container.addChild(track);
}


container.addChild(box.shade);
container.addChild(box2.shade);
container.addChild(box);
container.addChild(box2);
app.stage.addChild(container);


// // Create a 5x5 grid of bunnies
// for (var i = 0; i < 25; i++) {
//     var bunny = new PIXI.Sprite(texture);
//     bunny.anchor.set(0.5);
//     bunny.x = (i % 5) * 40;
//     bunny.y = Math.floor(i / 5) * 40;
//     container.addChild(bunny);
// }
// Center on the screen

// container.x = (app.screen.width - container.width) / 2;
// container.y = (app.screen.height - container.height) / 2;



var Engine = Matter.Engine,
    // Render = Matter.Render,
    Runner = Matter.Runner,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
// var render = Render.create({
//     engine: engine,
//     options: {
//         width: w,
//         height: h,
//         showVelocity: true
//     }
// });

// Render.run(render);

var runner = Runner.create();
// Runner.run(runner, engine);

world.gravity.y = 0;
World.add(world, [
    // falling blocks
    Bodies.circle(w / 2, h + 300, 150, { frictionAir: 0.000, restitution: 0.5, friction: 0 }),
    Bodies.circle(w / 2 - 30, 600, 150, { frictionAir: 0.000, restitution: 0.5, friction: 0 }),
]);



Matter.Body.applyForce(world.bodies[0], { x: world.bodies[0].position.x, y: world.bodies[0].position.y }, {
    x: 0,
    // y: -2 //3
    y: -3.3//3
})
Matter.Body.setAngularVelocity(world.bodies[0], (Math.random() - 0.5) * 0.1);
Matter.Body.setAngularVelocity(world.bodies[1], 0.01);



var time = 0;
function update(n) {
    var delta = Date.now() - time;
    time = Date.now();
    Runner.tick(runner, engine, delta)

    box.position.x =
        world.bodies[0].position.x;
    box.position.y =
        world.bodies[0].position.y;


    box.shade.position.x =
        box.position.x + 40;
    box.shade.position.y =
        box.position.y;


    box2.position.x =
        world.bodies[1].position.x;
    box2.position.y =
        world.bodies[1].position.y;

    box2.shade.position.x =
        box2.position.x + 40;
    box2.shade.position.y =
        box2.position.y;



    let unmod = Math.abs(world.bodies[0].angle / Math.PI * 180) % 1;
    let rot = Math.floor(Math.abs(world.bodies[0].angle / Math.PI * 180)) % 360;
    box.rotation = -unmod / 180 * Math.PI;
    box.texture = textures.red[rot];

    let unmod2 = Math.abs(world.bodies[1].angle / Math.PI * 180) % 1;
    let rot2 = Math.floor(Math.abs(world.bodies[1].angle / Math.PI * 180)) % 360;
    box2.rotation = -unmod2 / 180 * Math.PI;
    box2.texture = textures.red[rot2];


    let turn = [
        {
            x: 0, //Math.sin(Date.now() / 1000) * 30,
            y: 0,//5 * 1.5,
            a: 0
        },
        {
            x: -0 * 2.5,
            y: 0,//5 * 2.5,
            a: 0
        }
    ];


    // let turn = [
    //     {
    //         x: Math.sin(Date.now() / 1000) * 30,
    //         y: 5 * 1.5,
    //         a: 0
    //     },
    //     {
    //         x: -0 * 2.5,
    //         y: 5 * 2.5,
    //         a: 0
    //     }
    // ];


    //friction

    var vb = Matter.Vector.magnitude(world.bodies[0].velocity);

    turn[0].a = Matter.Vector.angle(world.bodies[0].velocity, turn[0]);
    turn[1].a = Matter.Vector.angle(world.bodies[0].velocity, turn[1]);

    turn[0].a = Math.min(Math.PI / 4, Math.max(turn[0].a, -Math.PI / 4))
    turn[1].a = Math.min(Math.PI / 4, Math.max(turn[1].a, -Math.PI / 4))

    turn[0].a = Math.max(0, Math.pow(Math.cos(turn[0].a), 2));
    turn[1].a = Math.max(0, Math.pow(Math.cos(turn[1].a), 2));


    turn[0] = Matter.Vector.mult(turn[0], turn[0].a);
    turn[1] = Matter.Vector.mult(turn[1], turn[1].a);

    var mod = Matter.Vector.add(turn[0], turn[1]);

    var u = -0.001;
    // var u = -0.001;
    var friction = {
        x: u * world.bodies[0].velocity.x,
        y: u * world.bodies[0].velocity.y
    };

    // mod = Matter.Vector.mult(mod, -0.03 * Matter.Vector.magnitude(friction));
    mod = Matter.Vector.mult(mod, -0.03 * Matter.Vector.magnitude(friction));

    friction = Matter.Vector.add(friction, mod);

    Matter.Body.applyForce(world.bodies[0], { x: world.bodies[0].position.x, y: world.bodies[0].position.y }, friction)
    Matter.Body.setAngularVelocity(
        world.bodies[0], world.bodies[0].angularVelocity * 0.995
    )

    var friction = {
        x: u * world.bodies[1].velocity.x,
        y: u * world.bodies[1].velocity.y
    };
    Matter.Body.applyForce(world.bodies[1], { x: world.bodies[1].position.x, y: world.bodies[1].position.y }, friction)
    Matter.Body.setAngularVelocity(
        world.bodies[1], world.bodies[1].angularVelocity * 0.995
    )

    for (var i = 0; i < gen_grid.length; i++) {
        var cur = gen_grid[i];
        var d1 = Math.sqrt((cur.position.x - world.bodies[0].position.x) * (cur.position.x - world.bodies[0].position.x)
            +
            (cur.position.y - world.bodies[0].position.y) * (cur.position.y - world.bodies[0].position.y))
        var d2 = Math.sqrt((cur.position.x - world.bodies[1].position.x) * (cur.position.x - world.bodies[1].position.x)
            +
            (cur.position.y - world.bodies[1].position.y) * (cur.position.y - world.bodies[1].position.y))
        // d = Math.pow(1 - d / 20, 2)
        d1 = 1 - d1 / 500;
        d2 = 1 - d2 / 500;
        cur.scale.x = cur.scale.y = (Math.max(0.1, Math.min(0.5, d2)) +  Math.max(0.1, Math.min(0.5, d1))) / 2;
    }


    requestAnimationFrame(update);
}

update();



// function update() {

//     requestAnimationFrame(update);
// }

// update();