// import { cursorTo } from "readline";
var w = 800;
var h = 600;

var config={
    type: Phaser.AUTO,
    width: w,
    height: h,
    scene:{
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var cursor;
var player;

function preload(){
    this.load.image('logo', 'face.jpg');
    this.load.image('green', 'green.png');
}

function create(){
    this.add.image(400, 300, 'green');
    cursor = this.input.keyboard.createCursorKeys();
    player = this.add.sprite(100, 100, 'logo');
}

function update(){
    if(cursor.up.isDown && player.y > 0) player.y-=10;
    if(cursor.down.isDown && player.y < h) player.y+=10;
    if(cursor.left.isDown && player.x > 0) player.x-=10;
    if(cursor.right.isDown && player.x < w) player.x+=10;
}