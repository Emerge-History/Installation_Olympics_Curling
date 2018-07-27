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

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const resources = PIXI.loader.resources;
const width = 1920;
const height = 6480;
const app = new PIXI.Application({
  width,
  height,
  transparent: true
});
app.stage = new PIXI.display.Stage();
const container = new PIXI.Container();
app.stage.addChild(container);
document.getElementById("bg").appendChild(app.view);
const mouse = new Vec2(0, 0);
window.addEventListener("mousemove", e => {
  mouse.x = e.offsetX;
  mouse.y = e.offsetY;
});
const inputs = [mouse];
//================================================================
//================================================================
//================================================================
//================================================================
//================================================================
//================================================================
class Base {
  constructor() {
    this.t = 0;
    this.container = new PIXI.Container();
    container.addChild(this.container);

    const sprite = new PIXI.Sprite(resources["./assets/rect.png"].texture);
    sprite.width = width;
    sprite.height = height;
    sprite.tint = 0xffffff;
    this.container.addChild(sprite);
  }
}

class Line extends Base {
  constructor() {
    super();
    this.pool = [];
    this.gravity = -10;
    this.dots = [];
    this.density = 60;

    this.randomDots = [];

    for (let i = 0; i < 3; i++) {
      const sprite = new PIXI.Sprite(resources["./assets/circle.png"].texture);
      sprite.anchor.set(0.5);
      const input = {
        pos: new Vec2(random(100, width - 100), random(500, height - 500)),
        type: 1,
        sprite,
        speed: Math.random() * 10 + 3,
        direction: [random(-10, 10), random(-10, 10)]
      };
      sprite.x = input.pos.x;
      sprite.y = input.pos.y;
      this.randomDots.push(input);
      this.container.addChild(sprite);
    }

    const layer = new PIXI.display.Layer();
    layer.useRenderTexture = true;
    layer.useDoubleBuffer = true;
    const trailSprite = new PIXI.Sprite(layer.getRenderTexture());
    layer.addChild(trailSprite);
    trailSprite.alpha = 0.9;
    const showLayer = new PIXI.Sprite(layer.getRenderTexture());

    this.container.addChild(layer);
    this.container.addChild(showLayer);

    this.particleContainer = new PIXI.particles.ParticleContainer(10000, {
      rotation: true,
      tint: true,
      scale: true
    });

    layer.addChild(this.particleContainer);
    // create pool
    for (let i = 0; i < 3000; i++) {
      const sprite = new PIXI.Sprite(
        resources["./assets/straight.png"].texture
      );
      sprite.anchor.set(0.5);
      this.pool.push(sprite);
      sprite.visible = false;
      this.particleContainer.addChild(sprite);
    }
    for (let i = 0; i < 1000; i++) {
      this.createDot(Math.random() * height);
    }
  }
  createDot(y = 0) {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].visible) {
        const sprite = this.pool[i];
        sprite.visible = true;
        const posX = Math.random() * width;
        const randomDots = this.randomDots;

        const dot = {
          invincible: random(0, 8) === 0,
          t: Math.random() * 100 + 20,
          alive: true,
          posX,
          pos: new Vec2(posX, y),
          targetPos: new Vec2(posX, y),
          nextPos: new Vec2(posX, y),
          mass: 2 + Math.random() * 2,
          frequency: Math.random() * 10,
          amplitude: 50 + Math.random() * 20,
          color: [0xffffff, 1],
          size: Math.random() * 20 + 20,
          sprite,
          update(gravity) {
            this.t += 0.01;
            const prevPos = this.pos.clone();
            this.targetPos.x =
              this.posX + Math.sin(this.t * this.frequency) * this.amplitude;
            this.targetPos.y -= gravity * this.mass;
            this.pos.x = ease(this.pos.x, this.targetPos.x, 0.2);
            this.pos.y = ease(this.pos.y, this.targetPos.y, 0.2);
            if (this.pos.y > height + 100) {
              this.alive = false;
              this.sprite.visible = false;
            }
            this.color[1] = Math.abs(Math.sin(this.t));

            const updateForce = (posArr, k) => {
              for (let i = 0; i < posArr.length; i++) {
                const input = posArr[i];
                // const vector = new Vec2(input.x, input.y).subtract(this.pos);
                // const length = vector.length();
                // let F = k / Math.pow(length, 2);
                // F = Math.min(F, 100);
                // const forceX = (vector.x / length) * F;
                // const forceY = (vector.y / length) * F;
                // this.pos.x -= forceX;
                // this.pos.y -= forceY;

                const vector = this.pos
                  .clone()
                  .subtract(new Vec2(input.x, input.y));
                const angleX = vector.angleTo(new Vec2(1, 0));
                const angleY = vector.angleTo(new Vec2(0, 1));
                const F = k / vector.length();
                const forceX = Math.sin(angleX) * F;
                const forceY = Math.sin(angleY) * F;
                this.pos.x += forceX;
                this.pos.y += forceY;
              }
            };

            if (!this.invincible) {
              updateForce(inputs, 40000);
              updateForce(randomDots.map(randomDot => randomDot.pos), 20000);
            }

            this.sprite.x = (this.pos.clone().x + prevPos.x) / 2;
            this.sprite.y = (this.pos.clone().y + prevPos.y) / 2;
            const vector = prevPos.subtract(this.pos.clone());
            this.sprite.rotation = Math.atan2(vector.y, vector.x) + Math.PI / 2;
            this.sprite.height = this.size * (vector.length() / 10);
            this.sprite.tint = this.color[0];
            this.sprite.alpha = this.color[1];
            this.sprite.width = this.size * 0.8;
          }
        };

        this.dots.push(dot);
        break;
      }
    }
  }
  update(delta) {
    this.t += delta;

    this.randomDots.forEach(randomDot => {
      randomDot.pos.x += (randomDot.direction[0] * randomDot.speed) / 10;
      randomDot.pos.y += (randomDot.direction[1] * randomDot.speed) / 10;
      if (randomDot.pos.y < -100) {
        randomDot.pos.y = height + 100;
      }
      if (randomDot.pos.y > height + 100) {
        randomDot.pos.y = -100;
      }
      if (randomDot.pos.x < -100) {
        randomDot.pos.x = width + 100;
      }
      if (randomDot.pos.x > width + 100) {
        randomDot.pos.x = -100;
      }
      randomDot.sprite.x = randomDot.pos.x;
      randomDot.sprite.y = randomDot.pos.y;
    });

    for (let i = 0; i < Math.round((-this.gravity / 100) * this.density); i++) {
      this.createDot();
    }
    this.dots = this.dots.filter(dot => dot.alive);
    this.dots.forEach(dot => {
      dot.update(this.gravity);
    });
  }
}

class Magnetic extends Base {
  constructor() {
    super();
    this.forcePoints = [];
    this.particleContainer = new PIXI.particles.ParticleContainer(10000, {
      rotation: true,
      tint: true,
      scale: true
    });
    this.container.addChild(this.particleContainer);
    this.rects = [];
    this.size = 40;
    this.margin = this.size / 2;
    this.initGrid();

    this.randomDots = [];
    for (let i = 0; i < 5; i++) {
      const sprite = new PIXI.Sprite(resources["./assets/circle.png"].texture);
      sprite.anchor.set(0.5);
      const input = {
        pos: new Vec2(random(100, width - 100), random(500, height - 500)),
        type: 1,
        sprite,
        speed: Math.random() * 10 + 3,
        direction: [random(-10, 10), random(-10, 10)]
      };
      sprite.x = input.pos.x;
      sprite.y = input.pos.y;
      this.randomDots.push(input);
      // this.container.addChild(sprite);
    }
  }
  initGrid() {
    for (let i = 0; i < width + this.size; i += this.size + this.margin) {
      for (let j = 0; j < height + this.size; j += this.size + this.margin) {
        const sprite = new PIXI.Sprite(resources["./assets/line.png"].texture);
        sprite.anchor.set(0.5);
        sprite.x = i;
        sprite.y = j;
        sprite.tint = 0xcccccc;
        sprite.width = this.size;
        sprite.height = this.size;
        this.particleContainer.addChild(sprite);
        this.rects.push(sprite);
      }
    }
  }
  update(delta) {
    this.t += delta;

    this.randomDots.forEach(randomDot => {
      randomDot.pos.x += (randomDot.direction[0] * randomDot.speed) / 10;
      randomDot.pos.y += (randomDot.direction[1] * randomDot.speed) / 10;
      if (randomDot.pos.y < -100) {
        randomDot.pos.y = height + 100;
      }
      if (randomDot.pos.y > height + 100) {
        randomDot.pos.y = -100;
      }
      if (randomDot.pos.x < -100) {
        randomDot.pos.x = width + 100;
      }
      if (randomDot.pos.x > width + 100) {
        randomDot.pos.x = -100;
      }
      randomDot.sprite.x = randomDot.pos.x;
      randomDot.sprite.y = randomDot.pos.y;
    });

    this.rects.forEach(rect => {
      let alphaTarget = Math.abs(
        noise.simplex3(rect.x / 500, rect.y / 5000, this.t / 100)
      )/1.5;

      let rotationTarget = noise.simplex3(
        rect.x / 500,
        rect.y / 500,
        this.t / 100
      );

      let sizeTarget = this.size;

      const updateForce = (posArr, r) => {
        for (let i = 0; i < posArr.length; i++) {
          const input = posArr[i];
          const vector = new Vec2(rect.x - input.x, rect.y - input.y);
          if (vector.length() < r) {
            sizeTarget = this.size * (vector.length() / (r * 2));
            alphaTarget = 1;
            let angle = new Vec2(0, 1).angleTo(vector);
            rotationTarget = angle + (Math.PI * 3) / 4 +this.t/50;
          }
        }
      };

      updateForce(this.randomDots.map(randomDot => randomDot.pos), 200);
      updateForce(inputs, 350);



      rect.alpha = ease(rect.alpha, alphaTarget, 0.08);
      // rect.width = ease(this.size, sizeTarget, 0.5);
      // rect.height = ease(this.size, sizeTarget, 0.5);
      rect.rotation = ease(rect.rotation, rotationTarget, 0.5);
    });

    this.render();
  }
  render() {}
}

class Grid extends Base {
  constructor() {
    super();
    this.particleContainer = new PIXI.particles.ParticleContainer(10000, {
      rotation: true,
      tint: true,
      scale: true
    });
    this.container.addChild(this.particleContainer);
    this.rects = [];
    this.size = 40;
    this.margin = this.size / 2;
    this.initGrid();
    this.r = 400;

    // this.randomDots = [];
    // for (let i = 0; i < 10; i++) {
    //   const sprite = new PIXI.Sprite(resources["./assets/circle.png"].texture);
    //   sprite.anchor.set(0.5);
    //   const input = {
    //     pos: new Vec2(random(100, width - 100), random(500, height - 500)),
    //     type: 1,
    //     sprite,
    //     speed: Math.random() * 10 + 3,
    //     direction: [random(-10, 10), random(-10, 10)]
    //   };
    //   sprite.x = input.pos.x;
    //   sprite.y = input.pos.y;
    //   this.randomDots.push(input);
    //   // this.container.addChild(sprite);
    // }
  }
  initGrid() {
    for (let i = 0; i < width + this.size; i += this.size + this.margin) {
      for (let j = 0; j < height + this.size; j += this.size + this.margin) {
        const sprite = new PIXI.Sprite(resources["./assets/rect.png"].texture);
        sprite.anchor.set(0.5);
        sprite.x = i;
        sprite.y = j;
        sprite.tint = 0;
        sprite.width = this.size;
        sprite.height = this.size;
        this.particleContainer.addChild(sprite);
        this.rects.push(sprite);
      }
    }
  }
  update(delta) {
    this.t += delta;

    // this.randomDots.forEach(randomDot => {
    //   randomDot.pos.x += (randomDot.direction[0] * randomDot.speed) / 10;
    //   randomDot.pos.y += (randomDot.direction[1] * randomDot.speed) / 10;
    //   if (randomDot.pos.y < -100) {
    //     randomDot.pos.y = height + 100;
    //   }
    //   if (randomDot.pos.y > height + 100) {
    //     randomDot.pos.y = -100;
    //   }
    //   if (randomDot.pos.x < -100) {
    //     randomDot.pos.x = width + 100;
    //   }
    //   if (randomDot.pos.x > width + 100) {
    //     randomDot.pos.x = -100;
    //   }
    //   randomDot.sprite.x = randomDot.pos.x;
    //   randomDot.sprite.y = randomDot.pos.y;
    // });

    this.rects.forEach(rect => {
      let alphaTarget =
        Math.abs(noise.simplex3(rect.x / 100, rect.y / 100, this.t / 100)) / 2;
      let sizeTarget = this.size;

      const updateForce = (posArr, r) => {
        for (let i = 0; i < posArr.length; i++) {
          const input = posArr[i];
          const vector = new Vec2(rect.x - input.x, rect.y - input.y);
          if (vector.length() < r) {
            sizeTarget = this.size * (vector.length() / (r * 2));
            rect.alpha += r / vector.length();
            rect.alpha = Math.min(rect.alpha , 1);
          }
        }
      };

      // updateForce(this.randomDots.map(randomDot => randomDot.pos), 100);
      updateForce(inputs, 400);

      rect.width = ease(this.size, sizeTarget, 0.5);
      rect.height = ease(this.size, sizeTarget, 0.5);

      rect.alpha = ease(rect.alpha, alphaTarget,0.1);
    });

    this.render();
  }
  render() {}
}

//================================================================
//================================================================
//================================================================
//================================================================
//================================================================
//================================================================
const states = {
  scene: 0
};

const setup = () => {
  const magetic = new Magnetic();
  const gird = new Grid();
  const line = new Line();

  app.ticker.add(delta => {
    gird.container.visible = false;
    magetic.container.visible = false;
    line.container.visible = false;
    if (states.scene === 0) {
      magetic.container.visible = true;
      magetic.update(delta);
    }
    if (states.scene === 1) {
      gird.container.visible = true;
      gird.update(delta);
    }
    if (states.scene === 2) {
      line.container.visible = true;
      line.update(delta);
    }
  });
};

PIXI.loader
  .add([
    "./assets/straight.png",
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
