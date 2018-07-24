function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
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

const resources = PIXI.loader.resources;
const width = 1920;
const height = 6480;
const app = new PIXI.Application({
  width,
  height,
  transparent: true
});

//
app.stage = new PIXI.display.Stage();

const container = new PIXI.Container();
app.stage.addChild(container);

document.getElementById("bg").appendChild(app.view);

class Mouse {
  constructor() {
    this.pos = new Vec2(0, 0);
    window.addEventListener("mousemove", e => {
      this.pos.x = e.offsetX;
      this.pos.y = e.offsetY;
    });
  }
}

const inputs = [
  {
    pos: {
      x: width / 2,
      y: 800
    }
  },
  new Mouse()
];

const states = {
  scene: 3
};

const setup = () => {
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

      this.inputSprites = [];

      for (let i = 0; i < inputs.length; i++) {
        const sprite = new PIXI.Sprite(resources["./assets/ring.png"].texture);
        this.inputSprites.push(sprite);
        sprite.tint = 0xf7ca00;
        sprite.width = 600;
        sprite.height = 600;
        sprite.anchor.set(0.5);
        this.container.addChild(sprite);
      }

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
      for (let i = 0; i < inputs.length; i++) {
        this.inputSprites[i].x = inputs[i].pos.x;
        this.inputSprites[i].y = inputs[i].pos.y;
      }

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

      this.inputSprites = [];

      for (let i = 0; i < inputs.length; i++) {
        const sprite = new PIXI.Sprite(resources["./assets/ring.png"].texture);
        this.inputSprites.push(sprite);
        sprite.tint = 0xf7ca00;
        sprite.width = 600;
        sprite.height = 600;
        sprite.anchor.set(0.5);
        this.container.addChild(sprite);
      }

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
      for (let i = 0; i < inputs.length; i++) {
        this.inputSprites[i].x = inputs[i].pos.x;
        this.inputSprites[i].y = inputs[i].pos.y;
      }

      this.t += delta;
      this.render();
    }
    render() {
      this.rects.forEach(rect => {
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
          } else {
            rect.rotation += 0.01;
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

      this.inputSprites = [];

      for (let i = 0; i < inputs.length; i++) {
        const sprite = new PIXI.Sprite(resources["./assets/ring.png"].texture);
        this.inputSprites.push(sprite);
        sprite.tint = 0xf7ca00;
        sprite.width = 600;
        sprite.height = 600;
        sprite.anchor.set(0.5);
        this.container.addChild(sprite);
      }

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
      for (let i = 0; i < inputs.length; i++) {
        this.inputSprites[i].x = inputs[i].pos.x;
        this.inputSprites[i].y = inputs[i].pos.y;
      }

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
        for (let i = 0; i < inputs.length; i++) {
          const input = inputs[i];
          const vector = new Vec2(rect.x - input.pos.x, rect.y - input.pos.y);

          if (vector.length() < 600) {
            rect.scale.set(vector.length() / 600);
            let angle = new Vec2(0, 1).angleTo(vector);
            rect.rotation = angle;
          } else {
            rect.rotation += 0.01;
          }
        }
      });
    }
  }

  class Trace {
    constructor() {
      this.container = new PIXI.Container();

      this.layer = new PIXI.display.Layer();
      this.layer.useRenderTexture = true;
      this.layer.useDoubleBuffer = true;
      var trailSprite = new PIXI.Sprite(this.layer.getRenderTexture());
      trailSprite.alpha = 0.9;
      this.layer.addChild(trailSprite);

      this.container.addChild(this.layer);
      var showLayer = new PIXI.Sprite(this.layer.getRenderTexture());
      this.container.addChild(showLayer);

      this.circles = [];
      for (let i = 0; i < 1000; i++) {
        const sprite = new PIXI.Sprite(
          resources["./assets/circle.png"].texture
        );
        sprite.tint = 0x000000;
        sprite.x = Math.random() * width;
        sprite.y = Math.random() * height;
        sprite.speed = Math.random() * 10;
        const size = Math.random() * 20;
        sprite.width = size;
        sprite.height = size;
        this.layer.addChild(sprite);
        this.circles.push(sprite);
      }
    }
    update() {
      this.render();
    }
    render() {
      this.circles.forEach(circle => {
        circle.x += circle.speed;
        circle.y += circle.speed;
        if (circle.x > width + 100) {
          circle.x = circle.x - width;
        }
        if (circle.y > height + 100) {
          circle.y = circle.y - height;
        }
      });
    }
  }

  // const ds = new DotSystem();
  // container.addChild(ds.container);
  // const grid = new Grid();
  // container.addChild(grid.container);
  // const corss = new Corss();
  // container.addChild(corss.container);
  // const rect = new Rect();
  // container.addChild(rect.container);

  const trace = new Trace();
  container.addChild(trace.container);

  app.ticker.add(delta => {
    // ds.container.visible = false;
    // grid.container.visible = false;
    // corss.container.visible = false;
    // rect.container.visible = false;

    trace.update();

    // if (states.scene === 0) {
    //   ds.container.visible = true;
    //   ds.update(delta);
    //   corss.container.visible = true;
    //   corss.update(delta);
    // }
    // if (states.scene === 1) {
    //   grid.container.visible = true;
    //   grid.update(delta);
    // }
    // if (states.scene === 2) {
    //   rect.container.visible = true;
    //   rect.update(delta);
    // }
  });
};

PIXI.loader
  .add([
    "./assets/line.png",
    "./assets/circle.png",
    "./assets/rect.png",
    "./assets/trangle.png",
    "./assets/crossbig.png",
    "./assets/ring.png"
  ])
  .on("progress", loader => {
    console.log("progress: " + loader.progress + "%");
  })
  .load(setup);
