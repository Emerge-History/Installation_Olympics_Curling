const socket = io("http://localhost:3000");

var a, b;
var running = false;

var ang = Math.PI / 2;
socket.on("launch", data => {
  dt.text = "";
  console.log("launch", data);
  running = true;

  b = Bodies.circle(200, 500, 20, {
    frictionAir: 0.01,
    restitution: 0.6
  });

  World.add(engine.world, b);

  b.force.y = (-data / 10) * Math.sin(ang);
  b.force.x = (data / 10) * Math.cos(ang);
});
socket.on("theme", data => {
  console.log("theme", data);
});
socket.on("angle", data => {
  console.log("angle", data);
  ang = data;
});

function map(t, a, b, c, d) {
  return ((t - a) / (b - a)) * (d - c) + c;
}

function ease(cur, target, c, precision) {
  var delta = target - cur;
  if (Math.abs(delta) < (precision || 0.001)) {
    return cur;
  }
  return cur + delta * (c || 0.01);
}
const width = 1920;
const height = 6480;

// ========================
// const app = new PIXI.Application({
//   width,
//   height,
//   transparent: true
// });
// document.getElementById("bg").appendChild(app.view);
// PIXI.loader
//   .add(["./assets/line.png"])
//   .on("progress", loader => {
//     console.log("progress: " + loader.progress + "%");
//   })
//   .load(init);
// function init() {
//   class Mouse {
//     constructor() {
//       this.x = 0;
//       this.y = 0;
//       window.addEventListener("mousemove", e => {
//         this.x = e.offsetX;
//         this.y = e.offsetY;
//       });
//     }
//   }

//   const RES = PIXI.loader.resources;

//   const sprites = [];
//   const container = new PIXI.particles.ParticleContainer(40000, {
//     position: true,
//     tint: true
//   });
//   app.stage.addChild(container);

//   for (let i = 0; i < width; i += 70) {
//     for (let j = 0; j < height; j += 70) {
//       const sprite = new PIXI.Sprite(RES["./assets/line.png"].texture);
//       sprite.anchor.set(0.5);
//       sprite.x = i;
//       sprite.y = j;
//       sprite.$ox = sprite.x;
//       sprite.$oy = sprite.y;
//       sprite.distortion = {
//         x: 0,
//         y: 0
//       };
//       container.addChild(sprite);
//       sprites.push(sprite);
//     }
//   }

//   const mouse = new Mouse();

//   app.ticker.add(tick);

//   function tick() {
//     for (const sprite of sprites) {
//       var vec2 = new Vec2(mouse.x - sprite.x, mouse.y - sprite.y);
//       // var xAxes = new Vec2(1, 0);
//       // var yAxes = new Vec2(0, 1);
//       // var length = vec2.length();
//       // var x = (Math.cos(vec2.angleTo(xAxes)) * length) / 100;
//       // var y = (Math.sin(vec2.angleTo(yAxes)) * length) / 100;
//       // sprite.x += x;
//       // sprite.y += y;
//     }
//   }
// }
// ========================

const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

var engine = Engine.create({
  enableSleeping: true
});

engine.world.gravity.y = 0;

var render = Render.create({
  element: document.getElementById("bg"),
  engine: engine,
  options: {
    width: 1080 / 3,
    height: 1920 / 3,
    pixelRatio: 1,
    background: "#18181d",
    wireframeBackground: "#0f0f13",
    hasBounds: true,
    enabled: true,
    wireframes: true,
    showSleeping: true,
    showDebug: true,
    showBroadphase: false,
    showBounds: false,
    showVelocity: true,
    showCollisions: true,
    showSeparations: true,
    showAxes: true,
    showPositions: true,
    showAngleIndicator: true,
    showIds: true,
    showShadows: true,
    showVertexNumbers: false,
    showConvexHulls: true,
    showInternalEdges: false,
    showMousePosition: false
  }
});
Engine.run(engine);
Render.run(render);

// World.add(engine.world, rock);
// World.remove(engine.world, circleB)
a = Bodies.circle(200, 100, 20, {
  frictionAir: 0.01,
  restitution: 0.6
});

World.add(engine.world, a);

function loop() {
  requestAnimationFrame(loop);
  if (running) {
    if (a.isSleeping && b.isSleeping) {
      var last = {
        x: 200,
        y: 120
      };
      var disa = Math.sqrt(
        Math.pow(a.position.x - last.x, 2) + Math.pow(a.position.y - last.y, 2)
      );
      var disb = Math.sqrt(
        Math.pow(b.position.x - last.x, 2) + Math.pow(b.position.y - last.y, 2)
      );
      if (disa > disb) {
        World.remove(engine.world, a);
        a = b;
        b = null;
        
        dt.text = "你赢了";
      } else {
        World.remove(engine.world, b);
        a = b;
        b = null;
        dt.text = "你输了";
      }
      running = false;
      socket.emit("gameover");
    }
  }
}
loop();

const dt = {
  text: ""
};
const vm = new Vue({
  el: "#app",
  data:dt,
  computed: {},
  methods: {},
  mounted: function() {
    this.$nextTick(function() {});
  }
});
