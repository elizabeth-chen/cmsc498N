// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

// Keep track of our socket connection
var socket;
var users = [];
var marks = [], marks_items = [];
var supplies = [];
var inCollision = false;
var collisionTimer = 0;
let corona;

function preload(){
  cartR = loadImage('cartRight.png');
  cartL = loadImage('cartLeft.png');
  toilet = loadImage('toilet.png');
  soap = loadImage('soap.png');
  corona = loadSound('corona_virus.mp3');
}

function setup() {

  /*new code*/
  createCanvas(windowWidth, windowHeight);
	vec = createVector(0,0);
  int(numItems = 0);
	int(s = 0, m = 0); //seconds and minutes
  int(itemX = random(0, windowWidth-100), itemY = random(0, windowHeight-75));
  

	//add item collection
	supplies.push(soap);
	supplies.push(toilet);
	rand = int(random(0,supplies.length));

	float(vx = 0,vy = 0);
	float(dx = 0,dy = 0);
	float(drag = 0.99);
	float(charge = 0.25);
	float(x = windowWidth/2);
  float(y = windowHeight/2);
  float(threshold = 0, d=0);
  ra = int(random(0,255))

  /*old code*/
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:3000');
  // We make a named event called 'mouse' and write an
  // anonymous callback function


  //initial cart
  var data = {
    x: mouseX,
    y: mouseY,
    dir: "left"
  };

  socket.emit('start', data);

  socket.on('heartbeatUsers', function(data) {
    users = data;
  });

  socket.on('heartbeatMarks', function(data) {
    marks = data;
  });

}

function draw() {
  background(255);
	fill(0);
	dx = mouseX-x;
  dy = mouseY-y;
	vec.set(dx,dy);
	vec.normalize();
	d = map(dist(x,y,mouseX,mouseY),0,width,charge,0);
	vx+=(vec.x*d);
  vy+=(vec.y*d);
	vx*=drag;
	vy*=drag;
	x+=vx;
	y+=vy;

  //draw marks
  for (var i = marks.length - 1; i >= 0; i--) {
    fill(0,ra,0);
    ellipse(marks[i].x, marks[i].y, 100, 100);
    
  }


  //draw all of the carts in the game
  for (var i = users.length - 1; i >= 0; i--) {
    var id = users[i].id;
    drawCart(users[i].x,users[i].y, users[i].dir);

    if (id != socket.id) {
      if (!inCollision && collision(x,y,users[i].x,users[i].y)){
        var mark = {
          x: x + 50,
          y: y + 50,
        };
        socket.emit('new mark', mark);
        inCollision = true;
        collisionTimer = 0;
        //add color hehe
        ra = int(random(100,255));
        corona.play();
      }
    }

  }

  //display current item.
  image(supplies[rand],itemX,itemY, 100,80);
	//location of current item to collect
	var d2 = dist(x,y,itemX,itemY);
  if ( d2 < 40) {
		itemX = random(0, windowWidth-100);
		itemY = random(0, windowHeight-75);
    numItems++;
    rand = int(random(0,supplies.length));
  }

  //decide which direction cart should be facing
  var dir;
  if( mouseX > x)
    dir = "right";
  else
    dir = "left";

  var data = {
    x: x,
    y: y,
    dir: dir
  };

  //send this user's data to server
  socket.emit('update', data);
  collisionTimer++;
  if(collisionTimer > 20) {
    inCollision = false;
  }

  //display the time and number of items count. 
  trackTime();
	textSize(20);
	fill(0);
	textFont('Helvatica');
	text(("Items: "+ numItems), (windowWidth-160), (30));
  text(("Time: "+ m + ":" + s ), (windowWidth-160), (60));
}

function drawCart(x, y, dir){
  if(dir == "right")
    image(cartR,x,y, 100, 100);
  else
    image(cartL,x,y, 100, 100);
}

//comment
function collision(x1,y1,x2,y2) {
  if(x1 >= x2-50 && x1 <= x2+50 && y1 >= y2-50 && y1 <= y2+50) {
    return true;
  } else {
    return false;
  }

}

//Keep track of the time as long as the player has lives.
function trackTime(){
  int(lives = 1);   //sample lives
  
	//If player has lives, count the minutes and seconds.
	if (lives!= 0) {
     s = second();
     if(s >= 59){
       s = 0;
		 	 m = (minute() - minute() + 1);
     }
  }
}
