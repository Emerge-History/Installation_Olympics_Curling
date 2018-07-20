const binghuNames = [];
const binghuColors = ["red"];
const binghuKV = {};

var updatables = [];
for (let i = 1; i <= 360; i++) {
  binghuColors.forEach(color => {
    if (!binghuKV[color]) {
      binghuKV[color] = [];
    }
    const name =
      "./assets/binghu-" + color + "/binghu" + (i + "").padStart(4, 0) + ".png";
    binghuNames.push(name);
    binghuKV[color][i - 1] = name;
  });
}

PIXI.loader
  .add([
    "./assets/circle.png",
    "./assets/shade.png",
    "./assets/crossbig.png",
    "./assets/track.png",
    "./assets/aim.png",
    ...binghuNames
  ]).load(setup);

Engine = Matter.Engine;
Runner = Matter.Runner;
Mouse = Matter.Mouse;
World = Matter.World;
Bodies = Matter.Bodies;
runner = Runner.create();
engine = Engine.create();
world = engine.world;
world.gravity.y = 0;

function center(b, x, y) {
  b.anchor.x = b.anchor.y = 0.5;
  position(b, x, y);
}

function position(b, x, y) {
  if (x || y) {
    b.position.x = x;
    b.position.y = y;
  }
}

const resources = PIXI.loader.resources;
const width = 1920;
const height = 6480;

var centerPosition = {
  x: width / 2,
  y: 1300
}

const app = new PIXI.Application({
  width,
  height,
  backgroundColor: 0xffffff
});
document.body.appendChild(app.view);

const container = new PIXI.Container();
var ballsContainer = new PIXI.Container();
app.stage.addChild(container);

var turn = [
  {
    x: 0, //Math.sin(Date.now() / 1000) * 30,
    y: 0, //5 * 1.5,
    a: 0
  },
  {
    x: -0,
    y: 0, //5 * 2.5,
    a: 0
  }
];

const u = -0.001;
class CurlingBall {
  constructor() {
    this.isPlayer = false;

    this.color = "red";
    this.texture = resources[binghuKV[this.color][0]].texture;
    this.container = new PIXI.Container();

    this.sprite = new PIXI.Sprite(this.texture);
    this.shade = new PIXI.Sprite(resources["./assets/shade.png"].texture);
    this.shade.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    this.shade.width = this.shade.height = 335;
    this.shade.position.x = 40;
    this.sprite.width = this.sprite.height = 335;

    center(this.shade, 0, 0);
    center(this.sprite, 0, 0);

    this.container.addChild(this.sprite);
    this.container.addChild(this.shade);

    ballsContainer.addChild(this.container);

    this.shade.alpha = 0.4;

    this.body = Bodies.circle(0, 0, 150, {
      frictionAir: 0.0,
      restitution: 0.5,
      friction: 0
    });

    World.add(world, this.body);

    this.life = 1;
    this._life = 1;

    this.updatable = this.update.bind(this);
    updatables.push(this.updatable);
  }

  score() {
    return Matter.Vector.magnitude(Matter.Vector.sub(this.body.position, centerPosition));
  }

  isOutside() {
    return this.body.position.x < -400 || this.body.position.y < -400
      || this.body.position.x > width + 400 || this.body.position.y > height + 800
  }

  isStoppedOrOutside() {
    if (Matter.Vector.magnitude(this.body.velocity) < 0.1 ||
      this.isOutside()) {
      return true;
    }
    return false;
  }

  setPosition(x, y) {
    Matter.Body.setPosition(this.body, {
      x: x, y: y
    })
  }

  update(t, dt) {
    this._life += (this.life - this._life) * 0.1;
    this.container.alpha = this._life;
    
    if(this.isOutside()) {
      this.life = 0;
    }

    if (this._life <= 0.1) {
      ballsContainer.removeChild(this.container);
      this.isPlayer = false;
      this.updatable.remove = true;
    }

    if (this.life == 0) {
      World.remove(world, this.body);
    }

    this.container.position.x = this.body.position.x;
    this.container.position.y = this.body.position.y;

    if (this.isPlayer) {

      let unmod = Math.abs((this.body.angle / Math.PI) * 180) % 1;
      let rot = Math.floor(Math.abs((this.body.angle / Math.PI) * 180)) % 360;
      this.sprite.rotation = (-unmod / 180) * Math.PI;
      this.sprite.texture = resources[binghuKV[this.color][rot]].texture;

      turn[0].a = Matter.Vector.angle(this.body.velocity, turn[0]);
      turn[1].a = Matter.Vector.angle(this.body.velocity, turn[1]);

      turn[0].a = Math.min(Math.PI / 4, Math.max(turn[0].a, -Math.PI / 4));
      turn[1].a = Math.min(Math.PI / 4, Math.max(turn[1].a, -Math.PI / 4));

      turn[0].a = Math.max(0, Math.pow(Math.cos(turn[0].a), 2));
      turn[1].a = Math.max(0, Math.pow(Math.cos(turn[1].a), 2));

      turn[0] = Matter.Vector.mult(turn[0], turn[0].a);
      turn[1] = Matter.Vector.mult(turn[1], turn[1].a);

      var mod = Matter.Vector.add(turn[0], turn[1]);

      var friction = {
        x: u * this.body.velocity.x,
        y: u * this.body.velocity.y
      };

      mod = Matter.Vector.mult(mod, -0.03 * Matter.Vector.magnitude(friction));
      friction = Matter.Vector.add(friction, mod);

      Matter.Body.applyForce(
        this.body,
        { x: this.body.position.x, y: this.body.position.y },
        friction
      );
      Matter.Body.setAngularVelocity(
        this.body,
        this.body.angularVelocity * 0.995
      );
    } else {
      var friction = {
        x: u * this.body.velocity.x,
        y: u * this.body.velocity.y
      };
      Matter.Body.applyForce(
        this.body,
        { x: this.body.position.x, y: this.body.position.y },
        friction
      );
      Matter.Body.setAngularVelocity(
        this.body,
        this.body.angularVelocity * 0.995
      );
    }
  }
}

var game = {
  balls: [],
  state: {

  }
}

function setup() {

  //generative
  {
    var grid = new PIXI.Container();
    var gridSize = 64;
    var gen_grid = [];
    for (var x = gridSize; x < width; x += gridSize * 3) {
      for (var y = gridSize; y < height; y += gridSize * 3) {
        var sprite_grid = new PIXI.Sprite(
          resources["./assets/crossbig.png"].texture
        );
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
    container.addChild(grid);
  }

  //dots
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
            resources["./assets/circle.png"].texture
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

  //track
  {
    var track = new PIXI.Container();

    var sprite_track = new PIXI.Sprite(resources["./assets/track.png"].texture);
    var sprite_aim = new PIXI.Sprite(resources["./assets/aim.png"].texture);

    track.addChild(sprite_track);
    track.addChild(sprite_aim);

    sprite_aim.anchor.x = sprite_aim.anchor.y = 0.5;
    sprite_aim.position.x = width / 2;
    sprite_aim.position.y = 1297.3;

    sprite_aim.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    container.addChild(track);
  }

  var time = 0;
  function update(n) {
    var delta = Date.now() - time;
    time = Date.now();
    Runner.tick(runner, engine, delta);
    var nextUpdatables = [];
    for (var i = 0; i < updatables.length; i++) {
      if (!updatables[i].remove) {
        updatables[i](time, delta);
        nextUpdatables.push(updatables[i]);
      }
    }
    updatables = nextUpdatables;
    requestAnimationFrame(update);
  }

  update();
  var c = new CurlingBall();
  window.c = c;
  c.setPosition(width / 2, height);
  container.addChild(ballsContainer);
}