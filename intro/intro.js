var screen = 0, mode = 1;
var button_mouse, button_key;
var x = 0;

function preload() {
  intro = loadImage('opening.png'); 
  
  back1 = loadImage('wb1.png');
  back2 = loadImage('wb2.png');
  back3 = loadImage('wb3.png');
  
  bg1 = loadImage('bg1.png');
  bg2 = loadImage('bg2.png'); 
  bg3 = loadImage('bg3.png');  
  bg4 = loadImage('bg4.png');  
  bg5 = loadImage('bg5.png');  
  bg6 = loadImage('bg6.png');  
  bg7 = loadImage('bg7.png');  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  //uncomment below to try different backgrounds
  //background(248,248,255);   //ghostwhite
  //background(255,250,250);   //snow
  //background(245,255,250);   //mintcream
  //background(240,248,255);   //aliceblue
  //background(245,245,245)    //whitesmoke
  background(back1, [255]);
  //background(back2, [255]);
  //background(back3, [255]);
  
  imageMode(CENTER);
  
  //button to select keyboard or mouse
  button_mouse = createButton('Mouse');
  button_mouse.size(75,25);
  button_mouse.value = 0;
  button_mouse.position(windowWidth/2-115, windowHeight/2 + 75);
  button_mouse.mousePressed(mouse);

  button_key = createButton('Keyboard');
  button_key.size(75,25);
  button_key.position(windowWidth/2+20 , windowHeight/2 + 75);
  button_key.mousePressed(keyboard);
}


function draw() {
  if (screen == 0) {
    image(intro, windowWidth/2, windowHeight/2, intro.width/1.5, intro.height/1.5);
    
  } else if (screen == 1) {
       if (x < 100) {
         image(bg1, windowWidth/2, windowHeight/2, bg1.width/1.5, bg1.height/1.5);
       } else if (x >= 100 && x < 200) {
         image(bg2, windowWidth/2, windowHeight/2, bg2.width/1.5, bg2.height/1.5);
       } else if (x >= 200 && x < 300) {
         image(bg3, windowWidth/2, windowHeight/2, bg2.width/1.5, bg2.height/1.5);
       } else if (x >= 300 && x < 400) {
         image(bg4, windowWidth/2, windowHeight/2, bg2.width/1.5, bg2.height/1.5);
       } else if (x >= 400 && x < 500) {
         image(bg5, windowWidth/2, windowHeight/2, bg2.width/1.5, bg2.height/1.5);
       } else if (x >= 500 && x < 600) {
         image(bg6, windowWidth/2, windowHeight/2, bg2.width/1.5, bg2.height/1.5);
       } else if (x >= 600 && x < 700) {
         image(bg7, windowWidth/2, windowHeight/2, bg2.width/1.5, bg2.height/1.5);
       } else {
         screen = 2;
       }
       x ++;
       
  } else if (screen == 2) {
    clear();
    
  }
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
