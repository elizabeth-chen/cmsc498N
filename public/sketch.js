// Keep track of our socket connection
var socket;
var openSimplex;
var users = [];
var marks = [], marks_items = [];
var supplies = [];
var inCollision = false;
var collisionTimer = 0;
var corona;

var myPos;
var worldOffset;
var worldBoundsMin,worldBoundsMax;
var speed = 6;
var screen = 0, mode = 1;
var button_mouse, button_key;

function preload(){
  cartR = loadImage('cartRight.png');
  cartL = loadImage('cartLeft.png');
  corona = loadSound('corona_virus.mp3');
  back = loadImage('paper.jpg');

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

  // socket = io.connect('http://cleft.fun:30000');
  socket = io.connect('http://localhost:3000');

  openSimplex = new OpenSimplexNoise2D(Date.now());

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

  //scrolling setup code 
	myPos = createVector(0,0);
  worldOffset = createVector(0,0);
  worldBoundsMin = createVector(-width/2,-height/2);
	worldBoundsMax = createVector(width/2,height/2);
  imageMode(CENTER);
  
  //button to select keyboard or mouse
  button_mouse = createButton('Mouse');
  button_mouse.size(75,25);
  button_mouse.value = 0;
  button_mouse.position(windowWidth/2-75, windowHeight/2);
  button_mouse.mousePressed(mouse);

  button_key = createButton('Keyboard');
  button_key.size(75,25);
  button_key.position(windowWidth/2+50 , windowHeight/2);
  button_key.mousePressed(keyboard);

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
  //Display screen with welcome message.
  if (screen == 0) {
    background(255)
    // tint(255, 127); // Display at half opacity
    fill(0)
    textAlign(CENTER);
    textSize(26);
    text('WELCOME TO BATTLE OF HOARDERS', width / 2, height / 2-100)
    textSize(18);
    text('Chose your controls to start', width / 2, height / 2 -60);
    
  } else if (screen == 1){
    background(255);
    // background(back, [255]);
		
		push(); //------------WORLD SCROLLING SET UP--------
			translate(worldOffset.x+(width/2),worldOffset.y+(height/2));
      
      //draw marks
      noStroke();
      for (var i = marks.length - 1; i >= 0; i--) {
        fill(0,marks[i].color,0);
        drawSplash(marks[i].x, marks[i].y, marks[i].rnoise);
      }

      //display current item.
      image(supplies[rand],itemX,itemY, 100,80);
      //location of current item to collect
      var d2 = dist(x-30,y-30,itemX,itemY);
      if ( d2 < 40) {
        itemX = random(0, windowWidth-100);
        itemY = random(0, windowHeight-75);
        numItems++;
        rand = int(random(0,supplies.length));
      }
      //decide which direction cart should be facing
      var dir;
      if( mouseX > x+35)
        dir = "right";
      else
        dir = "left";

      //draw all of the carts in the game
      for (var i = users.length - 1; i >= 0; i--) {
        var id = users[i].id;

        if(id != socket.id) {
          drawCart(users[i].x,users[i].y, users[i].dir);
        } else {
          drawCart(x,y, dir);
        }

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
        }
      } //end draw all the carts

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

    pop();//--------------------

      
    /*********************  MOUSE MODE  *********************/
		if(mode == 1){
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
      
      push();//************

				fill(200,120,120);
				translate(x, y);
				if( mouseX > x+35) 
						 image(cartR,0,0, 100, 100);
					 else 
             image(cartL,0,0, 100, 100);

        
			pop();//************

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
      

      

		}//end mouse controls

    //display the time and number of items count.
    trackTime();





			// if(mode == 2){ // if keyboard mode.
			// 	push();//************
			// 		fill(200,120,120);
			// 		translate(myPos.x, myPos.y);
			// 		// ellipse(0,0,100,100);
			// 		if( mouseX > x+35) 
			// 		 image(cartR,0,0, 100, 100);
			// 	 else 
			// 		 image(cartL,0,0, 100, 100);
			// 	pop();//************
			// }

		// pop();//--------------------
    
    /*********************   KEYBOARD MODE  *********************/
		// if (mode == 2){
		// 	//Keyboard left bound
		// 	if(keyIsDown(LEFT_ARROW)){
		// 		if(myPos.x < worldBoundsMin.x+ 150){
		// 			worldOffset.x+=speed;
		// 			worldBoundsMin.x-=speed;
		// 			worldBoundsMax.x-=speed;
		// 		}
		// 		myPos.x-=speed; 		
		// 	}

		// 	//Keyboard right bound
		// 	if(keyIsDown(RIGHT_ARROW)){
		// 		if(myPos.x > worldBoundsMax.x-150){
		// 			worldOffset.x-=speed;
		// 			worldBoundsMax.x+=speed;
		// 			worldBoundsMin.x+=speed;
		// 		}
		// 		myPos.x+=speed;
		// 	}
			
		// 	//Keyboard upper bound
		// 	if(keyIsDown(UP_ARROW)){
		// 		if(myPos.y < worldBoundsMin.y+150){
		// 			worldBoundsMin.y-=speed;
		// 			worldBoundsMax.y-=speed;
		// 			worldOffset.y+=speed;
		// 		}
		// 		myPos.y-=speed;
		// 	}
		// 	//Keyboard lower bound
		// 	if(keyIsDown(DOWN_ARROW)){
		// 			if(myPos.y >worldBoundsMax.y-150){
		// 			worldOffset.y-=speed;
		// 			worldBoundsMax.y+=speed;
		// 			worldBoundsMin.y+=speed;
		// 		}
		// 		myPos.y+=speed;
		// 	}
    // }//end keyboard mode and controls
    
    


    // //decide which direction cart should be facing
    // var dir;
    // if( mouseX > x+35)
    //   dir = "right";
    // else
    //   dir = "left";


    // //draw marks
    // noStroke();
    // for (var i = marks.length - 1; i >= 0; i--) {
    //   fill(0,marks[i].color,0);
    //   drawSplash(marks[i].x, marks[i].y, marks[i].rnoise);
    // }






  //   //display current item.
  //   image(supplies[rand],itemX,itemY, 100,80);
  //   //location of current item to collect
  //   var d2 = dist(x-30,y-30,itemX,itemY);
  //   if ( d2 < 40) {
  //     itemX = random(0, windowWidth-100);
  //     itemY = random(0, windowHeight-75);
  //     numItems++;
  //     rand = int(random(0,supplies.length));
  //   }
	
    

    // var data = {
    //   x: x,
    //   y: y,
    //   dir: dir
    // };

    // //send this user's data to server
    // socket.emit('update', data);
    // collisionTimer++;
    // if(collisionTimer > 20) {
    //   inCollision = false;
    // }

  // }


  }//end screen 1
}





function drawCart(x, y, dir){
  if(dir == "right")
    image(cartR,x,y, 100, 100);
  else
    image(cartL,x,y, 100, 100);
}

function drawSplash(x, y, rnoise) {
  push();
	translate(x-35, y-45);
	beginShape();
	// for(let angle = 0; angle <= TWO_PI; angle += PI / 1000) {
	// 	let radius = map(noise(rnoise), 0, 1, 20*0.1, 20*4);
	// 	let x = radius*cos(angle);
	// 	let y = radius*sin(angle);
	// 	curveVertex(x,y);
	// 	rnoise += 0.01
  // }
  image(paint, x, y, 100,100);
	endShape(CLOSE);
	pop();
}



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
	textSize(20);
	fill(0);
	textFont('Helvatica');
	text(("Items: "+ numItems), (windowWidth-160), (30));
  text(("Time: "+ m + ":" + s ), (windowWidth-160), (60));
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
