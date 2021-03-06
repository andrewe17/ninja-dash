const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5000
const app = express();
const { Pool } = require('pg');

var http = require('http').createServer(app);
var io = require('socket.io')(http);
//var cors = require('cors');
var players = {};

// var pool = new Pool({
//   user: 'postgres',
//   password: 'root',
//   host: 'localhost',
//   database: 'postgres'
// });

var pool = new Pool({
  connectionString : process.env.DATABASE_URL//connecting the database
})

// const { Pool } = require('pg');
//    var pool = new Pool({
//    user: 'jchan01010',
//    password: 'jchanpass123',
//    host: 'localhost',
//    database: 'postgres'
//  });

app.use(express.static(path.join(__dirname, 'public')));//joining the files public and current folder
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//app.use('/', cors());

app.set('views', path.join(__dirname, 'views'));// joining the files views and current folder
app.set('view engine', 'ejs');//using ejs

// weather api
var http2 = require('http');
var weather_json="";
var weather_data;
var weather="Clear";
var api_key = '89712763149745a41a5e5152afa563b7';
var options = {
  host: 'api.openweathermap.org',
  path: '/data/2.5/weather?q=Vancouver&APPID='+api_key
}
http2.request(options, function(weather_response){
  weather_response.on("data",function(json){
    weather_json+=json;
  });
  weather_response.on("end", function(){
    //console.log(weather_json);
    weather_data = JSON.parse(weather_json);
  })
}).end();

//app.get('/', (req, res) => res.render('pages/index'))
app.get('/', function(req, res){
  res.sendFile(__dirname + 'pages/login');
});

app.get('/players', function(req, res){
  res.send(players);
});

var player_count=0;
var initialized=false;
io.sockets.on('connection', function(socket){
  // weather api
  weather= weather_data.weather[0].main;
  io.emit('weather', weather);

  // game starts
  player_count++;
  console.log(player_count);
  if(player_count<4 && initialized==false){
    io.sockets.emit('waiting', player_count);
  }
  if(player_count>=4){
    initialized=true;
    io.sockets.emit('game_start');
  }

  //console.log('A user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    x: Math.floor(Math.random()*2400),
    y: Math.floor(Math.random()*2400),
    playerId: socket.id,
    s_username: socket.username,
    f: 0,
    dashed:0,
    health:100,
    kills:0,
    deaths:0,
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('changeWeather', function(weather){
    socket.broadcast.emit('weather', weather);
  });

  // user connect (chat)
  socket.on('username', function(username){
    socket.username = username;
    players[socket.id].s_username = username;
    io.emit('is_online', '✧ ' + socket.username + ' has connected.');
  });

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function(){ //on reload or exit
    player_count--;
    if(player_count<4 && initialized==false){
      io.sockets.emit('waiting', player_count);
    }
    if(player_count<=0){
      initialized=false;
    }
    //console.log('A user disconnected');
    // remove this player from our players object
    socket.broadcast.emit('deletePlayer', socket.id);
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  socket.on('disconnect', function(username) {
      io.emit('is_online', '✧' + socket.username + ' left the chat.');
  })

  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].f = movementData.f;
    players[socket.id].dashed = movementData.dashed;
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  // Broadcast Katana
  socket.on('playerSlash', function (slashData) {
    socket.broadcast.emit('playerSlashed', slashData);
  });
  // Broadcast Shuriken
  socket.on('shuriken', function (shurikenData) {
    socket.broadcast.emit('shurikenToss', shurikenData);
  });
  // Broadcast Smoke
  socket.on('smoke', function (smokeData) {
    socket.broadcast.emit('smoke_ani', smokeData);
  });

  socket.on('shuri_kill', function (ninja) {
    players[ninja.id].kills+=1;
    socket.broadcast.emit('shurikenKill', players[ninja.id]);
    socket.emit('shurikenKill', players[ninja.id]);
  });

  //game over
  socket.on('end', function (endData) {
    socket.broadcast.emit('gameover', endData);
  });

  // Broadcast shuriken hit
  socket.on('shuri_hit', function (otherPlayer) {
    var h = players[otherPlayer.id].health;
    players[otherPlayer.id].health = h-otherPlayer.shuri_d;
    //console.log(player.id);
    if(players[otherPlayer.id].health<=0){
      socket.broadcast.emit('killInfo',socket.username, players[otherPlayer.id].s_username);
      socket.emit('killInfo', socket.username, players[otherPlayer.id].s_username);
      players[otherPlayer.id].deaths+=1;
      players[otherPlayer.id].x=Math.floor(Math.random()*2400);
      players[otherPlayer.id].y=Math.floor(Math.random()*2400);
      players[otherPlayer.id].health=100;
      socket.broadcast.emit('playerMoved', players[otherPlayer.id]);
      socket.emit('playerMoved', players[otherPlayer.id]);
    }
    socket.broadcast.emit('shurikenHit', players[otherPlayer.id]);
    socket.emit('shurikenHit', players[otherPlayer.id]);
  });
  socket.on('dash_hit', function (otherPlayer) {
    var h = players[otherPlayer.id].health;
    players[otherPlayer.id].health = h - 25;
    //console.log(player.id);
    if(players[otherPlayer.id].health<=0){
      socket.broadcast.emit('killInfo', socket.username, players[otherPlayer.id].s_username);
      socket.emit('killInfo', socket.username, players[otherPlayer.id].s_username);
      players[otherPlayer.id].deaths+=1;
      players[otherPlayer.id].x=Math.floor(Math.random()*2400);
      players[otherPlayer.id].y=Math.floor(Math.random()*2400);
      players[otherPlayer.id].health=100;
      socket.broadcast.emit('playerMoved', players[otherPlayer.id]);
      socket.emit('playerMoved', players[otherPlayer.id]);
    }
    socket.broadcast.emit('shurikenHit', players[otherPlayer.id]);
    socket.emit('shurikenHit', players[otherPlayer.id]);
  });

  socket.on('kata_hit', function (otherPlayer) {
    var h = players[otherPlayer.id].health;
    players[otherPlayer.id].health = h-otherPlayer.kata_d;
    if(players[otherPlayer.id].health<=0){
      socket.broadcast.emit('killInfo', socket.username, players[otherPlayer.id].s_username);
      socket.emit('killInfo', socket.username, players[otherPlayer.id].s_username);
      players[otherPlayer.id].deaths+=1;
      players[otherPlayer.id].x=Math.floor(Math.random()*2400);
      players[otherPlayer.id].y=Math.floor(Math.random()*2400);
      players[otherPlayer.id].health=100;
      socket.broadcast.emit('playerMoved', players[otherPlayer.id]);
      socket.emit('playerMoved', players[otherPlayer.id]);
    }
    socket.broadcast.emit('shurikenHit', players[otherPlayer.id]);
    socket.emit('shurikenHit', players[otherPlayer.id]);
  });

  //show chat messages
  socket.on('chat message', function(msg){
    //console.log('message: ' + msg);
    io.emit('chat message',socket.username + ': ' + msg);
  });

});

app.use(express.static(path.join(__dirname, 'node_modules')))

app.post('/signin', async (req, res) => {//this updates the form when the form from login is submited
  try {
    const que = 'SELECT username, password FROM login WHERE EXISTS (SELECT username, password FROM login WHERE login.username = $1 AND login.password = $2);'
    const value =[req.body.user,req.body.password]
    const client = await pool.connect()
    const result = await client.query(que,
    value);
    // res.send(result.rowCount);
    if (result.rowCount > 0){//I noticed that if the queue returns true the rowCount is larger than 0
      var user = {'username':req.body.user};
      res.render('pages/game',user);
      client.release();
    }
    else {
      var myres = {'results': 2};
      res.render('pages/login',myres);
    }
  } catch (err) {
      res.send("Error " + err);
  }
})

app.post('/signup', async (req, res) => {//this updates the form when the form from login is submited
  try {
    const que = 'SELECT username FROM login WHERE EXISTS (SELECT username FROM login WHERE login.username = $1 );'
    const value =[req.body.userup];
    const client = await pool.connect()
    const results = await client.query(que,
    value);
    var count = results.rowCount;
    // res.send(results.rowCount);
    if (results.rowCount > 0 || req.body.psw != req.body.psw_repeat){//I noticed that if the queue returns true the rowCount is larger than 0
      var myres = {'results': 1};
      res.render('pages/login',myres);
    }
    else if(results.rowCount == 0){
      const value =[Math.floor(Math.random() * (1000)),req.body.userup,req.body.psw]//randomly generated ID
      const inner_results = await client.query('insert into login (id,username,password) values ($1,$2,$3)',
      value);
      var myres = {'results': 0};
      res.render('pages/login',myres);
    }else{
      res.render('pages/error');
    }

    client.release();
  } catch (err) {
    res.send("Error " + err);
  }
})

app.post('/signup1', function(req, res){
    var results = {'results':0};
    res.render('pages/login',results);
});
app.post('/login', function(req, res){
    var results = {'results':-1};
    res.render('pages/login',results);
});

//app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
http.listen(PORT, () => console.log(`Listening on ${ PORT }`));

module.exports = {
  weather: weather,
  players: players,
}
