var config={
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true,
            gravity: { y: 0 }

        }
    },
    scene:{
        preload: preload,
        create: create,
        update: update
    }
};

var uNametext = document.getElementById('uName').innerHTML;

var game = new Phaser.Game(config);

var mapx = 2400; // need a map that's 3000+200 x
var mapy = 2400; // and 2000+200 y

// keyboard
var cursor;
var w, a, s, d, space;
var one, two, three, four, upgrade;
//audio
var m, n, b;
var flash;
var katana;
var shuriThrow;
var hit;
var music;
var bg;
var mute_sound=0;
var mute_music=0;
var mute_bg=0;
var rng;
// mouse
var pointer;
var mousex;
var mousey;
var vel=200; // velocity
var velx=vel, vely=vel;
// objects
var player;
var wall;
// dash
var dash;
var dashtime;
var dashreg;
var dashani;
// weapons
var options;
var otext;
// melee weapon
var kata;
var katatime;
var katareg;
// ranged weapon
var shuri;
var shuritime;
var shurireg;
// stun+damange mine
var kibaku;
var kibakutime;
var kibakureg;
// healing
var saisei;
var saiseitime;
var saiseireg;
var upgrade_time;
// cannot use ctrl+c or move
var health, kills, deaths, gold; // misc
var text1, text2, text3, text4; // textbox
// game over text
var end, player1, player2, player3, player4;
var playernum = 0;
var gameInfo = [];
// mouse
var mousex;
var mousey;
var angle;

// global time
var game_time;
var game_starts=false;
var game_over=false;

//ui
var ui_dash,ui_shuriken,ui_katana;
var killInfo = [];

// killInfo.push('a Kills B');
// killInfo.push('sadaa Kills B');
// killInfo.push('a12212 Kills B');
// killInfo.push('----a Kills B');
// killInfo.push(';#####ddda Kills B');
var killInfoPtr = [];



function popInfo(){
    if(killInfo.size != 0){
        killInfo.shift();
        drawInfo();
    }
}

function drawInfo(){
    killInfoPtr.forEach( function(element, index) {
        if(killInfo[index] != null){
            element.setText(killInfo[index]);
        }else {
            element.setText('');
        }
    });
}

function preload(){
    var offset = 30;
    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();
    progressBox.fillStyle(0xFF2222, 0.8);
    progressBox.fillRect(240, 290 + offset, 320, 50);

    var width = this.cameras.main.width;
    var height = this.cameras.main.height;

    var logoText = this.make.text({
        x: width / 2,
        y: height / 2 - 150 ,
        text: 'Getting ready..',
        style: {
            font: '50px ninjafont',
            fill: '#1d68ff'
        }
    });

    logoText.setOrigin(0.5,0.5);

    var percentText = this.make.text({
        x: width / 2,
        y: height / 2 + 15  + offset,
        text: '0%',
        style: {
            font: '18px Courier',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 70  + offset,
        text: '',
        style: {
            font: '18px Courier',
            fill: '#ffffff'
        }
    });

    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 99) + '%');
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(250, 300  + offset, 300 * value, 30);
    });
    // var proloadSelf = this;
    // var loading;
    // var loadingAnime;
    this.load.on('fileprogress', function (file) {
        //console.log(file);
        // if(file.key === 'ninja_right'){
        //     loadingAnime = {
        //         key: 'load',
        //         frames: proloadSelf.anims.generateFrameNumbers('ninja_right',{start: 0, end: 2}),
        //         frameRate: 16,
        //         repeat: -1
        //     };
        //     proloadSelf.anims.create(loadingAnime);
        //     loading = proloadSelf.add.sprite(width/2, height/2, 'ninja_right');
        //     loading.anims.play('load');
        // }
        assetText.setText('Loading ' + file.type + ':  ' + file.key );
    });

    this.load.on('complete', function () {
        assetText.setText('Complete!');
        progressBar.destroy();
        progressBox.destroy();
        percentText.destroy();
        assetText.destroy();
        //loading.destroy();
    });

    this.load.image('wall', 'assets/images/wall.png');
    this.load.image('twall', 'assets/images/Twall.png');
    this.load.image('van', 'assets/images/van.jpg');
    this.load.image('ninja', 'assets/images/ninja.png');
    this.load.image('slash', 'assets/images/slash.png');
    this.load.image('shuri', 'assets/images/shuri.png');
    this.load.image('rain', 'assets/images/rain.png');
    this.load.image('snow', 'assets/images/snow.png');
    this.load.image('cloud', 'assets/images/cloud.png');
    this.load.image('star', 'assets/images/star.png');

    //load UI
    this.load.image('ui_shuriken', 'assets/images/UI_shuriken.png');
    this.load.image('ui_katana', 'assets/images/UI_katana.png');
    this.load.image('ui_dash', 'assets/images/UI_dash.png');
    this.load.image('ui_disable', 'assets/images/UI_disable.png');
    this.load.image('ui_info', 'assets/images/info.png');

    this.load.audio('katana',  ['assets/audio/Sound-katana.mp3'] );
    this.load.audio('flash',  ['assets/audio/Sound-dash.mp3'] );
    this.load.audio('hit',  ['assets/audio/Sound-hit.mp3'] );
    this.load.audio('shuriThrow',  ['assets/audio/Sound-throw.mp3'] );
    this.load.audio('rain',  ['assets/audio/Background-rain.mp3'] );
    this.load.audio('snow',  ['assets/audio/Background-snow.mp3'] );
    this.load.audio('thunder',  ['assets/audio/Background-thunder.mp3'] );
    this.load.audio('ancients',  ['assets/audio/Music-Song of the Ancients.mp3'] );
    this.load.audio('loneliness',  ['assets/audio/Music-Loneliness.mp3'] );
    this.load.audio('strike',  ['assets/audio/Music-Strong and Strike.mp3'] );
    // this.load.audio('wretched',  ['assets/audio/Music-Wretched Weaponry.mp3'] ); // can we delete this, it's 9 mb...

    this.load.spritesheet('ninja_up', 'assets/images/ninja_up.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('ninja_down', 'assets/images/ninja_down.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('ninja_left', 'assets/images/ninja_left.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('ninja_right', 'assets/images/ninja_right.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('ninja_smoke', 'assets/images/ninja_smoke.png', {frameWidth: 32, frameHeight: 32});
    this.load.spritesheet('slash_anim', 'assets/images/slash_anim.png', {frameWidth: 16, frameHeight: 16});
    this.load.spritesheet('kata_anim', 'assets/images/kata_anim.png', {frameWidth: 46, frameHeight: 46});
    this.load.spritesheet('shuri_anim', 'assets/images/shuri_anim.png', {frameWidth: 13, frameHeight: 13});
    this.load.spritesheet('star_anim', 'assets/images/star.png', {frameWidth: 24, frameHeight: 22});
}

function create(){

    // effects audio
    katana = this.sound.add('katana');
    flash = this.sound.add('flash');
    hit = this.sound.add('hit');
    shuriThrow = this.sound.add('shuriThrow');
    // music audio
    rng = Math.floor((Math.random() * 3) + 1);
    if(rng==1){
        music = this.sound.add('ancients');
    }
    else if(rng==2){
        music = this.sound.add('loneliness');
    }
    else if(rng==3){
        music = this.sound.add('strike');
    }
    bg = this.sound.add('snow');
    // unlock sound
    if (this.sound.locked)
        this.sound.unlock();
    bg.play({
        volume: .1,
        loop: true
    });
    music.play({
        volume: .1,
        loop: true
    });
    // camera
    this.cameras.main.setBounds(0, 0, mapx, mapy);
    this.physics.world.setBounds(0, 0, mapx, mapy);

    // background
    this.add.image(mapy/2, mapy/2, 'van');


    // walls
    wx = this.physics.add.staticGroup();
    wy = this.physics.add.staticGroup();
    // stars
    stars = this.physics.add.staticGroup();

    waterLayer = this.physics.add.staticGroup();
    maze();

    var self = this;
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            }
            else {
                addOtherPlayers(self, players[id]);
            }
        });
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.healthText.destroy();
                otherPlayer.nameText.destroy();
                otherPlayer.destroy();
            }
        });
    });

    this.socket.on('deletePlayer', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.healthText.destroy();
                otherPlayer.nameText.destroy();
                otherPlayer.destroy();
            }
        });
    });

    this.socket.on('playerMoved', function (playerInfo) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                console.log(playerInfo.dashed);
                if(playerInfo.dashed==1){
                    smoke=self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ninja');

                    smoke.anims.play('ninja_smoke');
                }
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                otherPlayer.healthText.x = playerInfo.x - 12;
                otherPlayer.healthText.y = playerInfo.y - 20;
                otherPlayer.nameText.x = playerInfo.x - 12;
                otherPlayer.nameText.y = playerInfo.y - 35;
                otherPlayer.healthText.setText(healthToText(playerInfo.health));
                otherPlayer.nameText.setText(playerInfo.s_username);

                // animation handling of otherplayers
                if(playerInfo.f==1) otherPlayer.anims.play('ninja_up');
                else if(playerInfo.f==3) otherPlayer.anims.play('ninja_left');
                else if(playerInfo.f==4) otherPlayer.anims.play('ninja_right');
                else if(playerInfo.f==2) otherPlayer.anims.play('ninja_down');
            }
        });
    });
    // receiving katana slash
    this.socket.on('playerSlashed', function (slashInfo) {
        katana.play();
        var slash=self.physics.add.sprite(slashInfo.x, slashInfo.y, 'slash');
        slash.play('kata_anim');
        slash.rotation = slashInfo.r; // slash angle
        slash.on('animationcomplete', ()=>{slash.destroy();});
    });

     // receiving dash
    this.socket.on('smoke_ani', function (smokeInfo) {
        flash.play();
        var smoke=self.physics.add.sprite(smokeInfo.x, smokeInfo.y, 'dashobject');
        smoke.play('ninja_smoke');
        smoke.setVelocityX(smokeInfo.velx);
        smoke.setVelocityY(smokeInfo.vely);
        smoke.on('animationcomplete', ()=>{smoke.destroy();});
    });
    // receiving shuriken toss
    this.socket.on('shurikenToss', function (shurikenInfo) {
        shuriThrow.play();
        var toss = ss.create(shurikenInfo.initX, shurikenInfo.initY, 'shuri');
        //var toss = self.physics.add.sprite(shurikenInfo.initX, shurikenInfo.initY, 'shuri');
        toss.play('shuri_anim');
        toss.setVelocityX(shurikenInfo.velX);
        toss.setVelocityY(shurikenInfo.velY);
    });

    // receiving shuriken hit
    this.socket.on('shurikenHit', function (playerInfo){
        hit.play(); // sound
        //console.log(playerInfo.playerId);
        //console.log(self.socket.id);
        if(playerInfo.playerId === self.socket.id){
            //console.log('selfplayer');
            self.ninja.deaths = playerInfo.deaths;
            self.ninja.health = playerInfo.health;
            self.ninja.x = playerInfo.x;
            self.ninja.y = playerInfo.y;
            health = playerInfo.health;
            deaths = playerInfo.deaths;
            self.ninja.healthText.setText(healthToText(playerInfo.health));
        }
        else{
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
                if (playerInfo.playerId === otherPlayer.playerId) {
                    //console.log('otherplayer');
                    otherPlayer.health = playerInfo.health;
                    otherPlayer.healthText.setText(healthToText(playerInfo.health));
                }
            });
        }
    });
    // update kill counter
    this.socket.on('shurikenKill', function (playerInfo,killer,dead){
        if(playerInfo.playerId === self.socket.id){
            //console.log('increase kills');
            kills=playerInfo.kills;
        }
    });

    this.socket.on('killInfo', function (killer,dead){
        killInfo.push(killer + ' Kills ' + dead);
        if(killInfo.size > 5){
            killInfo.shift();
        }
        drawInfo();
    });

    // receiving game over data
    this.socket.on('gameover', function (endData){
        gameInfo.push('Username: ' + endData.id + ', Kills: ' + endData.kills + ', Deaths: ' + endData.deaths);
        game_over=true;
        playernum++;
    });

    //submit chat message
    $('form').submit(function(e){
        //e.preventDefault(); // prevents page reloading
        self.socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    //append chat message
    this.socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
    //append online user
    this.socket.on('is_online', function(username) {
        $('#messages').append($('<li>').html(username));
    });
    // ask username
    //var username = prompt('Please tell me your name');
    this.socket.emit('username', uNametext);

    // keyboard
    cursor = this.input.keyboard.createCursorKeys();
    w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.keyboard.removeCapture('W,S,A,D,SPACE');
    one = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    two = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    three = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);
    four = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR);
    this.input.keyboard.removeCapture('ONE,TWO,THREE,FOUR');
    upgrade = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    m = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    n = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
    b = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    this.input.keyboard.removeCapture('M,N,B');
    // mouse
    pointer = this.input.activePointer; // mouse location relative to screen

    text4=this.add.text(700, 580, '', {fontFamily:'"Roboto Condensed"', fill: '#ffffff'}).setScrollFactor(0);
    // waiting for players
    this.socket.on('waiting', (player_count)=>{
        text4.setText([
            player_count+'/4 players',
        ]);
    });

    // game starts
    this.socket.on('game_start', ()=>{
        text4.setText([
            'game start',
        ]);
        game_starts=true;
        game_time=this.time.now+(1000*60*10); // 1000*60*10
    });

    // dash
    dash=0;
    dashtime=this.time.now;
    dashreg=this.time.now;

    // animations
    this.anims.create({
        key: 'ninja_up',
        frames: this.anims.generateFrameNumbers('ninja_up'),
        frameRate: 16,
        repeat: 1
    });
    this.anims.create({
        key: 'ninja_down',
        frames: this.anims.generateFrameNumbers('ninja_down'),
        frameRate: 16,
        repeat: 1
    });
    this.anims.create({
        key: 'ninja_left',
        frames: this.anims.generateFrameNumbers('ninja_left'),
        frameRate: 16,
        repeat: 1
    });
    this.anims.create({
        key: 'ninja_right',
        frames: this.anims.generateFrameNumbers('ninja_right'),
        frameRate: 16,
        repeat: 1
    });
    this.anims.create({
        key: 'ninja_smoke',
        frames: this.anims.generateFrameNumbers('ninja_smoke'),
        frameRate: 50,
        repeat: 1
    });
    this.anims.create({
        key: 'slash_anim',
        frames: this.anims.generateFrameNumbers('slash_anim'),
        frameRate: 320,
        repeat: 1
    });
    this.anims.create({
        key: 'kata_anim',
        frames: this.anims.generateFrameNumbers('kata_anim'),
        frameRate: 64,
        repeat: 0
    });
    this.anims.create({
        key: 'shuri_anim',
        frames: this.anims.generateFrameNumbers('shuri_anim'),
        frameRate: 16,
        repeat: -1
    });
    this.anims.create({
        key: 'star_anim',
        frames: this.anims.generateFrameNumbers('star_anim'),
        frameRate: 1,
        repeat: 20
    });

    // collisions
    ss = this.physics.add.group(); // shurikens
    kk = this.physics.add.group(); // katana
    dd = this.physics.add.group(); // dash
    this.physics.add.overlap(this.otherPlayers, ss, function(player, ss){
        shurihit(self, player, ss);
    });
    this.physics.add.overlap(this.otherPlayers, kk, function(player, kk){
        katahit(self, player, kk);
    });
    this.physics.add.overlap(this.otherPlayers, dd, function(player, dd){
        dashhit(self, player, dd);
    });
    this.physics.add.collider(wx, ss, function(wx, ss){ // wall and shuri
        shuri_destroy(wx, ss);
    });
    this.physics.add.overlap(this.otherPlayers, stars, function(player, stars){ // wall and shuri
        stars_destroy(player, stars);
    });
    spawn_time = this.time.now;

    // weapons
    options=1;
    kata=0;
    katatime=this.time.now;
    katareg=this.time.now;
    shuri=0;
    shuritime=this.time.now;
    shurireg=this.time.now;
    kibaku=0;
    saisei=0;
    upgrade_time = this.time.now;
    // probably better if ninjas have to search for items!!

    // misc
    health=100;
    kills=0;
    gold=0;
    deaths=0;

    ui_x = 600;
    ui_y = 550;
    ui_text_offset = 12;

    //ui
    ui_selection = this.add.graphics().setScrollFactor(0);

    ui_info_y = 525;

    ui_info = this.add.image(100, ui_y, 'ui_info').setScrollFactor(0);
    healthX = 30;
    healthY = 558;
    healthWidth = 140;
    healthHeight = 13;

    ui_health_l = this.add.graphics().setScrollFactor(0);
    ui_health_l.fillStyle(0x00ff00, 1);
    ui_health_l.fillRect(healthX, healthY, healthWidth, healthHeight);
    ui_heal_text =this.add.text( 90, ui_info_y + 28,'100', {fontFamily:'"Roboto Condensed"', fontSize:'18px' ,fill: '#2255ff'}).setScrollFactor(0);
    ui_kill_text =this.add.text( 100, ui_info_y,'0', {fontFamily:'"Roboto Condensed"', fontSize:'22px' ,fill: '#000000'}).setScrollFactor(0);
    ui_death_text = this.add.text( 155, ui_info_y, '0', {fontFamily:'"Roboto Condensed"', fontSize:'22px' ,fill: '#000000'}).setScrollFactor(0);
    ui_coin_text =this.add.text(50, ui_info_y,'0', {fontFamily:'"Roboto Condensed"', fontSize:'22px' ,fill: '#000000'}).setScrollFactor(0);

    ui_dash = this.add.image(ui_x + 160,ui_y,'ui_dash');
    ui_dash_disable = this.add.image(ui_x + 160,ui_y,'ui_disable').setScrollFactor(0);
    ui_dash.setScrollFactor(0);
    ui_dash_text = this.add.text(ui_x + 160  + ui_text_offset, ui_y + ui_text_offset, ' 2', {fontFamily:'"Roboto Condensed"', fill: '#000000'}).setScrollFactor(0);

    ui_shuriken = this.add.image(ui_x + 70 ,ui_y,'ui_shuriken');
    ui_shuriken_disable = this.add.image(ui_x + 70,ui_y,'ui_disable').setScrollFactor(0);
    ui_shuriken.setScrollFactor(0);
    ui_shuriken_text = this.add.text(ui_x + 70 + ui_text_offset, ui_y + ui_text_offset, '10', {fontFamily:'"Roboto Condensed"', fill: '#000000'}).setScrollFactor(0);

    ui_katana = this.add.image(ui_x,ui_y,'ui_katana');
    ui_katana_disable = this.add.image(ui_x , ui_y,'ui_disable').setScrollFactor(0);
    ui_katana.setScrollFactor(0);
    ui_katana_text = this.add.text(ui_x + ui_text_offset , ui_y + ui_text_offset, '∞', {fontFamily:'"Roboto Condensed"', fill: '#000000'}).setScrollFactor(0);


    ui_selection.fillStyle(0xff5555, 1);
    ui_selection.fillRect(ui_x - 34,ui_y -34,68,68);

    // text
    text1=this.add.text(0, 0, '', {fontFamily:'"Roboto Condensed"', fill: '#ffffff'}).setScrollFactor(0);
    text2=this.add.text(700, 0, '', {fontFamily:'"Roboto Condensed"', fill: '#ffffff'}).setScrollFactor(0);
    text3=this.add.text(0, 580, '', {fontFamily:'"Roboto Condensed"', fill: '#ffffff'}).setScrollFactor(0);
    end = this.add.text(200, 0, '', {backgroundColor: 'DarkBlue', font:'72px Roboto Condensed', fill: 'white'}).setScrollFactor(0)
    player1 = this.add.text(200, 100, '', {backgroundColor: 'white', font:'36px Roboto Condensed', fill: 'DarkBlue'}).setScrollFactor(0)
    player2 = this.add.text(200, 200, '', {backgroundColor: 'white', font:'36px Roboto Condensed', fill: 'DarkBlue'}).setScrollFactor(0)
    player3 = this.add.text(200, 300, '', {backgroundColor: 'white', font:'36px Roboto Condensed', fill: 'DarkBlue'}).setScrollFactor(0)
    player4 = this.add.text(200, 400, '', {backgroundColor: 'white', font:'36px Roboto Condensed', fill: 'DarkBlue'}).setScrollFactor(0)

    //text4=this.add.text(700, 580, '', {fontFamily:'"Roboto Condensed"', fill: '#ffffff'}).setScrollFactor(0);

    // weather effects
    var rain_particles = this.add.particles('rain');
    var snow_particles = this.add.particles('snow');
    var cloud_particles = this.add.particles('cloud');
    this.socket.on('weather', function(current_weather) {
        //current_weather='Snow'; // testing only
      //  console.log(current_weather);
        rain_particles.destroy();
        snow_particles.destroy();
        cloud_particles.destroy();
        rain_particles = self.add.particles('rain');
        snow_particles = self.add.particles('snow');
        cloud_particles = self.add.particles('cloud');
        bg.stop();
        // Thunderstorm, Drizzle, Rain, Snow, Clear, Clouds
        // Mist, Smoke, Haze, Dust, Fog, Sand, Dust, Ash, Squall, Tornado
        if(current_weather=='Drizzle' || current_weather=='Rain'){
            bg = self.sound.add('rain');
            bg.play({
                volume: .1,
                loop: true
            });
            rain_particles.createEmitter({
                x:{min:0, max: mapx},
                y:{min:0, max: mapy},
                lifespan:4000,
                speedX: {min:0, max:-100},
                speedY: {min:400, max:800},
                scale: {start:0.5, end: 0},
                quantity:12,
            });
        }
        else if(current_weather=='Snow'){
            bg = self.sound.add('snow');
            bg.play({
                volume: .1,
                loop: true
            });
            snow_particles.createEmitter({
                x:{min:0, max: mapx},
                y:{min:0, max: mapy},
                lifespan:2000,
                speedX: {min:0, max:0},
                speedY: {min:0, max:100},
                scale: {start:0.5, end: 0},
                quantity:4,
            });
        }
        else if(current_weather=='Clouds'){
            bg = self.sound.add('snow');
            bg.play({
                volume: .1,
                loop: true
            });
            cloud_particles.createEmitter({
                x:{min:0, max: mapx},
                y:{min:0, max: mapy},
                lifespan:10000,
                speedX: {min:0, max:10},
                speedY: {min:0, max:0},
                scale: {start:10, end: 0},
                quantity:4,
            });
        }
        else if(current_weather=='Thunderstorm'){
            bg = self.sound.add('thunder');
            bg.play({
                volume: .1,
                loop: true
            });
            cloud_particles.createEmitter({
                x:{min:0, max: mapx},
                y:{min:0, max: mapy},
                lifespan:10000,
                speedX: {min:0, max:10},
                speedY: {min:0, max:0},
                scale: {start:10, end: 0},
                quantity:4,
            });
            rain_particles.createEmitter({
                x:{min:0, max: mapx},
                y:{min:0, max: mapy},
                lifespan:4000,
                speedX: {min:0, max:-100},
                speedY: {min:400, max:800},
                scale: {start:0.5, end: 0},
                quantity:12,
            });
        }
        else{
            bg = self.sound.add('snow');
            bg.play({
                volume: .1,
                loop: true
            });
        }
    });
    // // chat toggle
    // toggle = true;
    // toggle_time = this.time.now;
    killInfo_X = 500;
    killInfo_Y = 10;
    killInfoPtr.push(this.add.text(killInfo_X, killInfo_Y, '', {fontFamily:'"Roboto Condensed"', fill: '#22ccff'}).setScrollFactor(0));
    killInfoPtr.push(this.add.text(killInfo_X, killInfo_Y + 20, '', {fontFamily:'"Roboto Condensed"', fill: '#22ccff'}).setScrollFactor(0));
    killInfoPtr.push(this.add.text(killInfo_X, killInfo_Y + 40, '', {fontFamily:'"Roboto Condensed"', fill: '#22ccff'}).setScrollFactor(0));
    killInfoPtr.push(this.add.text(killInfo_X, killInfo_Y + 60, '', {fontFamily:'"Roboto Condensed"', fill: '#22ccff'}).setScrollFactor(0));
    killInfoPtr.push(this.add.text(killInfo_X, killInfo_Y + 80, '', {fontFamily:'"Roboto Condensed"', fill: '#22ccff'}).setScrollFactor(0));

    //setInterval(popInfo(), 2000);
    timedEvent = this.time.addEvent({ delay: 4000, callback: popInfo, callbackScope: this, loop: true });
}
function healthToText(health){
    var percentage = health / 10;
    var ii;
    var textHealth = '';
    for( ii = 1 ; ii <= percentage ; ii++){
        textHealth += '█';
    }
    for( jj = 0 ; jj <= 10 - ii ; jj++){
        textHealth += '░';
    }
    return textHealth;
}

function addPlayer(self, playerInfo) {
    self.ninja = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ninja');
    self.ninja.setCollideWorldBounds(true);
    self.ninja.setVelocity(0, 0);
    self.cameras.main.startFollow(self.ninja, true, 0.05, 0.05, 0.05, 0.05);
    self.ninja.healthText = self.add.text(playerInfo.x - 12, playerInfo.y - 20, healthToText(playerInfo.health), {fontFamily:'Arial', fontSize: '3px' ,fill: '#00ff00'});
    self.ninja.nameText = self.add.text(playerInfo.x - 12, playerInfo.y  - 35, uNametext, {fontFamily:'Arial',fontSize: '15px',fill: '#2222bb'});
    self.physics.add.collider(self.ninja, wx, pb);
    self.physics.add.collider(self.ninja, ss, shuri_destroy);
    self.physics.add.overlap(self.ninja, stars, function(player, stars){
        gold+=10;
        stars_destroy(player, stars)
    });
    self.physics.add.overlap(self.ninja, waterLayer, slowdown);
    self.ninja.setSize(15,10).setOffset(8,20);
}

function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ninja');
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayer.healthText = self.add.text(playerInfo.x - 12 , playerInfo.y - 20, healthToText(playerInfo.health), {fontFamily:'Arial',fontSize: '3px', fill: '#ff0000'});
    otherPlayer.nameText = self.add.text(playerInfo.x - 12, playerInfo.y  - 35, playerInfo.s_username, {fontFamily:'Arial',fontSize: '15px',fill: '#2222bb'});
    self.otherPlayers.add(otherPlayer);
}

function update(){
    if(this.ninja){
        this.ninja.healthText.x = this.ninja.x - 12;
        this.ninja.healthText.y = this.ninja.y - 20;
        this.ninja.nameText.x = this.ninja.x - 12;
        this.ninja.nameText.y = this.ninja.y - 35;
        // keyboard
        if(w.isDown){
            if(this.ninja.anims.getCurrentKey()!='ninja_up') this.ninja.play('ninja_up');
            else if(!this.ninja.anims.isPlaying) this.ninja.play('ninja_up');
            if(a.isDown || d.isDown) this.ninja.setVelocityY(-vel/1.4);
            else this.ninja.setVelocityY(-vel);
            this.ninja.f=1;
        }
        else if(s.isDown){
            if(this.ninja.anims.getCurrentKey()!='ninja_down') this.ninja.play('ninja_down');
            else if(!this.ninja.anims.isPlaying) this.ninja.play('ninja_down');
            if(a.isDown || d.isDown) this.ninja.setVelocityY(vel/1.4);
            else this.ninja.setVelocityY(vel);
            this.ninja.f=2;
        }
        else{
            if(this.ninja.anims.getCurrentKey()=='ninja_up') this.ninja.play('ninja_up');
            if(this.ninja.anims.getCurrentKey()=='ninja_down') this.ninja.play('ninja_down');
            this.ninja.setVelocityY(0);
        }

        if(a.isDown){
            if(this.ninja.anims.getCurrentKey()!='ninja_left') this.ninja.play('ninja_left');
            else if(!this.ninja.anims.isPlaying) this.ninja.play('ninja_left');
            if(w.isDown || s.isDown) this.ninja.setVelocityX(-vel/1.4);
            else this.ninja.setVelocityX(-vel);
            this.ninja.f=3;
        }
        else if(d.isDown){
            this.ninja.anims.resume();
            if(this.ninja.anims.getCurrentKey()!='ninja_right') this.ninja.play('ninja_right');
            else if(!this.ninja.anims.isPlaying) this.ninja.play('ninja_right');
            if(w.isDown || s.isDown) this.ninja.setVelocityX(vel/1.4);
            else this.ninja.setVelocityX(vel);
            this.ninja.f=4;
        }
        else{
            if(this.ninja.anims.getCurrentKey()=='ninja_left') this.ninja.play('ninja_left');
            if(this.ninja.anims.getCurrentKey()=='ninja_right') this.ninja.play('ninja_right');
            this.ninja.setVelocityX(0);
        }

        reduced = false;
        vel = 200;

        // mouse
        pointer = this.input.activePointer; // refresh coordinate
        if(this.ninja.x<400) mousex=pointer.x-this.ninja.x; // distance between mouse & this.ninja
        else if(this.ninja.x>(mapx-400)) mousex=pointer.x-(this.ninja.x-(mapx-800));
        else mousex=pointer.x-400;
        if(this.ninja.y<300) mousey=pointer.y-this.ninja.y; // distance between mouse & this.ninja
        else if(this.ninja.y>(mapy-300)) mousey=pointer.y-(this.ninja.y-(mapy-600));
        else  mousey=pointer.y-300;
        angle = Math.atan(mousey/mousex); // angle between mouse & this.ninja
        if(mousex<0) angle+=Math.PI;

        // dash
        if(space.isDown && dash>0 && game_starts==true && game_over==false){
            if(this.time.now>dashtime){
                var tempx = this.ninja.x;
                var tempy = this.ninja.y;
                var tempr = angle;
                this.ninja.x+=Math.cos(angle)*200;
                this.ninja.y+=Math.sin(angle)*200;

                flash.play();
                var smoke=dd.create(tempx, tempy, 'ninja');
                smoke.play('ninja_smoke');
                smoke.on('animationcomplete', ()=>{smoke.destroy();});
                var dashX = Math.cos(tempr)*900;
                var dashY = Math.sin(tempr)*900;
                smoke.setVelocityX(dashX);
                smoke.setVelocityY(dashY);
                this.socket.emit('smoke', { x:tempx, y:tempy, velx:dashX, vely: dashY, r:tempr}); // dash animation location info

                dashtime=this.time.now+200;
                dash--;
                if(dash <= 0 ){
                    ui_dash_disable.setAlpha(1,1,1,1);
                }
                dashreg=this.time.now+1000; // only 2 dashes
                this.ninja.dash=1;
            }
        }
        if(this.time.now>dashreg){ // dash regen
            if(dash<2){
                dashreg=this.time.now+1000; //orignially 10000
                dash++;
                if(dash > 0){
                    ui_dash_disable.setAlpha(0,0,0,0);
                }
            }
            else{
                dashreg=this.time.now;
            }
        }

        var x = this.ninja.x;
        var y = this.ninja.y;
        var f = this.ninja.f;
        var dashed = this.ninja.dashed;

        if (this.ninja.oldPosition && (x !== this.ninja.oldPosition.x || y !== this.ninja.oldPosition.y)) {
            this.socket.emit('playerMovement', { x:this.ninja.x, y:this.ninja.y, f:this.ninja.f, dashed:this.ninja.dashed}); // send player info to server
            this.ninja.dashed=0;
        }

        this.ninja.oldPosition = {
          x: this.ninja.x,
          y: this.ninja.y,
          rotation: this.ninja.rotation
        };

    }

    // items
    if(one.isDown){
        options=1;
        ui_selection.clear();
        ui_selection.fillRect(ui_x - 34,ui_y -34,68,68);
    }
    if(two.isDown){
        options=2;
        ui_selection.clear();
        ui_selection.fillRect(ui_x - 34 + 70,ui_y -34,68,68);
    }
    // if(three.isDown) options=3;
    // if(four.isDown) options=4;
    if(upgrade.isDown && upgrade_time<this.time.now){
        if(one.isDown){
            if(gold>=200){
                gold-=200;
                //console.log('upgrade_kata');
                kata_d+=10;
                upgrade_time=this.time.now+1000;
            }
        };
        if(two.isDown){
            if(gold>=200){
                gold-=200;
                //console.log('upgrade_shuri');
                shuri_d+=5;
                shuri_s+=25;
                upgrade_time=this.time.now+1000;
            }
        };
        // if(three.isDown) options=3;
        // if(four.isDown) options=4;
    }

    // use items
    if(pointer.leftButtonDown() && game_starts==true && game_over==false){ // left click
        if(options==1 && this.time.now>katatime && kata>0){
            katana.play(); // sound
            var slashx = this.ninja.x+Math.cos(angle)*0;
            var slashy = this.ninja.y+Math.sin(angle)*0;
            var slash = kk.create(slashx, slashy, 'slash');
            slash.rotation = angle; // slash angle
            slash.play('kata_anim');
            slash.on('animationcomplete', ()=>{slash.destroy();});
            this.socket.emit('playerSlash', {x:slashx, y:slashy, r:angle}); // slash location info
            katatime = this.time.now+300;
            kata--;
            if(kata <= 0 ){
                ui_katana_disable.setAlpha(1,1,1,1);
            }
            katareg = this.time.now+500;
        }

        if(options==2 && this.time.now>shuritime && shuri>0){
            var initX = this.ninja.x+Math.cos(angle)*32;
            var initY = this.ninja.y+Math.sin(angle)*32;
            shuriThrow.play(); // sound
            //shuris.add.group();
            var toss = ss.create(initX, initY, 'shuri');
            toss.play('shuri_anim');
            var velX = Math.cos(angle)*shuri_s;
            var velY = Math.sin(angle)*shuri_s;
            toss.setVelocityX(velX);
            toss.setVelocityY(velY);
            this.socket.emit('shuriken', { initX:initX, initY:initY, velX:velX, velY:velY}); // slash location info
            // if hit -10 hp
            shuritime=this.time.now+200;
            shuri--;
            if(shuri <= 0 ){
                ui_shuriken_disable.setAlpha(1,1,1,1);
            }
            shurireg=this.time.now+1000;
        }
    }

    //regen
    if(this.time.now>katareg){ // kata regen
        if(kata<5){
            katareg=this.time.now+500;
            kata++;
            if(kata > 0 ){
                ui_katana_disable.setAlpha(0,0,0,0);
            }
        }
        else{
            katareg=this.time.now;
        }
    }
    if(this.time.now>shurireg){ // shuri regen
        if(shuri<10){
            shurireg=this.time.now+1000;
            shuri++;
            if(shuri > 0 ){
                ui_shuriken_disable.setAlpha(0,0,0,0);
            }
        }
        else{
            shurireg=this.time.now;
        }
    }

    ui_katana_text.setText(kata);
    ui_shuriken_text.setText(shuri);
    ui_dash_text.setText(dash);

    // mute audio
    if(m.isDown && mute_music==0) mute_music=1;
    else if(m.isDown && mute_music==1) mute_music=0;
    if(mute_music==1) music.setMute(true);
    else music.setMute(false);

    if(b.isDown && mute_bg==0) mute_bg=1;
    else if(b.isDown && mute_bg==1) mute_bg=0;
    if(mute_bg==1) bg.setMute(true);
    else bg.setMute(false);

    if(n.isDown && mute_sound==0) mute_sound=1;
    else if(n.isDown && mute_sound==1) mute_sound=0;
    if(mute_sound==1){
        katana.setMute(true);
        flash.setMute(true);
        hit.setMute(true);
        shuriThrow.setMute(true);
    }
    else{
        katana.setMute(false);
        flash.setMute(false);
        hit.setMute(false);
        shuriThrow.setMute(false);
    }

    otext='';
    if(game_starts==false){
        otext='Weapons Disabled'; // melee
    }
    else{
        if(options==1) otext='Blade: ∞'; // melee
        if(options==2) otext='Shuriken: '+shuri+'/10'; // range
    }

    // text
    // text1.setText([
    //     'Dash: '+dash+'/2',
    //     otext, // options
    //     'Upgrade [SHIFT+1/2]',
    // ]);
    // text2.setText([
    //     'Health: '+health,
    //     'Kills: '+kills,
    //     'Gold: '+gold,
    //     'Deaths: '+deaths
    // ]);

    ui_kill_text.setText(kills);
    ui_death_text.setText(deaths);
    ui_coin_text.setText(gold);
    ui_health_l.clear();
    ui_health_l.fillStyle(0x00ff00, 1);
    ui_health_l.fillRect(healthX, healthY, healthWidth * health * 0.01, healthHeight);
    ui_heal_text.setText(health);
    if(game_starts==true && game_over==false){
        text3.setText([
            'Timer: '+Math.floor(((game_time-this.time.now)/1000)/60)+':'+Math.floor(((game_time-this.time.now)/1000)%60)
        ]);
    }
    if(game_time<=this.time.now && game_over==false){
        this.socket.emit('end', { id:uNametext, kills:kills, deaths:deaths});    
    }
    if(game_over==true){
            end.setText([
                'GAME OVER'
            ]);   
            // if(temp==0) player1.setText([gameInfo[0]]);
            // if(temp==1) player2.setText([gameInfo[1]]);
            // if(temp==2) player3.setText([gameInfo[2]]);
            // if(temp==3) player4.setText([gameInfo[3]]);
    }

    if(spawn_time<this.time.now){
        var stars_x = Math.floor((Math.random()*mapx));
        var stars_y = Math.floor((Math.random()*mapy));

        var star=stars.create(stars_x, stars_y, 'star');
        star.play('star_anim');
        star.on('animationcomplete', ()=>{star.destroy();});

        spawn_time=this.time.now+5000;
    }
}

// create maze
function maze(){
    var water=[
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
        [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,1,0,1,1,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,0,1,1,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    var building = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,0,1,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0],
        [0,0,1,0,1,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];

    var tiles = [
        [85,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,86,62,85,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,74,86],
        [63,4,1,1,4,4,4,3,1,3,1,3,2,3,5,2,1,1,1,1,1,1,1,1,1,61,62,63,1,1,1,1,1,3,1,4,2,1,4,2,21,4,4,1,3,2,5,4,5,61],
        [63,1,1,1,3,3,4,2,5,4,4,4,2,15,37,1,4,25,4,5,5,3,1,5,5,61,62,63,2,3,2,5,4,1,5,3,5,1,3,4,33,3,39,1,1,3,4,1,2,61],
        [63,4,5,5,4,5,1,1,25,39,3,26,3,1,3221225553,3221225551,4,4,5,1,4,5,5,18,7,110,110,110,7,7,7,7,7,7,7,8,1,3,3,4,33,5,3,2,91,92,1,2,39,61],
        [63,4,1,5,3,91,92,1,5,1,2,4,1,5,67,69,37,4,6,7,19,7,7,44,5,121,122,123,2,4,25,2,3,5,2,3,2,5,5,4,33,4,2,3,103,104,1,3,4,61],
        [63,5,3221225553,80,3221225551,103,104,1,3,25,26,3,4,1,67,69,2,3,4,4,29,3,5,1,4,61,62,63,4,4,3221225553,3221225551,26,1,3,1,5,39,5,2,33,1,1,4,4,4,4,1,3,61],
        [63,2,79,80,81,5,4,4,5,1,26,26,5,5,67,69,3,4,1,3,29,1,5,4,3,61,62,63,1,5,67,69,3,4,1,154,155,156,4,5,33,1,4,2,1,5,3,5,1,61],
        [63,5,3,3,1,2,3,39,39,1,3,3,26,26,79,81,5,5,4,3,42,7,7,20,5,61,62,63,1,1,67,69,5,4,1,166,167,168,1,2,33,3,1,3,3221225553,80,3221225551,4,1,61],
        [63,1,5,2,39,39,39,39,3,5,5,37,38,26,1,2,5,3221225553,80,3221225551,3,1,5,29,3,61,62,63,3,1,67,69,1,1,39,178,179,180,1,3,33,25,2,3,79,80,81,2,5,61],
        [63,4,5,5,37,13,25,5,5,4,5,4,4,4,5,27,1,79,80,81,5,1,3,21,5,61,62,63,5,2,79,81,3,3,1,3,4,39,5,1,33,2,5,2,2,2,3,2,2,61],
        [97,50,50,50,50,50,50,50,50,50,50,50,51,37,37,38,37,37,37,37,37,1,5,33,5,61,62,63,4,2,1,4,5,2,1,3,2,5,5,5,33,1,2,5,1,3,2,4,5,61],
        [85,74,74,74,74,74,74,74,74,74,74,74,75,37,3221225553,80,80,80,80,80,80,80,3221225551,34,11,110,110,110,11,11,11,11,11,11,11,11,11,11,11,11,35,12,7,7,7,7,7,8,1,61],
        [63,58,59,59,59,59,59,59,59,59,60,4,4,1,67,2,2,2,2,37,3,1,69,33,1,121,122,123,5,2,3,2,5,3221225553,56,3221225551,4,2,3,4,33,5,2,1,5,3,2,5,3,61],
        [63,70,71,71,71,71,71,71,71,71,72,4,3,4,67,2,2,2,1,13,13,25,69,33,2,61,62,97,51,3,2,4,5,79,80,81,1,37,1,37,33,2,3221225553,80,3221225551,1,1,5,5,61],
        [63,82,83,83,83,83,83,83,83,83,84,26,3,3,67,1,1,1,1,3,4,25,69,33,3,73,86,62,63,3,4,3,4,3,5,1,5,2,3,2,33,1,79,80,81,4,4,1,5,61],
        [63,4,4,4,2,3,3,4,2,3,26,5,5,5,67,2,2,2,2,185,1,2,69,33,4,5,61,62,63,5,3,91,92,2,2,5,3,5,5,25,33,1,1,4,39,4,91,92,5,61],
        [63,1,3,3221225553,80,80,80,80,80,80,80,3221225551,3,3,67,5,5,4,17,2,3,2,69,33,3,1,61,62,63,2,5,103,104,4,1,22,11,11,11,11,48,4,4,2,5,1,103,104,4,61],
        [63,2,3,67,2,1,1,2,2,2,2,69,4,1,79,80,80,80,29,80,80,80,81,45,2,4,61,62,63,1,2,4,4,3,3,33,58,59,60,4,3,4,4,2,3,3,5,4,4,61],
        [63,1,3,67,2,1,1,2,1,2,2,69,2,6,7,7,7,7,43,7,7,7,7,44,1,2,61,62,63,5,5,139,140,141,3,33,70,71,72,1,1,4,39,49,50,51,5,3,4,61],
        [63,5,2,67,1,1,1,1,1,4,2,69,3,3,3,5,4,13,5,25,3,3,5,4,2,4,61,62,63,1,5,3,17,4,4,33,82,83,84,27,4,39,39,61,62,63,3,3,2,61],
        [63,1,1,67,2,1,2,2,6,10,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,110,110,110,7,7,7,31,7,10,36,5,2,1,3,2,2,4,73,74,75,3,13,5,61],
        [63,2,2,67,5,5,4,1,2,3,2,69,5,5,4,3,2,2,3,1,2,2,1,4,3,4,121,122,123,1,4,3,29,13,37,33,1,5,2,1,5,1,5,3,4,5,2,4,4,61],
        [63,1,3,79,80,80,80,80,80,80,80,81,4,3,1,1,4,2,5,2,2,2,4,5,3,5,61,62,63,3,4,3,29,1,37,34,11,11,12,7,7,7,7,7,7,7,8,4,2,61],
        [63,1,4,1,2,5,5,1,5,1,5,4,166,167,4,168,4,178,37,179,180,4,166,167,168,5,61,62,63,1,1,37,29,4,37,45,3221225553,80,80,80,80,80,80,80,3221225551,4,3,2,5,61],
        [63,4,4,26,2,5,2,5,5,5,3,4,166,167,167,168,4,178,1,179,180,2,166,167,168,1,61,62,63,1,1,13,29,5,2,29,67,2,27,38,13,38,13,3,69,2,2,14,2,61],
        [63,3,4,4,4,3,3,3,1,5,3,4,91,92,166,168,5,178,179,179,180,5,166,167,168,1,61,62,63,2,1,1,29,3,3,29,67,3,37,13,3,14,4,5,69,2,108,39,2,61],
        [63,2,2,3,49,51,26,1,4,5,4,4,103,104,166,168,3,178,179,179,180,2,166,167,168,49,98,62,63,1,13,25,29,13,13,29,67,37,14,27,25,37,4,13,69,2,2,4,27,61],
        [63,4,1,2,61,63,4,4,1,58,59,60,166,167,167,168,26,2,3,5,1,4,1,1,3,61,62,85,75,3,25,5,29,25,13,29,67,2,2,2,2,2,2,2,69,2,4,2,13,61],
        [63,2,4,2,61,63,4,4,1,70,71,106,60,166,167,168,2,178,179,179,180,13,1,1,6,110,110,110,7,7,7,19,44,5,4,29,67,5,5,4,17,2,3,2,69,5,108,5,4,61],
        [63,1,4,3,61,63,4,2,1,70,71,71,72,166,167,168,26,178,179,179,180,5,3,1,3,121,122,123,58,59,60,29,3,1,13,29,79,80,80,80,29,80,80,80,81,5,1,26,4,61],
        [63,5,4,4,61,63,3,2,2,70,71,71,72,166,167,2,26,178,179,179,180,1,2,1,49,98,62,63,70,71,72,42,7,7,7,31,7,7,7,7,43,7,7,20,1,4,4,25,3,61],
        [63,3,2,3,61,63,2,1,2,82,95,71,72,39,2,3221225553,3221225551,4,49,50,51,2,1,1,61,62,85,75,82,83,84,2,5,3,3,29,4,5,2,2,2,1,4,29,1,4,25,37,4,61],
        [63,3,2,1,61,63,5,5,5,4,82,83,84,4,2,67,69,4,61,62,63,2,1,1,61,62,63,1,2,4,39,4,2,3,1,29,3,13,5,25,4,1,4,29,4,25,25,37,1,61],
        [63,5,5,2,61,63,4,2,5,3221225553,80,3221225551,3,5,2,67,69,2,73,74,75,3,3,49,98,62,63,1,2,3,1,5,3,3,3,29,2,1,5,4,4,3,5,29,1,5,1,4,3,61],
        [63,1,2,2,73,75,1,5,1,79,80,81,2,4,5,67,69,4,2,2,1,1,1,61,62,85,75,3221225553,80,80,80,80,80,3221225551,5,29,1,1,1,1,3,1,5,29,1,37,2,1,5,61],
        [63,2,5,4,4,5,3,2,3221225553,80,3221225551,3,3,3,2,79,81,3,1,3,1,4,10,110,110,110,7,7,7,7,7,7,7,7,7,32,4,4,2,39,5,4,1,29,4,2,1,4,3,61],
        [63,1,5,1,1,14,5,2,79,80,81,4,3221225553,80,80,80,80,80,80,80,3221225551,2,2,121,122,123,67,154,155,155,155,155,156,69,1,41,1,4,4,4,5,3,3,41,1,5,2,38,4,61],
        [63,2,4,3,91,92,15,3,4,1,5,3,67,2,2,2,2,2,2,2,69,2,4,61,62,63,67,154,155,155,155,155,156,69,5,2,5,5,3,5,3,1,4,4,4,3221225553,80,3221225551,5,61],
        [63,2,5,3,103,104,13,15,3,2,1,22,11,11,11,12,2,2,2,2,69,2,3,61,62,63,67,154,155,155,155,155,156,69,4,1,14,37,3,13,13,13,5,3,3,79,80,81,3,61],
        [63,25,25,5,4,5,2,1,37,4,4,33,67,2,5,1,1,1,4,2,69,1,5,61,62,63,67,154,155,155,155,155,156,69,5,1,4,4,1,5,2,15,13,3,5,1,2,5,5,61],
        [63,22,11,11,11,23,11,11,24,38,5,33,67,1,25,2,2,2,2,2,69,3,2,61,62,63,67,154,155,155,155,155,156,69,49,50,50,50,51,3,1,49,50,50,50,50,50,50,50,98],
        [63,33,25,13,25,33,4,1,33,37,3,33,67,37,25,4,1,2,3,2,69,2,49,98,62,63,67,154,155,155,155,155,156,69,73,74,74,74,75,3,15,73,74,74,74,74,74,74,74,86],
        [63,33,37,25,1,33,5,5,33,39,3,33,79,80,80,80,80,80,80,80,81,4,61,62,85,75,79,80,80,80,80,80,80,81,4,3,1,2,4,1,3,3,3,2,2,4,5,4,2,61],
        [63,33,39,1,1,33,3,4,34,11,11,47,11,11,11,11,11,11,11,11,11,11,110,110,110,12,1,1,2,2,2,5,37,5,2,4,4,5,3,5,2,1,3,3221225553,3221225551,2,5,2,5,61],
        [63,33,39,13,5,33,13,3,33,4,4,5,13,13,2,4,2,3221225553,3221225551,5,1,5,121,122,123,5,1,3,1,4,3,39,1,5,2,1,2,108,1,3,13,38,108,67,69,3,26,38,1,61],
        [63,33,39,1,37,33,1,3,33,25,5,4,1,5,4,1,4,67,69,4,3,4,61,62,63,1,1,5,1,25,5,3,25,4,5,15,27,4,3,3,15,4,1,67,69,13,1,4,5,61],
        [63,33,39,25,13,33,13,13,34,11,11,11,11,11,11,12,2,67,69,1,5,4,61,62,63,1,1,4,5,25,5,1,37,5,3,14,4,4,91,92,3,3,5,67,69,38,4,2,2,61],
        [63,46,11,11,11,47,11,11,48,4,5,25,3,37,2,39,3,67,69,1,2,2,61,62,63,3,1,4,108,26,2,27,37,13,4,2,2,3,103,104,5,5,3,79,81,2,5,5,3,61],
        [63,25,1,4,5,2,3,2,1,4,1,2,1,5,5,1,1,79,81,1,5,5,61,62,63,1,1,4,5,3,4,14,2,4,5,2,108,3,3,2,1,2,4,1,4,3,4,26,2,61],
        [97,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,98,62,97,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,98]
    ];
    for (var i=0; i<50; i++){
        for (var j=0; j<50; j++){
            if(water[i][j]==1) waterLayer.create((j*48)+24,(i*48)+24, 'twall');
            if(tiles[i][j] == 67){
                wx.create((j*48)+24,(i*48)+24, 'twall').setSize(30,48).setOffset(18,0);
            }
            if(tiles[i][j] == 80){
                wx.create((j*48)+24,(i*48)+24, 'twall').setSize(48,30);
            }
            if(tiles[i][j] == 69){
                wx.create((j*48)+24,(i*48)+24, 'twall').setSize(30,48).setOffset(0,0);
            }

            if(building[i][j] ==  1){
                wx.create((j*48)+24,(i*48)+24, 'twall');
            }

            if(tiles[i][j] == 3221225553){
                wx.create((j*48)+24,(i*48)+24, 'twall').setSize(30,39).setOffset(18,9);
            }else if(tiles[i][j] == 3221225551){
                wx.create((j*48)+24,(i*48)+24, 'twall').setSize(30,39).setOffset(0,9);
            }else if(tiles[i][j] == 79){
                wx.create((j*48)+24,(i*48)+24, 'twall').setSize(30,39).setOffset(18,0);
            }else if(tiles[i][j] == 81){
                wx.create((j*48)+24,(i*48)+24, 'twall').setSize(30,39).setOffset(0,0);
            }
        }
    }
}

//checks collision
function pb(player, wall){
    if(wall.y>player.y) player.y-=0.1;
    else player.y+=0.1;
    if(wall.x>player.x) player.x-=0.1;
    else player.x+=0.1;
}

var reduced = false;
function slowdown(player, wall){
    if(!reduced){
        vel = vel/3;
        reduced = true;
    }
}

var kata_d = 50;
var shuri_s = 300;
var shuri_d = 10;

// collisions
function katahit(self, otherPlayer, kk){
    kk.destroy();
    if(otherPlayer.health<=kata_d){
        kills+=1;
        gold+=100;
        //console.log(self.socket.id);
        self.socket.emit('shuri_kill', {id:self.socket.id});
    }
    self.socket.emit('kata_hit', {id:otherPlayer.playerId, kata_d:kata_d});
}
function shurihit(self, otherPlayer, ss){
    ss.destroy();
    if(otherPlayer.health<=shuri_d){
        kills+=1;
        gold+=100;
        //console.log(self.socket.id);
        self.socket.emit('shuri_kill', {id:self.socket.id});
    }
    self.socket.emit('shuri_hit', {id:otherPlayer.playerId, shuri_d:shuri_d});
}

function dashhit(self, otherPlayer, dd){
    dd.destroy();
    if(otherPlayer.health<=25){
        kills+=1;
        gold+=100;
        //console.log(self.socket.id);
        self.socket.emit('shuri_kill', {id:self.socket.id});
    }
    self.socket.emit('dash_hit', {id:otherPlayer.playerId});
}

function shuri_destroy(wx, ss){
    ss.destroy();
}

function stars_destroy(ninja, stars){
    stars.destroy();
}
