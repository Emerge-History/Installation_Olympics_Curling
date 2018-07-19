var w = 1920;
var h = 1080;

var mask = new PIXI.Graphics()
mask.beginFill(0xffffff)
mask.drawRect(0, 0, 38, 205)
mask.endFill()

var app = new PIXI.Application(w, h, { backgroundColor: 0x163772 });
document.body.appendChild(app.view);

var updatables = [];

function loop(updateFunction) {
    updatables.push(updateFunction);
}

function loopStates(state) {
    loop((t, dt) => {
        for (var i in state) {
            if (state["_" + i] != undefined) {
                state["_" + i] += (state["_e_" + i] || 0.1) * (state[i] - state["_" + i]);
                state["_" + i] = Math.abs((state[i] - state["_" + i])) < 0.0001 ? state[i] : state["_" + i];
            }
        }
    });
}

function position(b, x, y) {
    if (x || y) {
        b.position.x = x;
        b.position.y = y;
    }
}

function center(b, x, y) {
    b.anchor.x = b.anchor.y = 0.5;
    position(b, x, y);
}

var scene = new PIXI.Container();
app.stage.addChild(scene);

scene.width = 1080;
scene.height = 1080;
scene.position.x = w / 2;
scene.position.y = h / 2;

var textures = {
    square: "./assets/square.png",
    stone: "./assets/binghu-red/binghu0001.png",
    shade: "./assets/shade.png",
    hand_push: "./assets/controller/an.png",
    icon_handle: "./assets/controller/shoubing.png",
    icon_platform: "./assets/controller/pingtai.png",
    hand_drag: "./assets/controller/shou.png",
    text_gameover: "./assets/controller/youxijieshu.png",
    text_joystick: "./assets/controller/shuabing.png",
    text_direction: "./assets/controller/fangxiang.png",
    text_release: "./assets/controller/zhiqiu.png",
    text_start: "./assets/controller/kaishi.png",
    text_before_release: "./assets/controller/lidu.png",
    bar_direction: "./assets/controller/fangxiangtiao.png",
    bar_power: "./assets/controller/lidu1.png",
    bar_power_fill: "./assets/controller/lidu2.png",
    bar_power_ticks: "./assets/controller/lidu3.png",
    icon_power: "./assets/controller/power.png",
    icon_joystick: "./assets/controller/yaogan.png",
    drag_dot: "./assets/controller/huakuai.png",
    drag_dot_hint: "./assets/controller/huitiao.png",
    btn_retry: "./assets/controller/jixutiaozhan.png",
    bg_field: "./assets/controller/saidao.png",
    bg: "./assets/controller/bg.png",
    triangle: "./assets/controller/sanjiao.png",
    tick_down: "./assets/controller/xiangxia.png",
};

for (var i in textures) {
    textures[i] = PIXI.Texture.fromImage(textures[i]);
}

/**Build da scene */
//bg
{
    let bg = new PIXI.Container();
    let bg_plane = new PIXI.Sprite(textures.bg);
    center(bg_plane);
    bg.addChild(bg_plane);
    scene.addChild(bg);
}

var particles = new PIXI.Container();
var MAX_LEN = 10000;
var particlesArr = [];

for (var i = 0; i < MAX_LEN; i++) {
    var p = new PIXI.Sprite(textures.square);
    p.alpha = 0;
    p.width = 15;
    p.height = 15;
    p.anchor.x = 0.5;
    p.anchor.y = 0.5;
    particlesArr.push(p);
    particles.addChild(p);
}

// particle
{

    //confetti
    var ps = [];
    var pool = [];

    for (var i = 0; i < MAX_LEN; i++) {
        pool.push({
            sprite: particlesArr[i],
            a: [0, 0],
            p: [0, 0],
            v: [0, 0],
            l: 0,
            vl: 0.5
        });
    }

    var randomColor = [0xa02f2e, 0xffffff];
    var randomColor2 = [0xffffff,  0xa02f2e];
    loop((t, dt) => {

        if (window.explode > 0) {
            window.explode--;
            for (var i = 0; i < 300; i++) {
                var q = pool.pop();
                if (!q) break;
                q.l = 1;
                q.vl = Math.random() * 0.3 + 0.1;
                q.inert = Math.random() * 0.1 + 0.9;
                q.a = [0, 0];
                q.p = [Math.random() * 30 - 15, Math.random() * 30 - 15];
                q.r = Math.random() * Math.PI * 2;
                q.vr = Math.random() - 0.5;
                q.v = [Math.random() * 2000 - 1000, Math.random() * 2000 - 1000];
                q.flip = Math.random();
                q.vflip = (Math.random() - 0.5) * 1;
                q.sprite.sz = Math.pow(Math.random(), 7);
                q.sprite.width =
                    q.sprite.height =
                    q.sprite.sz * 20 + 2;
                q.tintq = Math.floor(Math.random() * randomColor.length);
                ps.push(q);
            }
        }

        var good = [];
        var bad = pool;


        for (var i = 0; i < ps.length; i++) {
            ps[i].l -= ps[i].vl * dt;
            ps[i].sprite.alpha = Math.max(0, ps[i].l);
            if (ps[i].l > 0) {
                good.push(ps[i]);
            } else {
                bad.push(ps[i]);
                continue;
            }
            ps[i].a[0] = 0;
            ps[i].a[1] = ps[i].sprite.sz * 300;
            ps[i].r += ps[i].vr * dt;
            ps[i].flip += ps[i].vflip;

            ps[i].sprite.scale.y = Math.sin(ps[i].flip) * ps[i].sprite.sz / 4;
            ps[i].sprite.skew.y = Math.sin(ps[i].flip * 2) * 1;

            if(Math.sin(ps[i].flip * 2) < 0) {
                ps[i].sprite.tint = randomColor[ps[i].tintq];
            } else {
                ps[i].sprite.tint = randomColor2[ps[i].tintq];
            }

            for (var j = 0; j < 2; j++) {
                ps[i].v[j] += ps[i].a[j] * dt;
                ps[i].v[j] *= ps[i].inert;
                ps[i].p[j] += ps[i].v[j] * dt;
            }

            ps[i].sprite.rotation = ps[i].r;
            ps[i].sprite.position.x = ps[i].p[0];
            ps[i].sprite.position.y = ps[i].p[1];
        }
        ps = good;
        pool = bad;
    });
}

//controller
{
    var controlstate = {
        reset: 1,

        hint_angle: 0,
        _hint_angle: 0,
        _e_hint_angle: 0.1,

        angle_selected: 0,

        last_drag: 0,

        angle: 0,
        _angle: 0,
        _e_angle: 0.1,

        angle_enabled: 0,
        _angle_enabled: 0,

        selecting_power: 0,
        _selecting_power: 0,
        _e_selecting_power: 0.3,
        power: 0,

        ballY: 0,
        _ballY: 0,

        ball_enabled: 0,

        launched: 0,
        _launched: 0,

        launch_hint: 0,
        _launch_hint: 0,

        power_hint: 0,
        _power_hint: 0,

        gameover: 0,
        _gameover: 0,

        gui: 0,
        _gui: 0,

        inactive: 0,
        _inactive: 0,

    };

    document.body.addEventListener("touchstart", () => {
        if (controlstate.inactive) {
            controlstate.newgame = 1;
        }
    });

    window.controlstate = controlstate;

    loopStates(controlstate);

    let ui = new PIXI.Container();

    let controllers = new PIXI.Container();
    let joysticks = new PIXI.Container();
    let ball_container = new PIXI.Container();
    var gameover = new PIXI.Container();
    let ball = new PIXI.Sprite(textures.stone);
    let shade = new PIXI.Sprite(textures.shade);
    center(ball);
    center(shade, 30, 10);
    shade.alpha = 0.5;
    shade.height = 400;
    shade.width = 400;
    ball.height = 400;
    ball.width = 400;
    ball_container.addChild(shade);
    ball_container.addChild(ball);


    let angle_rotator = new PIXI.Container();
    let drag_dot_rotator = new PIXI.Container();
    let drag_dot_offset = new PIXI.Container();
    let drag_dot_hint = new PIXI.Container();
    let bar_direction_dot = new PIXI.Sprite(textures.drag_dot);
    let bar_direction_hint = new PIXI.Sprite(textures.drag_dot_hint);
    let bar_direction_touchhint = new PIXI.Sprite(textures.hand_drag);
    let bar_direction = new PIXI.Sprite(textures.bar_direction);
    let power_hint = new PIXI.Sprite(textures.hand_push);

    center(power_hint);
    position(power_hint, 0, 300);

    center(bar_direction_dot);
    center(bar_direction_hint);

    position(drag_dot_offset, 0, -270);

    drag_dot_offset.addChild(bar_direction_dot);
    drag_dot_hint.addChild(bar_direction_touchhint);
    drag_dot_hint.addChild(bar_direction_hint);
    drag_dot_offset.addChild(drag_dot_hint);
    drag_dot_rotator.addChild(drag_dot_offset);

    center(bar_direction, 0, -180);

    angle_rotator.addChild(bar_direction);
    angle_rotator.addChild(drag_dot_rotator);

    let text_direction_touchhint = new PIXI.Sprite(textures.text_direction);
    let text_direction_start = new PIXI.Sprite(textures.text_start);
    let text_before_release = new PIXI.Sprite(textures.text_before_release);
    let text_joystick = new PIXI.Sprite(textures.text_joystick);
    let text_release = new PIXI.Sprite(textures.text_release);
    let text_gameover = new PIXI.Sprite(textures.text_gameover);
    let btn_gameover = new PIXI.Sprite(textures.btn_retry);

    center(text_gameover);
    center(btn_gameover, 0, 280);
    gameover.addChild(btn_gameover);
    gameover.addChild(text_gameover);

    let joystick_handle1 = new PIXI.Sprite(textures.icon_handle);
    let joystick_handle2 = new PIXI.Sprite(textures.icon_handle);
    let joystick_platform = new PIXI.Sprite(textures.icon_platform);

    let bar_power = new PIXI.Sprite(textures.bar_power);
    let bar_power_fill = new PIXI.Sprite(textures.bar_power_fill);
    let bar_power_ticks = new PIXI.Sprite(textures.bar_power_ticks);
    let bar_power_lightning = new PIXI.Sprite(textures.icon_power);

    bar_power_fill.addChild(mask);
    bar_power_fill.mask = mask;

    bar_power.addChild(bar_power_lightning);
    bar_power.addChild(bar_power_fill);
    bar_power.addChild(bar_power_ticks);

    center(bar_power, 0, -45);
    center(bar_power_lightning, 0, -150);
    center(bar_power_fill);
    center(bar_power_ticks);

    center(text_joystick, 0, 390);
    center(text_release, 0, -420);
    center(text_direction_touchhint, 0, -412);
    center(text_direction_start, 0, -420);
    center(text_before_release, 0, -420);
    center(text_gameover, 0, -280);

    // let joystickPointer1 = new PIXI.Sprite(textures.tick_down);
    // let joystickPointer2 = new PIXI.Sprite(textures.tick_down);

    // let joystick_icon = new PIXI.Sprite(textures.icon_joystick);
    // center(joystick_icon, 0, -280);
    joysticks.position.y = -300;

    joystick_handle1.anchor.x = 0.5;
    joystick_handle2.anchor.x = 0.5;
    joystick_handle1.anchor.y = 1;
    joystick_handle2.anchor.y = 1;

    joystick_handle1.position.x = -57;
    joystick_handle2.position.x = 57;
    joystick_handle1.position.y = -5;
    joystick_handle2.position.y = -5;

    center(joystick_platform, 0, 25);
    joystick_platform.anchor.y = 1;

    joysticks.addChild(joystick_platform);
    joysticks.addChild(joystick_handle1);
    joysticks.addChild(joystick_handle2);

    ui.addChild(text_release);
    ui.addChild(text_before_release);
    ui.addChild(text_direction_touchhint);
    ui.addChild(text_direction_start);
    ui.addChild(text_joystick);


    controllers.addChild(bar_power);
    controllers.addChild(angle_rotator);

    ui.addChild(controllers);
    ui.addChild(joysticks);

    var _prevGameover = 0;
    loop((t) => {

        if (_prevGameover != controlstate.gameover) {
            if (controlstate.gameover == 1) {
                window.explode = 10;
            }
            _prevGameover = controlstate.gameover;
        }

        if (controlstate.newgame || controlstate.reset || controlstate.gameover) {
            controlstate.angle_enabled = 0;
            controlstate.last_drag = 0;
            controlstate.ball_enabled = 0;
            controlstate.launched = 0;
            controlstate.power = 0;
            controlstate.selecting_power = 0;
            controlstate.angle_selected = 0;
            controlstate.hint_angle = 0;
            controlstate._hint_angle = 0;
            controlstate.launch_hint = 0;
            controlstate._launch_hint = 0;
            controlstate._power_hint = 0;
            controlstate.power_hint = 0;
            controlstate.ballY = 800;
            controlstate._ballY = 800;
            controlstate.angle = controlstate._angle = 0;
            controlstate.gui = 0;
            if (controlstate.reset) {
                controlstate.gameover = 0;
                controlstate._gameover = 0;
                controlstate.inactive = 1;
            }
            if (controlstate.gameover) {
                controlstate.inactive = 0;
                controlstate._inactive = 0;
            }
            if (controlstate.newgame) {
                controlstate.inactive = 0;
                controlstate._inactive = 0;
                controlstate.gameover = 0;
                controlstate._gameover = 0;
                controlstate.gui = 1;
                controlstate.angle_enabled = 1;
                controlstate.ball_enabled = 1;
            }
            controlstate.reset = 0;
            controlstate.newgame = 0;
        }


        if (!controlstate.gameover && controlstate.ball_enabled && !controlstate.launched && !controlstate.selecting_power && controlstate.angle_selected) {
            controlstate.power_hint = 1;
        }
        else {
            controlstate.power_hint = 0;
        }

        if (controlstate.selecting_power) {
            controlstate.launch_hint = 1;
        }
        else {
            controlstate.launch_hint = 0;
        }

        if (controlstate.selecting_power) {
            controlstate.ballY = 250;

        } else if (controlstate.ball_enabled) {
            controlstate.ballY = 350;
        } else if (controlstate.launched) {
            controlstate.ballY = 250 - controlstate._launched * 1000;
        } else {
            controlstate.ballY = controlstate._ballY = 800;
        }

        ball_container.position.y = controlstate._ballY;
        controlstate.hint_angle = controlstate.gui * (!controlstate.angle_selected && !controlstate.selecting_power && !controlstate.launched) ? 1 : 0;

        bar_direction_hint.alpha = (Math.sin(t * 3) * 0.5 + 0.5) * controlstate._hint_angle * controlstate._angle_enabled;
        bar_direction_touchhint.alpha = (Math.sin(t * 10) * 0.2 + 0.6) * controlstate._hint_angle * controlstate._angle_enabled;

        angle_rotator.alpha = (controlstate._angle_enabled) + 0.3;

        bar_direction_touchhint.position.x = -30 + Math.sin(t * 4) * 30;
        bar_direction_touchhint.position.y = -Math.abs(Math.cos(t * 4) * 10);
        drag_dot_rotator.rotation = controlstate._angle;

        if (controlstate.selecting_power > 0) {
            controlstate.power = 0.5 + 0.5 * Math.sin(t * 1);
        }

        bar_power.alpha = controlstate._selecting_power;
        controllers.alpha = (1 - controlstate._launched) * controlstate.gui;
        position(mask, -38 / 2, 205 / 2 - 205 * controlstate.power);

        power_hint.alpha = controlstate.power_hint;
        power_hint.scale.x = 1 + Math.sin(t * 7) * 0.05;
        power_hint.scale.y = 1 + Math.sin(t * 7) * 0.05;

        text_before_release.alpha = controlstate.power_hint;
        text_direction_start.alpha = 0;// controlstate._hint_angle;
        // text_gameover.alpha = 0;

        text_direction_touchhint.alpha = controlstate._hint_angle;
        text_release.alpha = controlstate.launch_hint;

        joystick_handle1.rotation = Math.sin(t * 20) * 0.2;
        joystick_handle2.rotation = Math.cos(t * 20) * 0.2;
        joysticks.rotation = Math.sin(t * 10) * 0.1;

        text_joystick.alpha = joysticks.alpha = controlstate._launched; //controlstate.launched;

        text_direction_start.alpha = controlstate._inactive * (Math.sin(t * 10) * 0.2 + 0.8);
        gameover.alpha = controlstate._gameover;



    });

    ball.interactive = true;
    ball.start = () => {
        if (!controlstate.ball_enabled) return;
        this.pushed = true;
        controlstate.selecting_power = 1;
        controlstate.ball_enabled = 0;
        controlstate.angle_enabled = 0;
    };

    ball.end = () => {
        if (this.pushed) {
            this.pushed = false;
            controlstate.selecting_power = 0;
            controlstate.ball_enabled = 0;
            controlstate.launched = 1;
            controlstate.angle_enabled = 0;
        }
    };

    ball.move = () => {
        if (this.pushed) {
            controlstate.selecting_power = 1;
            controlstate.ball_enabled = 0;
            controlstate.angle_enabled = 0;
        }
    };

    ball
        // events for drag start
        .on('mousedown', ball.start)
        .on('touchstart', ball.start)
        // events for drag end
        .on('mouseup', ball.end)
        .on('mouseupoutside', ball.end)
        .on('touchend', ball.end)
        .on('touchendoutside', ball.end)
        // events for drag move
        .on('mousemove', ball.move)
        .on('touchmove', ball.move);



    bar_direction_dot.interactive = true;


    bar_direction_dot.start = () => {
        if (!controlstate.angle_enabled) return;
        this.dragging = true;
        controlstate.last_drag = Date.now();
    };
    bar_direction_dot.end = () => {
        if (!controlstate.angle_enabled) return;
        this.dragging = false;
        controlstate.angle_selected = 1;
        controlstate.last_drag = Date.now();
    };
    bar_direction_dot.move = (e) => {
        if (!controlstate.angle_enabled) return;
        if (this.dragging) {
            controlstate.last_drag = Date.now();
            var deg = Math.atan2(e.data.global.y - h / 2, e.data.global.x - w / 2);
            if (deg > Math.PI / 2) {
                deg = -deg;
            }
            deg += 3.14 / 2;
            controlstate.angle = Math.min(0.5, Math.max(deg, -0.5));
        }
    };

    bar_direction_dot
        // events for drag start
        .on('mousedown', bar_direction_dot.start)
        .on('touchstart', bar_direction_dot.start)
        // events for drag end
        .on('mouseup', bar_direction_dot.end)
        .on('mouseupoutside', bar_direction_dot.end)
        .on('touchend', bar_direction_dot.end)
        .on('touchendoutside', bar_direction_dot.end)
        // events for drag move
        .on('mousemove', bar_direction_dot.move)
        .on('touchmove', bar_direction_dot.move);

    btn_gameover.interactive = true;
    btn_gameover.reset = () => {
        if (controlstate.gameover) {
            controlstate.newgame = 1;
        }
    };
    btn_gameover.on("mouseup", btn_gameover.reset);
    btn_gameover.on("touchend", btn_gameover.reset);

    ui.addChild(gameover);
    ui.addChild(ball_container);
    ui.addChild(power_hint);


    scene.addChild(ui);
}

scene.addChild(particles);

var prevT = Date.now();
function update() {
    var t = Date.now() / 1000;
    var dt = t - prevT;
    prevT = t;
    for (var i = 0; i < updatables.length; i++) {
        updatables[i](t, dt);
    }
    requestAnimationFrame(update);
}

update();