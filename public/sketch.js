// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

// Keep track of our socket connection
var socket;
var users = [];

function preload(){
  cartR = loadImage('cartRight.png');
  cartL = loadImage('cartLeft.png');
	toilet = loadImage('toilet.png');
}

function setup() {

  /*new code*/
  createCanvas(windowWidth, windowHeight);
	vec = createVector(0,0);
  int(numItems = 0);
	int(s = 0, m = 0); //seconds and minutes
	int(itemX = 200, itemY = 200);

	float(vx = 0,vy = 0);
	float(dx = 0,dy = 0);
	float(drag = 0.95);
	float(charge = 0.25);
	float(x = windowWidth/2);
  float(y = windowHeight/2);
	float(threshold = 0, d=0);

  /*old code*/
  //background(0);
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

  socket.on('heartbeat', function(data) {
    users = data;
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

  //draw all of the carts in the game
  for (var i = users.length - 1; i >= 0; i--) {
    var id = users[i].id;
    drawCart(users[i].x,users[i].y, users[i].dir);

    if (id != socket.id) {
      if (collision(x,y,users[i].x,users[i].y)){
        fill(0, 0, 255);
        ellipse(users[i].x, users[i].y, 10, 10);
      }
    }

  }

  image(toilet, itemX,itemX, 100,75);

	var d2 = dist(x,y,itemX,itemX);
  if ( d2 < 40) {
    itemX = random(100,900);
    numItems++;
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

}

function drawCart(x, y, dir){
  if(dir == "right")
    image(cartR,x,y, 100, 100);
  else
    image(cartL,x,y, 100, 100);
}

//comment
function collision(x1,y1,x2,y2) {
  if(x1 >= x2-30 && x1 <= x2+30 && y1 >= y2-30 && y1 <= y2+30) {
    return true;
  } else {
    return false;
  }

}
