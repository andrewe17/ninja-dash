// import { cursorTo } from "readline";
var w = 800;
var h = 600;

var config={
    type: Phaser.AUTO,
    width: w,
    height: h,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene:{
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var cursor;
var player;
var wall;
var dash;
var spacedown;

function preload(){
    this.load.image('grey', 'grey.png');
    this.load.image('ninja', 'ninja.png');
    this.load.image('wall', 'wall.png');
}

function create(){
    this.add.image(400, 300, 'grey');
    cursor = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    player = this.physics.add.sprite(100, 100, 'ninja');
    player.setCollideWorldBounds(true);
    player.setVelocity(0, 0);

    wall = this.physics.add.staticGroup();
    wall.create(300, 300, 'wall');
    this.physics.add.collider(player,wall);

    dash=2;
    spacedown=false;
}

function update(){
    if(cursor.up.isDown){
        player.setVelocityY(-200);
    }
    else if(cursor.down.isDown){
        player.setVelocityY(200);
    } 
    else{
        player.setVelocityY(0);
    }

    if(cursor.left.isDown){
        player.setVelocityX(-200);
    }
    else if(cursor.right.isDown){
        player.setVelocityX(200);
    }
    else{
        player.setVelocityX(0);
    }

    if(this.space.isDown){
        spacedown=true;
    }

    if(this.space.isUP && spacedown==true){
        player.x += 200;
        dash--;
        spacedown=false;
    }
    // double dash
    // hidden ninja function
}