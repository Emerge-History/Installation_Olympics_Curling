var sock = io("/");
var updatables = [];

var states = {
  scene: 0,
  balls: [],
  game: {
    id: -1,
    launched: false
  },
  control: {},
  econtrol: {},
  _e: {}
};

function launchBall() {
  var ball = new CurlingBall();
  ball.isPlayer = 1;
  ball.setPosition(width / 2, height + 200);
  for (var i = 0; i < states.balls.length; i++) {
    states.balls[i].isPlayer = 0;
  }
  states.balls.push(ball);
  var force = {
    x: 0,
    y: -8 * (states.control.power + 0.3)
  };
  force = Matter.Vector.rotate(force, states.control.angle);
  Matter.Body.applyForce(ball.body, { x: width / 2, y: height + 200 }, force);
  Matter.Body.setAngularVelocity(ball.body, (Math.random() - 0.5) * 0.1);
}

function ease(cur, target, c, precision) {
  var delta = target - cur;
  if (Math.abs(delta) < (precision || 0.001)) {
    return cur;
  }
  return cur + delta * (c || 0.01);
}

function map(t, a, b, c, d) {
  return ((t - a) / (b - a)) * (d - c) + c;
}

function checkForGameover() {
  var moving = 0;
  var hasMaxScore = undefined;
  var maxScore = 300;
  var newballs = [];
  for (var i = 0; i < states.balls.length; i++) {
    states.balls[i].isMaxScore = false;
    if (!states.balls[i].isStoppedOrOutside()) {
      moving++;
    }
    if (states.balls[i].score() < maxScore) {
      maxScore = states.balls[i].score();
      hasMaxScore = states.balls[i];
    }
    if (!states.balls[i].life == 0) {
      newballs.push(states.balls[i]);
    }
  }
  if (hasMaxScore) {
    hasMaxScore.isMaxScore = true;
  }
  states.balls = newballs;

  if (moving == 0) {
    for (var i = 0; i < states.balls.length; i++) {
      if (!states.balls[i].isMaxScore) {
        states.balls[i].life = 0;
      }
    }
    sock.emit("all", {
      key: "gameover",
      value: 0
    });
  }
}

function checkForNewGame() {
  if (!states.control) {
    return;
  }
  if (states.control.gameId != states.game.id) {
    if (states.control.launched) {
      //bad game!
      states.game.id = -100; //waiting
      console.log("not good, resetting");
      sock.emit("all", "reset");
      return;
    } else {
      states.game.id = states.control.gameId;
      states.game.launched = false;
      return;
    }
  } else if (!states.game.launched && states.control.launched) {
    states.game.launched = true;
    launchBall();
  } else if (states.game.launched && states.control.launched) {
    checkForGameover();
  }
}

sock.on("state", d => {
  states.control = d.control;
});

function loop(updateFunction) {
  updatables.push(updateFunction);
}

loop(() => {
  for (var i in states.control) {
    if (states.econtrol[i] !== states.control[i]) {
      states.econtrol[i] = states.econtrol[i] || states.control[i];
      states.econtrol[i] +=
        (states.control[i] - states.econtrol[i]) * (states._e[i] || 0.1);
    }
  }
});

const binghuNames = [];
const binghuColors = ["red"];
const binghuKV = {};

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
    "./assets/line.png",
    "./assets/rect.png",
    "./assets/trangle.png",
    "./assets/ring.png",
    "./assets/aimring.png",
    "./assets/winnerRing.png",
    "./assets/aimbtn.png",
    "./assets/circle.png",
    "./assets/shade.png",
    "./assets/crossbig.png",
    "./assets/track.png",
    "./assets/aim.png",
    "./assets/gradientMask.png",
    "./assets/stroke.png",
    ...binghuNames
  ])
  .load(setup);

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
};

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

    this.isMaxScore = false;
    this._isMaxScore = 0;
    this.color = "red";
    this.texture = resources[binghuKV[this.color][0]].texture;
    this.container = new PIXI.Container();

    this.sprite = new PIXI.Sprite(this.texture);
    this.shade = new PIXI.Sprite(resources["./assets/shade.png"].texture);
    this.shade.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    this.shade.width = this.shade.height = 335;
    this.shade.position.x = 40;
    this.sprite.width = this.sprite.height = 335;

    this.winnerRing = new PIXI.Sprite(
      resources["./assets/winnerRing.png"].texture
    );
    this.winnerRing.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    this.winnerRing.width = this.winnerRing.height = 400;

    center(this.winnerRing, 0, 0);
    center(this.shade, 0, 0);
    center(this.sprite, 0, 0);

    this.container.addChild(this.sprite);
    this.container.addChild(this.shade);
    this.container.addChild(this.winnerRing);

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
    return Matter.Vector.magnitude(
      Matter.Vector.sub(this.body.position, centerPosition)
    );
  }

  isOutside() {
    return (
      this.body.position.x < -160 ||
      this.body.position.y < -160 ||
      this.body.position.x > width + 160 ||
      this.body.position.y > height + 1800
    );
  }

  isStoppedOrOutside() {
    if (Matter.Vector.magnitude(this.body.velocity) < 0.2 || this.isOutside()) {
      return true;
    }
    return false;
  }

  setPosition(x, y) {
    Matter.Body.setPosition(this.body, {
      x: x,
      y: y
    });
  }

  update(t, dt) {
    this._isMaxScore += ((this.isMaxScore ? 1 : 0) - this._isMaxScore) * 0.2;
    this.winnerRing.alpha = this._isMaxScore;
    this.winnerRing.rotation += 0.02;
    this._life += (this.life - this._life) * 0.1;
    this.container.alpha = this._life;

    if (this.isOutside()) {
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

    let unmod = Math.abs((this.body.angle / Math.PI) * 180) % 1;
    let rot = Math.floor(Math.abs((this.body.angle / Math.PI) * 180)) % 360;
    this.sprite.rotation = (-unmod / 180) * Math.PI;
    this.sprite.texture = resources[binghuKV[this.color][rot]].texture;

    if (this.isPlayer) {
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

function setup() {
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

  // background
  // ======================================================

  let inputs = [];
  const colors = [0xe75b80, 0x409edb, 0xf7ca00];

  class Dot {
    constructor(sprite, y) {
      this.t = Math.random() * 100 + 20;
      this.alive = true;
      this.posX = Math.random() * width;
      this.pos = new Vec2(this.posX, y);

      this.targetPos = new Vec2(this.posX, y);

      this.mass = 2 + Math.random() * 2;
      this.frequency = Math.random() * 10;
      this.amplitude = 50 + Math.random() * 20;
      this.color = [colors[Math.floor(Math.random() * colors.length)], 1];
      this.size = Math.random() * 60 + 20;

      this.sprite = sprite;
    }
    update(gravity) {
      this.t += 0.01;

      this.targetPos.x =
        this.posX + Math.sin(this.t * this.frequency) * this.amplitude;

      this.targetPos.y += gravity * this.mass;

      this.pos.x = ease(this.pos.x, this.targetPos.x, 0.2);
      this.pos.y = ease(this.pos.y, this.targetPos.y, 0.2);

      if (this.pos.y < -100) {
        this.alive = false;
        this.sprite.visible = false;
      }
      this.color[1] = Math.abs(Math.sin(this.t));
      // ======================
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const vector = this.pos.clone().subtract(input.pos);
        const angleX = vector.angleTo(new Vec2(1, 0));
        const angleY = vector.angleTo(new Vec2(0, 1));
        const F = 20000 / vector.length();
        const forceX = Math.cos(angleX) * F;
        const forceY = Math.cos(angleY) * F;
        this.pos.x += forceX;
        this.pos.y += forceY;
      }
      // ======================
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
      this.density = 20;
      this.container = new PIXI.Container();

      this.particleContainer = new PIXI.particles.ParticleContainer(10000, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true
      });

      this.container.addChild(this.particleContainer);

      for (let i = 0; i < 3000; i++) {
        const sprite = new PIXI.Sprite(
          resources["./assets/circle.png"].texture
        );
        sprite.anchor.set(0.5);
        this.pool.push(sprite);
        sprite.visible = false;
        this.particleContainer.addChild(sprite);
      }

      for (let i = 0; i < 500; i++) {
        this.createDot(Math.random() * height);
      }
    }
    enter() {
      this.gravity = -50;
    }
    leave() {
      this.gravity = 10;
    }
    createDot(y = height) {
      for (let i = 0; i < this.pool.length; i++) {
        if (!this.pool[i].visible) {
          this.pool[i].visible = true;
          const dot = new Dot(this.pool[i], y);
          this.dots.push(dot);
          break;
        }
      }
    }
    update(delta) {
      this.t += delta;
      for (
        let i = 0;
        i < Math.round((-this.gravity / 100) * this.density);
        i++
      ) {
        this.createDot();
      }

      this.dots = this.dots.filter(dot => dot.alive);

      this.dots.forEach(dot => {
        dot.update(this.gravity);
      });
    }
  }

  class Grid {
    constructor() {
      this.container = new PIXI.Container();
      this.particleContainer = new PIXI.particles.ParticleContainer(30000, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true
      });

      this.rects = [];
      this.size = 110;
      // this.size = 20;
      this.initGrid();
      this.t = 0;
      this.container.addChild(this.particleContainer);
    }
    initGrid() {
      for (let i = 0; i < width + this.size; i += this.size + 40) {
        for (let j = 0; j < height + this.size; j += this.size + 40) {
          const sprite = new PIXI.Sprite(
            resources["./assets/trangle.png"].texture
          );
          sprite.anchor.set(0.5);
          sprite.x = i;
          sprite.y = j;
          // sprite.tint = 0xffffff;
          // sprite.tint = 0x00b5ff;
          sprite.rotation = Math.random() * Math.PI;
          sprite.width = this.size;
          sprite.height = this.size;
          this.particleContainer.addChild(sprite);
          this.rects.push(sprite);
        }
      }
    }
    update(delta) {
      this.t += delta;
      this.render();
    }
    render() {
      this.rects.forEach(rect => {
        rect.rotation += 0.01;
        rect.alpha = Math.abs(
          noise.simplex3(rect.x / 600, rect.y / 600, this.t / 100)
        );
        // rect.scale.set(
        //   Math.abs(noise.simplex3(rect.x / 600, rect.y / 600, this.t / 100) * 3)
        // );
        rect.tint = 0x000000;
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const vector = new Vec2(rect.x - input.pos.x, rect.y - input.pos.y);

          if (vector.length() < 600) {
            let angle = new Vec2(0, 1).angleTo(vector);
            rect.rotation = angle;
          }
        }
      });
    }
  }

  class Corss {
    constructor() {
      this.container = new PIXI.Container();
      this.particleContainer = new PIXI.particles.ParticleContainer(30000, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true
      });
      this.rects = [];
      this.size = 30;
      this.initGrid();
      this.t = 0;
      this.container.addChild(this.particleContainer);
    }
    initGrid() {
      for (let i = 0; i < width; i += this.size + 100) {
        for (let j = 0; j < height; j += this.size + 100) {
          const sprite = new PIXI.Sprite(
            resources["./assets/crossbig.png"].texture
          );
          sprite.x = i;
          sprite.y = j;
          sprite.tint = 0x000000;
          sprite.width = this.size;
          sprite.height = this.size;
          this.particleContainer.addChild(sprite);
          this.rects.push(sprite);
        }
      }
    }
    update(delta) {
      this.t += delta;
      this.render();
    }
    render() {
      this.rects.forEach(rect => {
        rect.width = this.size;
        rect.height = this.size;

        rect.alpha =
          Math.abs(noise.simplex3(rect.x / 300, rect.y / 300, this.t / 100)) /
          2;

        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const vector = new Vec2(rect.x - input.pos.x, rect.y - input.pos.y);
          if (vector.length() < 400) {
            rect.width = this.size * 2;
            rect.height = this.size * 2;
          }
        }
      });
    }
  }

  class Rect {
    constructor() {
      this.container = new PIXI.Container();
      this.particleContainer = new PIXI.particles.ParticleContainer(30000, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true
      });

      this.rects = [];
      this.size = 110;
      // this.size = 20;
      this.initGrid();
      this.t = 0;
      this.container.addChild(this.particleContainer);
    }
    initGrid() {
      for (let i = 0; i < width + this.size; i += this.size + 70) {
        for (let j = 0; j < height + this.size; j += this.size + 70) {
          const sprite = new PIXI.Sprite(
            resources["./assets/rect.png"].texture
          );
          sprite.anchor.set(0.5);
          sprite.x = i;
          sprite.y = j;
          // sprite.tint = 0xffffff;
          // sprite.tint = 0x00b5ff;
          sprite.rotation = Math.random() * Math.PI;
          sprite.width = this.size;
          sprite.height = this.size;
          this.particleContainer.addChild(sprite);
          this.rects.push(sprite);
        }
      }
    }
    update(delta) {
      this.t += delta;
      this.render();
    }
    render() {
      this.rects.forEach(rect => {
        rect.alpha = Math.abs(
          noise.simplex3(rect.x / 600, rect.y / 600, this.t / 100)
        );
        rect.scale.set(
          Math.abs(noise.simplex3(rect.x / 600, rect.y / 600, this.t / 100) * 3)
        );
        rect.tint = 0xff49c5;
        rect.rotation += 0.01;
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const vector = new Vec2(rect.x - input.pos.x, rect.y - input.pos.y);

          if (vector.length() < 600) {
            rect.scale.set(vector.length() / 600);
            let angle = new Vec2(0, 1).angleTo(vector);
            rect.rotation = angle;
          }
        }
      });
    }
  }

  const ds = new DotSystem();
  container.addChild(ds.container);
  ds.container.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  const grid = new Grid();
  container.addChild(grid.container);
  grid.container.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  const corss = new Corss();
  container.addChild(corss.container);
  corss.container.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  const rect = new Rect();
  container.addChild(rect.container);
  rect.container.blendMode = PIXI.BLEND_MODES.MULTIPLY;

  loop(() => {
    inputs.length = 0;
    states.balls.forEach(ball => {
      inputs.push({
        pos: new Vec2(ball.body.position.x, ball.body.position.y)
      });
    });
  });

  loop((time, delta) => {
    delta = delta/10;
    ds.container.visible = false;
    grid.container.visible = false;
    corss.container.visible = false;
    rect.container.visible = false;
    if (states.scene === 0) {
      ds.container.visible = true;
      ds.update(delta);
      corss.container.visible = true;
      corss.update(delta);
    }
    if (states.scene === 1) {
      grid.container.visible = true;
      grid.update(delta);
    }
    if (states.scene === 2) {
      rect.container.visible = true;
      rect.update(delta);
    }
  });

  // background
  // ======================================================

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
  // var c = new CurlingBall();
  // window.c = c;
  // c.setPosition(width / 2, height);

  var aimContainer = new PIXI.Container();

  var aimRing = new PIXI.Sprite(resources["./assets/aimring.png"].texture);
  var aimBtn = new PIXI.Sprite(resources["./assets/aimbtn.png"].texture);
  var aimText = new PIXI.Text("测试", {
    fontFamily: "PingFang SC",
    fontSize: 50,
    fill: 0xffffff,
    align: "center"
  });

  aimBtn.position.y = -60;
  aimText.position.y = -85;

  var aimRotator = new PIXI.Container();
  var aimMask = new PIXI.Sprite(resources["./assets/gradientMask.png"].texture);
  var aimDash = new PIXI.extras.TilingSprite(
    resources["./assets/stroke.png"].texture,
    15,
    3470
  );

  aimMask.anchor.x = 0.5;
  aimMask.anchor.y = 1;
  aimDash.anchor.x = 0.5;
  aimDash.anchor.y = 1;

  aimRotator.addChild(aimMask);
  aimRotator.addChild(aimDash);

  aimDash.mask = aimMask;

  center(aimText);
  aimBtn.addChild(aimText);

  aimRing.anchor.x = aimBtn.anchor.x = 0.5;
  aimRing.anchor.y = aimBtn.anchor.y = 1;
  aimContainer.addChild(aimRing);
  aimContainer.addChild(aimRotator);
  aimContainer.addChild(aimBtn);
  aimRotator.position.y = 200;

  aimContainer.position.x = width / 2;
  aimContainer.position.y = height;

  loop(() => {
    var show_angler = Math.min(
      1,
      states.econtrol.angle_enabled + states.econtrol.selecting_power
    );
    aimText.text =
      "角度 " + Math.floor((states.control.angle / Math.PI) * 1800) / 10 + "°";
    aimContainer.alpha = show_angler;
    aimDash.tilePosition.y += -4.1;
    aimRotator.rotation = states.econtrol.angle || 0;
  });

  container.addChild(aimContainer);
  container.addChild(ballsContainer);
}

loop(checkForNewGame);
