// Keep track of our socket connection
var socket;
var openSimplex;
//server variables
var users = [];
var marks = [];

//game play variables
var supplies = [];
var inCollision = false;
var collisionTimer = 0;
var numItems;
var markTypes = [];
var mostItems = 0;
var hasMost = false;

//screen/canvas positioning variables
var myPos;
var worldOffset;
var worldBoundsMin,worldBoundsMax;
var canvasSize = 500;
var screen = 0, mode = 1;

var speed = 6;

//button variables
var button_mouse, button_key, skip_button;

var newX = 0, newY = 0;

//sound
var crash_sound;
var grabItem_sound;
var corona;

var item;
var object;
var arrow;
var range;

//direction arrow variables
var arrowImage;
var testArrow;
var arrowVal;

//zooming out variables
var scaleCount = 1;
var imageOpacity = 255;

function preload(){

   // intro images
   intro = loadImage('/intro/opening.png');
   bg1 = loadImage('/intro/bg1.png');
   bg2 = loadImage('/intro/bg2.png');
   bg3 = loadImage('/intro/bg3.png');
   bg4 = loadImage('/intro/bg4.png');
   bg5 = loadImage('/intro/bg5.png');
   bg6 = loadImage('/intro/bg6.png');
   bg7 = loadImage('/intro/bg7.png');

   // background images
   back1 = loadImage('backgrounds/wb1.png');
   back2 = loadImage('backgrounds/wb2.png');
   back3 = loadImage('backgrounds/wb3.png');

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
  crown = loadImage('/carts/crown.png');

  //splash images
  mark1 = loadImage('/marks/mark1.png');
  mark2 = loadImage('/marks/mark2.png');
  mark3 = loadImage('/marks/mark3.png');
  mark4 = loadImage('/marks/mark4.png');
  mark5 = loadImage('/marks/mark5.png');

  // corona = loadSound('explosion2.mp3');
  back = loadImage('backgrounds/grid.jpg');

  // supplies - images
  toiletpaper = loadImage('supplies/toiletpaper.png');
  soapbar = loadImage('supplies/soapbar.png');
  bread = loadImage('supplies/bread.png');
  eggs = loadImage('supplies/eggs.png');
  gloves = loadImage('supplies/gloves.png');
  lotion = loadImage('supplies/lotion.png');
  mask = loadImage('supplies/mask.png');
  milk = loadImage('supplies/milk.png');
  tissue = loadImage('supplies/tissue.png');
  windex = loadImage('supplies/windex.png');
  wipes = loadImage('supplies/wipes.png');

  // soundFormats('mp3', 'ogg');
  // grabItem_sound = loadSound("sounds/grabitem1.mp3")
  // crash_sound = loadSound("sounds/cart-crash3.mp3")
}

function setup() {
  background(back1, [255]);
  createCanvas(windowWidth, windowHeight);
	vec = createVector(0,0);
  int(numItems = 0);
	int(s = 0, m = 0); //seconds and minutes
  int(itemX = random(0, windowWidth-150), itemY = random(0, windowHeight-150));
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
  markTypes.push(mark3);
  markTypes.push(mark4);
  markTypes.push(mark5);

  //socket = io.connect('http://cleft.fun:30000');
  socket = io.connect('http://localhost:30000');

  openSimplex = new OpenSimplexNoise2D(Date.now());

  //initial cart
  var data = {
    x: mouseX,
    y: mouseY,
    dir: "left",
    items: 0
  };

  //send and get initial data to the sever.
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
  angleMode(DEGREES);

  //button to select keyboard or mouse
  let col = color(21, 27, 36, 220);
  button_mouse = createButton('Mouse');
  button_mouse.style('background-color', col);
  button_mouse.style('color', 'white');
  button_mouse.size(75,25);
  button_mouse.value = 0;
  button_mouse.position(windowWidth/2-50, windowHeight/2 +100);
  button_mouse.mousePressed(mouse);

  button_key = createButton('Keyboard');
  button_key.style('background-color', col);
  button_key.style('color', 'white');
  button_key.size(75,25);
  button_key.position(windowWidth/2+30 , windowHeight/2 +100);
  button_key.mousePressed(keyboard);

  col = color(191, 207, 227, 50);
  skip_button = createButton('Skip Intro');
  skip_button.style('background-color', col);
  skip_button.size(85,25);
  skip_button.mousePressed(skip_intro);

	item = createVector(windowWidth/2, windowHeight/2);
	object = createVector(mouseX,mouseY);
	arrow = createVector(mouseX+20, mouseY-20);

	// Draw arrow
	imageMode(CENTER);
	let resolution = 50;
	arrowImage = createGraphics(resolution, resolution);
	arrowImage.beginShape(LINES);
	arrowImage.vertex(0, 0.5 * resolution);
	arrowImage.vertex(resolution, 0.5 * resolution);
	arrowImage.vertex(resolution, 0.5 * resolution);
	arrowImage.vertex(0.5 * resolution, 0.8 * resolution);
	arrowImage.vertex(resolution, 0.5 * resolution);
	arrowImage.vertex(0.5 * resolution, 0.2 * resolution);
	arrowImage.endShape();
	testArrow = new Arrow();

  windowResized();
}

function draw() {
  //draw background.
  // background(back, [255]);

  //get current winner's number of items
  socket.on('getWinnerCount', function(data) {
    mostItems = data;
  });

  //intro screen
  if (screen == 0) {
    image(intro, windowWidth/2, windowHeight/2, intro.width/1.5, intro.height/1.5);
  //directions screen
  } else if (screen == 1) {
    skip_button.position(windowWidth/2+220 , windowHeight/2+200);

    if (s < 100) {
      image(bg1, windowWidth/2, windowHeight/2, bg1.width/1.5, bg1.height/1.5);
    } else if (s >= 100 && s < 200) {
      image(bg2, windowWidth/2, windowHeight/2, bg2.width/1.5, bg2.height/1.5);
    } else if (s >= 200 && s < 300) {
      image(bg3, windowWidth/2, windowHeight/2, bg3.width/1.5, bg3.height/1.5);
    } else if (s >= 300 && s < 400) {
      image(bg4, windowWidth/2, windowHeight/2, bg4.width/1.5, bg4.height/1.5);
    } else if (s >= 400 && s < 500) {
      image(bg5, windowWidth/2, windowHeight/2, bg5.width/1.5, bg5.height/1.5);
    } else if (s >= 500 && s < 600) {
      image(bg6, windowWidth/2, windowHeight/2, bg6.width/1.5, bg6.height/1.5);
    } else if (s >= 600 && s < 700) {
      image(bg7, windowWidth/2, windowHeight/2, bg7.width/1.5, bg7.height/1.5);
    } else {
      screen = 2;
    }
    s ++;

  //game play screen
  } else if (screen == 2) {
      background(255);

      //zoom out
      if(marks.length == 100) {
        button_mouse.hide();
        button_key.hide();
        if(scaleCount > .5) {
          scale(scaleCount);
          scaleCount=scaleCount-.007;
          imageOpacity=imageOpacity-7;
        } else {
          scale(scaleCount);
          showEndScreen();
          screen = 3;
        }
      }

      skip_button.position(windowWidth, -50);

      //check if cart has picked up an item
      var d2 = dist(x,y,itemX+worldOffset.x+(width/2),itemY+worldOffset.y+(height/2));
      if ( d2 < 40) {
        itemX = random(-canvasSize+200, canvasSize-200);
        itemY = random(-canvasSize+200, canvasSize-200);
        numItems++;
        rand = int(random(0,supplies.length));
        // grabItem_sound.play();
      }
      arrowVal = atan2((itemY+worldOffset.y+(height/2)) - y,	(itemX+worldOffset.x+(width/2)) - x);

    //check all carts for collisions
     for (var i = users.length - 1; i >= 0; i--) {
       var id = users[i].id;

       if (id != socket.id) {
         if (!inCollision && collision(x,y,users[i].x+worldOffset.x+(width/2),users[i].y+worldOffset.y+(height/2))){
           var t = int(random(0,markTypes.length));
           var a = int(random(0,360));

           //create new paint splahs
           var mark = {
             x: x-worldOffset.x-(width/2),
             y: y-worldOffset.y-(height/2),
             type: t,
             angle: a
           };

           socket.emit('new mark', mark);
           inCollision = true;
           collisionTimer = 0;
           //collision physics
           vx *= (-1);
           vy *= (-1);
           users[i].x -= vx;
           users[i].y -= vy;
          //  crash_sound.play();
         }
       }
     }


    push(); //------------WORLD SCROLLING SET UP--------
      translate(worldOffset.x+(width/2),worldOffset.y+(height/2));

      //draw marks
      for (var i = marks.length - 1; i >= 0; i--) {
          // rotate(marks[i].angle);
          image(markTypes[marks[i].type], marks[i].x, marks[i].y, 140,140);
      }

      //display current item.
      if(scaleCount < 1) {
        //if zooming out, fade image
        push();
        tint(255,imageOpacity);
        image(supplies[rand],itemX,itemY, 100,80);
        pop();
      } else {
        image(supplies[rand],itemX,itemY, 100,80);
      }


      //draw all of the carts in the game
      for (var i = users.length - 1; i >= 0; i--) {
        var id = users[i].id;

        //only want to draw carts from server that are not this user's cart
        if(id != socket.id) {
          if(scaleCount < 1) {
            push();
            tint(255, imageOpacity);
            drawCart(users[i].x, users[i].y, users[i].dir, users[i].items, users[i].isWinning);
            pop();
          }
          else {
            drawCart(users[i].x, users[i].y, users[i].dir, users[i].items, users[i].isWinning);
          }
        }
      } //end draw all the carts

      //decide which direction cart should be facing
      var dir;
      if( mouseX > x+35)
        dir = "right";
      else
        dir = "left";

      //ensures carts don't trigger collision too many times while touching
      collisionTimer++;
      if(collisionTimer > 20) {
        inCollision = false;
    }

    pop();//-----------------------------

    dx = mouseX-x;
    dy = mouseY-y;
    vec.set(dx,dy);
    vec.normalize();

    //Make the mouse steady
    if (dist(x,y,mouseX,mouseY) < 45)
      d = map(dist(x,y,mouseX,mouseY),0,width,0,0);
    else
      d = map(dist(x,y,mouseX,mouseY),0,width,charge,0);

    //cart physics
    vx+=(vec.x*d);
    vy+=(vec.y*d);
    vx*=drag;
    vy*=drag;
    x+=vx;
    y+=vy;

    fill(200,120,120);

    //draw this user's cart
    if(numItems != 0 && numItems >= mostItems) {
      hasMost = true;
    } else {
      hasMost = false;
    }
    if( mouseX > x+35) {
      if(scaleCount < 1) {
        //if zooming out, fade image
        push();
        tint(255,imageOpacity);
        drawCart(x,y,"right", numItems, hasMost);
        pop();
      } else {
        drawCart(x,y,"right", numItems, hasMost);
      }
    }
    else {
      if(scaleCount < 1) {
        //if zooming out, fade image
        push();
        tint(255,imageOpacity);
        drawCart(x,y,"left", numItems, hasMost);
        pop();
      } else {
        drawCart(x,y,"left", numItems, hasMost);
      }
    }

    //Mouse left bound
    if(mouseX < 150 && worldOffset.x < canvasSize){
      worldOffset.x+=speed;
      worldBoundsMin.x-=speed;
      worldBoundsMax.x-=speed;
    }

    //Mouse right bound
    else if(mouseX > windowWidth-150 && worldOffset.x > -canvasSize){
      worldOffset.x-=speed;
      worldBoundsMax.x+=speed;
      worldBoundsMin.x+=speed;
    }

    //Mouse upper bound
    else if(mouseY < 150 && worldOffset.y < canvasSize){
      worldBoundsMin.y-=speed;
      worldBoundsMax.y-=speed;
      worldOffset.y+=speed;
    }

    //Mouse bottom bound
    else if (mouseY > windowHeight-150 && worldOffset.y > -canvasSize){
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

    //current cart's data to send to the server
    var cartData = {
      x: x+worldOffset.x,
      y: yx+worldOffset.y,
      dir: dir,
      items: numItems,
    };

    //send this user's data to server
    socket.emit('update', cartData);

    if(scaleCount > .9) {
      // display the items count.
      trackItems();
      // testArrow.update();
      testArrow.display();
    }

    if(scaleCount == .5) {
      showEndScreen();
      screen = 3;
    }

  //end of game screen
  } else {
    scale(scaleCount);
    translate(worldOffset.x+(width/2),worldOffset.y+(height/2));

    //draw marks
    for (var i = marks.length - 1; i >= 0; i--) {
      push();
        // rotate(marks[i].angle);
        image(markTypes[marks[i].type], marks[i].x, marks[i].y, 140,140);
      pop();
    }
  }
}


function drawCart(x, y, dir, items, isWinning){
  if(dir == "right") {
    if(items < 10)
      image(cartR,x,y, 85, 85);
    else if (items < 20)
      image(cartR1,x,y, 90, 90);
    else if (items < 25)
      image(cartR2,x,y, 90, 90);
    else if (items < 30)
      image(cartR3,x,y, 90, 90);
    else
      image(cartR4,x,y, 90, 90);
  } else {
    if(items < 10)
      image(cartL,x,y, 85, 85);
    else if (items < 20)
      image(cartL1,x,y, 90, 90);
    else if (items < 25)
      image(cartL2,x,y, 90, 90);
    else if (items < 30)
      image(cartL3,x,y, 90, 90);
    else
      image(cartL4,x,y, 90, 90);
  }
  if(isWinning) {
    image(crown,x-5,y-40,70,70);
  }
}

//draw paint
function drawSplash(x, y, type) {
  image(markTypes[type], x, y, 100,100);
}

//check if two carts have collided
function collision(x1,y1,x2,y2) {

  var d2 = dist(x,y,x2,y2);
  if ( d2 < 40)
    return true;
  else
    return false;
}

//Item text
function trackItems(){
	textSize(20);
	fill(0);
	textFont('Helvatica');
	text(("Items: "+ numItems), (windowWidth/4), 30);
  text(("Players: "+ users.length ), (windowWidth- windowWidth/3.2), 30);
}


function mouse() {
	if(screen != 2){
    screen = 1;
    button_mouse.position(windowWidth-100, 15);
    button_key.position(windowWidth-100, 50);
  }
  mode = 1;
}
function keyboard() {
  //only change if
  if(screen != 2){
    screen = 1;
    button_mouse.position(windowWidth-100, 15);
    button_key.position(windowWidth-100, 50);
  }
  mode = 2;
}

function skip_intro(){
  mode = 1;
  screen = 2;
  skip_button.position(windowWidth, -50);
  button_mouse.position(windowWidth-100, 15);
	button_key.position(windowWidth-100, 50);
}


//directional arrow
class Arrow {
	constructor() {
		arrowVal = atan2(
			height * 0.5,
			width * 0.5
		)
	}

	update() {
		arrowVal = atan2(itemY - y,	itemX - x)
	}

	display() {
		push()
		translate(width * 0.5, height * 0.05)
		rotate(arrowVal)
		image(arrowImage, 0, 0)
		pop()
	}
}

function windowResized() {
  const css = getComputedStyle(canvas.parentElement),
        marginWidth = round(float(css.marginLeft) + float(css.marginRight)),
        marginHeight = round(float(css.marginTop) + float(css.marginBottom)),
        w = windowWidth - marginWidth - (windowWidth/20), h = windowHeight - marginHeight - (windowHeight/20);

  resizeCanvas(w, h, true);
} 

function showEndScreen() {
  socket.emit('delete users');
  supplies = [];
}
