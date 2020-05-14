// Keep track of our socket connection
var socket;
var openSimplex;
var users = [];
var marks = [], marks_items = [];
var supplies = [];
var inCollision = false;
var collisionTimer = 0;
var corona;
var numItems;
var markTypes = [];

var myPos;
var worldOffset;
var worldBoundsMin,worldBoundsMax;
var speed = 6;
var screen = 0, mode = 1;
var button_mouse, button_key;

var newX = 0, newY = 0;

function preload(){
  //cart images
  cartR = loadImage('/carts/cartRight.png');
  cartL = loadImage('/carts/cartLeft.png');
  cartR1 = loadImage('/carts/cartRightBag1.png');
  cartL1 = loadImage('/carts/cartLeftBag1.png');
  cartR2 = loadImage('/carts/cartRightBag2.png');
  cartL2 = loadImage('/carts/cartLeftBag2.png');
  cartR3 = loadImage('/carts/cartRightBag3.png');
  cartL3 = loadImage('/carts/cartLeftBag3.png');
  cartR4 = loadImage('/carts/cartRightBag4.png');
  cartL4 = loadImage('/carts/cartLeftBag4.png');

  //splash images
  mark1 = loadImage('/marks/mark1.png');
  mark2 = loadImage('/marks/mark2.png');
//  mark3 = loadImage('/marks/mark3');
//  mark4 = loadImage('/marks/mark4');
//  mark5 = loadImage('/marks/mark5');

  // corona = loadSound('explosion2.mp3');
  back = loadImage('grid.jpg');

  // supplies - images
  toiletpaper = loadImage('toiletpaper.png');
  soapbar = loadImage('soapbar.png');
  bread = loadImage('bread.png');
  eggs = loadImage('eggs.png');
  gloves = loadImage('gloves.png');
  lotion = loadImage('lotion.png');
  mask = loadImage('mask.png');
  milk = loadImage('milk.png');
  tissue = loadImage('tissue.png');
  windex = loadImage('windex.png');
  wipes = loadImage('wipes.png');
  paint = loadImage('paint.png');

}

function setup() {
  // background(back, [255]);
  createCanvas(windowWidth, windowHeight);
	vec = createVector(0,0);
  int(numItems = 0);
	int(s = 0, m = 0); //seconds and minutes
  int(itemX = random(0, windowWidth-100), itemY = random(0, windowHeight-75));
	float(vx = 0,vy = 0);
	float(dx = 0,dy = 0);
	float(drag = .99);
	float(charge = 0.25);
	float(x = windowWidth/2);
  float(y = windowHeight/2);
  float(threshold = 0, d=0);
  ra = int(random(0,255))

	//add item collection
	supplies.push(soapbar);
	supplies.push(toiletpaper);
  supplies.push(bread);
  supplies.push(eggs);
  supplies.push(gloves);
  supplies.push(lotion);
  supplies.push(mask);
  supplies.push(milk);
  supplies.push(tissue);
  supplies.push(windex);
  supplies.push(wipes);
	rand = int(random(0,supplies.length));

  //add splashes
  markTypes.push(mark1);
  markTypes.push(mark2);

  // socket = io.connect('http://cleft.fun:30000');
  socket = io.connect('http://localhost:3000');

  openSimplex = new OpenSimplexNoise2D(Date.now());

  //initial cart
  var data = {
    x: mouseX,
    y: mouseY,
    dir: "left",
    items: 0
  };

  socket.emit('start', data);

  socket.on('heartbeatUsers', function(data) {
    users = data;
  });

  socket.on('heartbeatMarks', function(data) {
    marks = data;
  });

  //scrolling setup code
	myPos = createVector(0,0);
  worldOffset = createVector(0,0);
  worldBoundsMin = createVector(-width/2,-height/2);
	worldBoundsMax = createVector(width/2,height/2);
  imageMode(CENTER);

  // preset background
  // for(let x = - 5000;x < 5000;x+=200)
	// {
	// 		for(let y = - 5000;y < 5000;y+=200)
	// 		{
	// 			let temp = createVector(x,y);
	// 			pts.push(temp);
	// 			ns.push(noise(temp.x*0.3,temp.y*0.3)*150+10);
	// 		}
  // }
}

function draw() {
  // background(back, [255]);
  background(255);

  var d2 = dist(x-30,y-30,itemX+worldOffset.x+(width/2),itemY+worldOffset.y+(height/2));

  if ( d2 < 40) {
    itemX = random(0, windowWidth-100);
    itemY = random(0, windowHeight-75);
    numItems++;
    rand = int(random(0,supplies.length));

  }

  //draw all of the carts in the game
  for (var i = users.length - 1; i >= 0; i--) {
    var id = users[i].id;

    if (id != socket.id) {
      if (!inCollision && collision(x,y,users[i].x+worldOffset.x+(width/2),users[i].y+worldOffset.y+(height/2))){
        var t = int(random(0,markTypes.length));

        var mark = {
          x: x-worldOffset.x-(width/2),
          y: y-worldOffset.y-(height/2),
          type: t,
        };

        socket.emit('new mark', mark);
        inCollision = true;
        collisionTimer = 0;
        numItems += 1;
        // print("CRASHHHHH");
        // corona.play();
      }
    }
  }


	push(); //------------WORLD SCROLLING SET UP--------
		translate(worldOffset.x+(width/2),worldOffset.y+(height/2));

    //display current item.
    image(supplies[rand],itemX,itemY, 100,80);

    //draw all of the carts in the game
    for (var i = users.length - 1; i >= 0; i--) {
      var id = users[i].id;

      if(id != socket.id) {
        drawCart(users[i].x, users[i].y, users[i].dir, users[i].items);
      }

      /*
      if (id != socket.id) {
        if (!inCollision && collision(x,y,users[i].x,users[i].y)){
          var mark = {
            x: x + 50,
            y: y + 50,
            color: ra,
            rnoise: random(1000)
          };
          socket.emit('new mark', mark);
          inCollision = true;
          collisionTimer = 0;

          // corona.play();
        }
      }*/
    } //end draw all the carts

    //draw marks
    for (var i = marks.length - 1; i >= 0; i--) {
      //fill(0,marks[i].color,0);
      // translate(worldOffset.x+(width/2),worldOffset.y+(height/2));
    //  drawSplash(marks[i].x, marks[i].y, marks[i].type);
      image(markTypes[marks[i].type], marks[i].x, marks[i].y, 140,140);
    }

    //decide which direction cart should be facing
    var dir;
    if( mouseX > x+35)
      dir = "right";
    else
      dir = "left";


    collisionTimer++;
    if(collisionTimer > 20) {
      inCollision = false;
    }

  pop();//--------------------

	dx = mouseX-x;
	dy = mouseY-y;
	vec.set(dx,dy);
	vec.normalize();

	//Make the mouse steady
	if (dist(x,y,mouseX,mouseY) < 45)
		d = map(dist(x,y,mouseX,mouseY),0,width,0,0);
	else
		d = map(dist(x,y,mouseX,mouseY),0,width,charge,0);

	vx+=(vec.x*d);
	vy+=(vec.y*d);
	vx*=drag;
	vy*=drag;
	x+=vx;
  y+=vy;

	fill(200,120,120);


	if( mouseX > x+35) {
    drawCart(x,y,"right", numItems);
  }
  else {
    drawCart(x,y,"left", numItems);
  }

	//Mouse left bound
	if(mouseX < 150){
		worldOffset.x+=speed;
		worldBoundsMin.x-=speed;
		worldBoundsMax.x-=speed;
	}

	//Mouse right bound
	if(mouseX > windowWidth-150){
		worldOffset.x-=speed;
		worldBoundsMax.x+=speed;
		worldBoundsMin.x+=speed;
	}

	//Mouse upper bound
	if(mouseY < 150){
		worldBoundsMin.y-=speed;
		worldBoundsMax.y-=speed;
		worldOffset.y+=speed;
	}

	//Mouse bottom bound
	if (mouseY > windowHeight-150){
		worldOffset.y-=speed;
		worldBoundsMax.y+=speed;
		worldBoundsMin.y+=speed;
	}

	//Other bounds
	if(x > windowWidth -100){
		x = windowWidth - 100
	}
	if(x < 100){
		x = 100
	}
	if(y < 75){
		y = 75
	}
	if(y > windowHeight-100){
		y = windowHeight -100
  }

  var cartData = {
    x: x,
    y: y,
    dir: dir,
    items: numItems
  };

  //send this user's data to server
  socket.emit('update', cartData);

  //display the items count.
  trackItems();
}


function drawCart(x, y, dir, numItems){
  if(dir == "right")
    if(numItems < 5)
      image(cartR,x,y, 85, 85);
    else if (numItems < 10)
      image(cartR1,x,y, 90, 90);
    else if (numItems < 15)
      image(cartR2,x,y, 90, 90);
    else if (numItems < 20)
      image(cartR3,x,y, 90, 90);
    else
      image(cartR4,x,y, 90, 90);
  else
    if(numItems < 5)
      image(cartL,x,y, 85, 85);
    else if (numItems < 10)
      image(cartL1,x,y, 90, 90);
    else if (numItems < 15)
      image(cartL2,x,y, 90, 90);
    else if (numItems < 20)
      image(cartL3,x,y, 90, 90);
    else
      image(cartL4,x,y, 90, 90);
}

function drawSplash(x, y, type) {
  image(markTypes[type], x, y, 100,100);
}

function collision(x1,y1,x2,y2) {

  var d2 = dist(x-30,y-30,x2,y2);

  if ( d2 < 40)
    return true;
  else
    return false;
}

//Keep track of the time as long as the player has lives.
function trackItems(){
  int(lives = 1);   //sample lives
	//If player has lives, count the minutes and seconds.
	if (lives!= 0) {
     s = second();
     if(s >= 59){
       s = 0;
		 	 m = (minute() - minute() + 1);
     }
  }
	textSize(20);
	fill(0);
	textFont('Helvatica');
	text(("Items: "+ numItems), (windowWidth-160), (30));
  //text(("Time: "+ m + ":" + s ), (windowWidth-160), (60));
}


function mouse() {
	mode = 1;
	button_mouse.position(windowWidth-100, 15);
	button_key.position(windowWidth-100, 50);
	screen = 1;
}
function keyboard() {
	mode = 2;
	button_mouse.position(windowWidth-100, 15);
	button_key.position(windowWidth-100, 50);
	screen = 1;
}
