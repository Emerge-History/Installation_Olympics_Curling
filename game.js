var w = 1920;
var h = 6480;
var width = w;
var height = h;

class Vec2 {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }
  

var app = new PIXI.Application(1920, 6480, { backgroundColor: 0xffffff });
document.body.appendChild(app.view);

var textures = {
  red: []
};

for (var i in textures) {
  for (var j = 1; j <= 360; j++) {
    textures.red.push(
      PIXI.Texture.fromImage(
        "./assets/binghu-" + i + "/binghu" + (j + "").padStart(4, 0) + ".png"
      )
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

box.shade.blendMode = PIXI.BLEND_MODES.MULTIPLY;
box2.shade.blendMode = PIXI.BLEND_MODES.MULTIPLY;

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

{
  const colors = [0xe75b80, 0x409edb, 0xf7ca00, 0xffffff];

  class Mouse {
    constructor() {
      this.pos = new Vec2(0, 0);
      window.addEventListener("mousemove", e => {
        this.pos.x = e.offsetX;
        this.pos.y = e.offsetY;
      });
    }
  }

  class Dot {
    constructor(sprite) {
      this.t = 0;
      this.alive = true;
      this.posX = Math.random() * width;
      this.pos = new Vec2(0, height);
      this.mass = 2 + Math.random() * 2;
      this.frequency = Math.random() * 10;
      this.amplitude = 50 + Math.random() * 20;
      this.color = [colors[Math.floor(Math.random() * colors.length)], 1];
      this.size = Math.random() * 40 + 10;

      this.sprite = sprite;
    }
    update(gravity) {
      this.t += 0.01;
      this.pos.x =
        this.posX + Math.sin(this.t * this.frequency) * this.amplitude;
      this.pos.y += gravity * this.mass;

      if (this.pos.y < -20) {
        this.alive = false;
        this.sprite.visible = false;
      }
      this.color[1] = Math.abs(Math.sin(this.t));
      this.render();
    }
    render() {
      this.sprite.x = this.pos.x;
      this.sprite.y = this.pos.y;
      this.sprite.tint = this.color[0];
      this.sprite.alpha = this.color[1];
      this.sprite.width = this.size;
      this.sprite.height = this.size;
    }
  }

  class DotSystem {
    constructor() {
      this.t = 0;
      this.pool = [];
      this.gravity = -3;
      this.dots = [];
      this.pixiContainer = new PIXI.particles.ParticleContainer(10000, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true
      });

      for (let i = 0; i < 3000; i++) {
        const sprite = new PIXI.Sprite(
          PIXI.Texture.fromImage("./assets/circle.png")
        );
        this.pool.push(sprite);
        sprite.visible = false;
        this.pixiContainer.addChild(sprite);
      }
    }
    createDot() {
      for (let i = 0; i < this.pool.length; i++) {
        if (!this.pool[i].visible) {
          this.pool[i].visible = true;
          const dot = new Dot(this.pool[i]);
          this.dots.push(dot);
          break;
        }
      }
    }
    update(delta) {
      this.t += delta;
      for (let i = 0; i < 4; i++) {
        this.createDot();
      }

      this.dots = this.dots.filter(dot => dot.alive);

      this.dots.forEach(dot => {
        dot.update(this.gravity);
      });
    }
  }

  var ds = new DotSystem();
  container.addChild(ds.pixiContainer);
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
  Bodies.circle(w / 2, h + 300, 150, {
    frictionAir: 0.0,
    restitution: 0.5,
    friction: 0
  }),
  Bodies.circle(w / 2 - 30, 600, 150, {
    frictionAir: 0.0,
    restitution: 0.5,
    friction: 0
  })
]);

// Matter.Body.applyForce(world.bodies[0], { x: world.bodies[0].position.x, y: world.bodies[0].position.y }, {
//     x: 0,
//     y: -3.3
// })
// Matter.Body.setAngularVelocity(world.bodies[0], (Math.random() - 0.5) * 0.1);
// Matter.Body.setAngularVelocity(world.bodies[1], 0.01);

var time = 0;
function update(n) {
  var delta = Date.now() - time;
  time = Date.now();
  Runner.tick(runner, engine, delta);

  box.position.x = world.bodies[0].position.x;
  box.position.y = world.bodies[0].position.y;

  box.shade.position.x = box.position.x + 40;
  box.shade.position.y = box.position.y;

  box2.position.x = world.bodies[1].position.x;
  box2.position.y = world.bodies[1].position.y;

  box2.shade.position.x = box2.position.x + 40;
  box2.shade.position.y = box2.position.y;

  let unmod = Math.abs((world.bodies[0].angle / Math.PI) * 180) % 1;
  let rot = Math.floor(Math.abs((world.bodies[0].angle / Math.PI) * 180)) % 360;
  box.rotation = (-unmod / 180) * Math.PI;
  box.texture = textures.red[rot];

  let unmod2 = Math.abs((world.bodies[1].angle / Math.PI) * 180) % 1;
  let rot2 =
    Math.floor(Math.abs((world.bodies[1].angle / Math.PI) * 180)) % 360;
  box2.rotation = (-unmod2 / 180) * Math.PI;
  box2.texture = textures.red[rot2];

  let turn = [
    {
      x: 0, //Math.sin(Date.now() / 1000) * 30,
      y: 0, //5 * 1.5,
      a: 0
    },
    {
      x: -0 * 2.5,
      y: 0, //5 * 2.5,
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

  turn[0].a = Math.min(Math.PI / 4, Math.max(turn[0].a, -Math.PI / 4));
  turn[1].a = Math.min(Math.PI / 4, Math.max(turn[1].a, -Math.PI / 4));

  turn[0].a = Math.max(0, Math.pow(Math.cos(turn[0].a), 2));
  turn[1].a = Math.max(0, Math.pow(Math.cos(turn[1].a), 2));

  turn[0] = Matter.Vector.mult(turn[0], turn[0].a);
  turn[1] = Matter.Vector.mult(turn[1], turn[1].a);

  var mod = Matter.Vector.add(turn[0], turn[1]);

  var u = -0.001;
  var friction = {
    x: u * world.bodies[0].velocity.x,
    y: u * world.bodies[0].velocity.y
  };

  mod = Matter.Vector.mult(mod, -0.03 * Matter.Vector.magnitude(friction));

  friction = Matter.Vector.add(friction, mod);

  Matter.Body.applyForce(
    world.bodies[0],
    { x: world.bodies[0].position.x, y: world.bodies[0].position.y },
    friction
  );
  Matter.Body.setAngularVelocity(
    world.bodies[0],
    world.bodies[0].angularVelocity * 0.995
  );

  var friction = {
    x: u * world.bodies[1].velocity.x,
    y: u * world.bodies[1].velocity.y
  };
  Matter.Body.applyForce(
    world.bodies[1],
    { x: world.bodies[1].position.x, y: world.bodies[1].position.y },
    friction
  );
  Matter.Body.setAngularVelocity(
    world.bodies[1],
    world.bodies[1].angularVelocity * 0.995
  );

  // for (var i = 0; i < gen_grid.length; i++) {
  //     var cur = gen_grid[i];
  //     var d1 = Math.sqrt((cur.position.x - world.bodies[0].position.x) * (cur.position.x - world.bodies[0].position.x)
  //         +
  //         (cur.position.y - world.bodies[0].position.y) * (cur.position.y - world.bodies[0].position.y))
  //     var d2 = Math.sqrt((cur.position.x - world.bodies[1].position.x) * (cur.position.x - world.bodies[1].position.x)
  //         +
  //         (cur.position.y - world.bodies[1].position.y) * (cur.position.y - world.bodies[1].position.y))
  //     // d = Math.pow(1 - d / 20, 2)
  //     d1 = 1 - d1 / 500;
  //     d2 = 1 - d2 / 500;
  //     cur.scale.x = cur.scale.y = (Math.max(0.1, Math.min(0.5, d2)) +  Math.max(0.1, Math.min(0.5, d1))) / 2;
  // }

  ds.update(delta);

  requestAnimationFrame(update);
}

update();

// function update() {

//     requestAnimationFrame(update);
// }

// update();
