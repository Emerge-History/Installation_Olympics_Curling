var w = 1920;
var h = 1080;

var app = new PIXI.Application(w, h, { backgroundColor: 0 });
document.body.appendChild(app.view);

var textures = {
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
    triangle: "./assets/controller/sanjiao.png",
    tick_down: "./assets/controller/xiangxia.png",
};

for(var i in textures) {
}