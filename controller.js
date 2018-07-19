var w = 1920;
var h = 1080;

var app = new PIXI.Application(w, h, { backgroundColor: 0x163772 });
document.body.appendChild(app.view);

var updatables = [];

function loop(updateFunction) {
    updatables.push(updateFunction);
}

function loopStates(state) {
    loop((t) => {
        for (var i in state) {
            if (state["_" + i] != undefined) {
                state["_" + i] += (state["_e_" + i] || 0.03) * (state[i] - state["_" + i]);
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
    stone: "./assets/binghu-red/binghu0001.png",
    hand_push: "./assets/controller/an.png",
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

//controller
{

    var controlstate = {
        hint_angle: 0,
        _hint_angle: 0,
        _e_hint_angle: 0.1,

        last_drag: 0,

        angle: 0,
        _angle: 0,
        _e_angle: 0.1
    };

    loopStates(controlstate);

    let ui = new PIXI.Container();
    let bar_direction = new PIXI.Sprite(textures.bar_direction);
    center(bar_direction, 0, -180);

    let drag_dot_rotator = new PIXI.Container();
    let drag_dot_offset = new PIXI.Container();
    let drag_dot_hint = new PIXI.Container();
    let bar_direction_dot = new PIXI.Sprite(textures.drag_dot);
    let bar_direction_hint = new PIXI.Sprite(textures.drag_dot_hint);
    let bar_direction_touchhint = new PIXI.Sprite(textures.hand_drag);


    let text_direction_touchhint = new PIXI.Sprite(textures.text_direction);
    let text_direction_start = new PIXI.Sprite(textures.text_start);
    let text_before_release = new PIXI.Sprite(textures.text_before_release);
    let text_joystick = new PIXI.Sprite(textures.text_joystick);
    let text_release = new PIXI.Sprite(textures.text_release);
    let text_gameover = new PIXI.Sprite(textures.text_gameover);
    center(text_joystick, 0, 390);
    center(text_release, 0, -400);
    center(text_direction_touchhint, 0, -412);
    center(text_direction_start, 0, -420);
    center(text_before_release, 0, -420);
    center(text_gameover, 0, -280);
    ui.addChild(text_joystick);
    ui.addChild(text_before_release);
    ui.addChild(text_direction_touchhint);
    ui.addChild(text_direction_start);
    ui.addChild(text_gameover);

    loop((t) => {
        controlstate.hint_angle = Date.now() - controlstate.last_drag > 1000 ? 1 : 0;

        bar_direction_hint.alpha = (Math.sin(t * 3) * 0.5 + 0.5) * controlstate._hint_angle;
        bar_direction_touchhint.alpha = (Math.sin(t * 10) * 0.2 + 0.6) * controlstate._hint_angle;

        bar_direction_touchhint.position.x = -30 + Math.sin(t * 4) * 30;
        bar_direction_touchhint.position.y = -Math.abs(Math.cos(t * 4) * 10);
        drag_dot_rotator.rotation = controlstate._angle;
    });
    bar_direction_dot.interactive = true;


    bar_direction_dot.start = () => {
        this.dragging = true;
        controlstate.last_drag = Date.now();
    };
    bar_direction_dot.end = () => {
        this.dragging = false;
        controlstate.last_drag = Date.now();
    };
    bar_direction_dot.move = (e) => {
        if (this.dragging) {
            controlstate.last_drag = Date.now();
            var deg = Math.atan2(e.data.global.y - h / 2, e.data.global.x - w / 2);
            console.log(deg);
            if (deg > Math.PI / 2) {
                deg = -deg;
            }
            deg += 3.14 / 2;
            controlstate.angle = Math.min(0.6, Math.max(deg, -0.6));
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


    center(bar_direction_dot);
    center(bar_direction_hint);

    position(drag_dot_offset, 0, -270);

    drag_dot_offset.addChild(bar_direction_dot);
    drag_dot_hint.addChild(bar_direction_touchhint);
    drag_dot_hint.addChild(bar_direction_hint);
    drag_dot_offset.addChild(drag_dot_hint);
    drag_dot_rotator.addChild(drag_dot_offset);

    ui.addChild(bar_direction);
    ui.addChild(drag_dot_rotator);
    scene.addChild(ui);
}


function update() {
    var t = Date.now() / 1000;
    for (var i = 0; i < updatables.length; i++) {
        updatables[i](t);
    }
    requestAnimationFrame(update);
}

update();