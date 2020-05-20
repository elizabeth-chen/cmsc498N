// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 30000, listen);


// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));


var users = [];
var marks = [];
var mostItems = 0;

var item = {
  x: parseInt(Math.random(100, 200)),
  y: parseInt(Math.random(100, 200)),
  type: parseInt(Math.random(0, 6))
}

function User(id, x, y, dir, items, offset) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.dir = dir;
  this.items = items;
  this.isWinning = false;
  this.offset = offset;
}

function Mark(x, y, type, angle) {
  this.x = x;
  this.y = y;
  this.type = type;
  this.angle = angle;
}

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 33);
setInterval(getWinnerCount, 33);


//send out update to all the current clients of each user's location and marks
function heartbeat() {
  io.sockets.emit('heartbeatUsers', users);
  io.sockets.emit('heartbeatMarks', marks);
  io.sockets.emit('heartbeatItem', item);
}

function getWinnerCount() {
  io.sockets.emit('getWinnerCount', mostItems);
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {

    console.log("We have a new client: " + socket.id);

    //when user first enters the game, add the user to list of all users
    socket.on('start', function(data) {
      console.log(socket.id + ' ' + data.x + ' ' + data.y);
      var user = new User(socket.id, data.x, data.y, data.dir, data.items, data.offset);
      users.push(user);
    });

    //update user's location
    socket.on('update', function(data) {
      var user = users[0];

      for (var i = 1; i < users.length; i++) {
        //found user to update
        if (socket.id == users[i].id) {
          user = users[i];
        }
      }

      //check to make sure user is not null (getting error when game first loads if we don't check for this, probably something to look into later on)
      if(user && data) {
        if(data.items >= mostItems && data.items != 0) {
          user.isWinning = true;
          mostItems = data.items;
        } else {
          user.isWinning = false;
        }
          user.x = data.x;
          user.y = data.y;
          user.dir = data.dir;
          user.items = data.items;
          user.offset = data.offset;
        }
    });

   //delete all users from game
   socket.on('delete users', function(){
     users = [];
     mostItems = 0;
   });

    //add mark
    socket.on('new mark', function(data) {
      var mark = new Mark(data.x, data.y, data.type, data.angle);
      marks.push(mark)
    });

    //new item
    socket.on('new item', function(data) {
      item = {
        x: data.x,
        y:data.y,
        type: data.type
      }
    });

    socket.on('disconnect', function() {
      var removed = users.filter(function(value, index, arr){ return value.id != socket.id;})
      var toRemove = users.filter(function(value, index, arr){ return value.id == socket.id;})
      users = removed;
      //if disconnecting user had most items, calculate new winning cart
      if(toRemove[0] != null && toRemove[0].isWinning) {
        calculateNewWinner();
      }
      console.log("Client has disconnected");
    });
  }
);

function calculateNewWinner() {
  var currentMost = 0;
  for (var i = 0; i < users.length; i++) {
    if(users[i].items > currentMost) {
      currentMost = users[i].items;
    }
  }
  mostItems = currentMost;
}
