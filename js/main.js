var canvas, ctx;
var mouseX, mouseY, mouseDown = 0;
var touchX,touchY;

// Function for interacting with canvas
function init() 
{
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');       
    // '2d' means two dimensional rendering context on canvas

    // Now we have context of canvas on ctx
    // we will fill ctx background with blue color
    ctx.fillStyle = "rgb(6, 23, 52)";
    
    // It draws a fill rect with x=0,y=0 as start 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(ctx)
    {
        canvas.addEventListener('mousedown', canvas_mouseDown, false);          
        canvas.addEventListener('mousemove', canvas_mouseMove, false);          
        canvas.addEventListener('mouseup', canvas_mouseUp, false);   
        canvas.addEventListener('touchstart', canvas_touchStart,false);
        canvas.addEventListener('touchmove', canvas_touchMove, false);        
    }
}

// Now to enable drawing on canvas we define draw function
function draw(ctx, x, y, isDown)
{
    if(isDown)
    {   // to inform canvas user is about to draw
        ctx.beginPath();

        // to set color of line
        ctx.strokeStyle = "White";

        // set width of line      
        ctx.lineWidth = '6'; 

        // linejoin : set connection between two line 
        // lineCap  : set end of line      
        ctx.lineJoin = ctx.lineCap = 'round'; 

        // it tells where to start drawing line  
        ctx.moveTo(lastX, lastY); 

        // draw line from start to current position of pointer
        ctx.lineTo(x,y);

        // drawing is complete      
        ctx.closePath();   

        // to paint the line drawn with some pixel   
        ctx.stroke();    
    }   
    // if not mousedown than start position is curr position  
    lastX = x; 
    lastY = y; 
}

// Event handlers

// when mouse is down it will call draw function
function canvas_mouseDown() 
{
    mouseDown = 1;    
    draw(ctx, mouseX, mouseY, false);
}

// when mouse is released it set's mousedown back to false
function canvas_mouseUp() 
{    
    mouseDown = 0;
}

// it is activated when mouse is moved in either direction
// it get's current position of mouse from getMousePos(e)
// if mouseDown than call draw
function canvas_mouseMove(e) 
{
    getMousePos(e);
    if (mouseDown == 1) 
    {
        draw(ctx, mouseX, mouseY, true);
    }
}

// It finds current position of pointer when mouse event is triggered
// offset x, offset y return x,y cordinates of mouse
// layer x,layer y return horizontal and vertical cordinates relative to current layer
function getMousePos(e) 
{        
    if (e.offsetX) 
    {        
      mouseX = e.offsetX;        
      mouseY = e.offsetY;    
    }    
    else if (e.layerX) 
    {        
      mouseX = e.layerX;        
      mouseY = e.layerY;    
    } 
}


// Touch event handler (basically for mobile users)

// it is activated when user touches the touchpad
// it calls draw func with false to note position not to draw
function canvas_touchStart() 
{     
    getTouchPos();    
    draw(ctx, touchX, touchY, false);    
    // this prevents scrolling of screen when user draws
    event.preventDefault();
}


// it is activated when user drags in sketchpad
// it calls draw with true flag to enable drawing
function canvas_touchMove(e)
{     
    getTouchPos(e);    
    draw(ctx, touchX, touchY, true);    
    event.preventDefault();
}

// it is used to find point in the sketchpad where user has touched
function getTouchPos(e) 
{    
    if (!e)        
    var e = event;     
    if(e.touches)
    {   
        // it length is used to find  
        // how many fingers has touched    
      if (e.touches.length == 1) 
      {            
        var touch = e.touches[0];            
        touchX = touch.pageX - touch.target.offsetLeft;               
        touchY = touch.pageY - touch.target.offsetTop;        
      }
    }
}

// Clearing the sketchpad
document.getElementById('clear_button').addEventListener("click", 
    function()
    {  
        ctx.clearRect(0, 0, canvas.width, canvas.height);  
        ctx.fillStyle = "rgb(6, 23, 52)"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
);


// INTEGRATING CANVAS WITH DIGIT RECOGNITION MODEL

// the base url of website in which our web app is deployed is obtained from 
// window.location.origin
// the json file is loaded using async function

var base_url = window.location.origin;
let model;
(async function(){  
    console.log("model loading...");  
    model = await tf.loadLayersModel("models/model.json");
    console.log("model loaded..");
})();

// Pre-Processing for the Model

// The digit which is sketched is passed as image to model 
// so as to predict the value of it

function preprocessCanvas(image) 
{   
    // resizing the input image to target size of (1, 28, 28) 
    
    let tensor = tf.browser.fromPixels(image, 1); 
    tensor = tensor.resizeNearestNeighbor([28, 28]);
    tensor = tensor.toFloat();
    tensor = tensor.div(255);
    tensor = tensor.expandDims();
    return tensor;
}

// Prediction
// canvas.toDataURL() : returns image in format specified default png
// than send to preprocess function
// await makes program wait until model prediction
// displayLabel to display result
document.getElementById('predict_button').addEventListener("click",async function()
{     
    var imageData = canvas.toDataURL();
    console.log(imageData);    
    let tensor = preprocessCanvas(canvas); 
    console.log(tensor);
    let predictions = await model.predict(tensor).data();  
    console.log(predictions);
    let results = Array.from(predictions);    
    displayLabel(results);    
    console.log("Prediction Successful");
});

// OUTPUT
function displayLabel(data)
{ 
    var max = data[0];    
    var maxIndex = 0;     
    for (var i = 1; i < data.length; i++) 
    {        
      if (data[i] > max) 
      {           
        maxIndex = i;            
        max = data[i];        
      }
    }
    document.getElementById('result').innerHTML = maxIndex;  
    document.getElementById('confidence').innerHTML = "Confidence: "+(max*100).toFixed(2) + "%";
}