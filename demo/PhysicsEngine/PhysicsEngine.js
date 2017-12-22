//2D Vector
Vector2=function(x,y){this.x=x; this.y=y;};

Vector2.prototype={
    copy:function(){return new Vector2(this.x,this.y);},
    length:function(){return Math.sqrt(this.x*this.x+this.y*this.y);},
    sqrLength:function(){return this.x*this.x+this.y*this.y;},
    normalize:function(){var inv=1/this.length(); return new Vector2(this.x*inv,this.y*inv);},
    add:function(v){return new Vector2(this.x+v.x,this.y+v.y);},
    subtract:function(v){return new Vector2(this.x-v.x,this.y-v.y);},
    multiply:function(c){return new Vector2(this.x*c,this.y*c);},
    divide:function(c){var inv=1/c; return new Vector2(this.x*c,this.y*c);},
    dot:function(v){return this.x*v.x+this.y*v.y;},
};

Vector2.zero=new Vector2(0,0);


//Circle
Circle=function(center,radius,velocity){this.center=center; this.radius=radius; this.velocity=velocity;};

Circle.prototype={
    copy:function(){return new Circle(this.center.copy(),this.radius.copy())},
    initialize:function(){
        this.angle=0;
        this.acceleration=new Vector2(0,10);
    },
};


//Main
//xarix -->    yarix V
var isContinue,timeoutID;
var weakness=0.99;

//check collision with chamber
function Collision_chamber(circle){
    /*if (circle.center.x+circle.radius>=canvas.width && circle.velocity.x>0) circle.velocity.x=-circle.velocity.x*weakness;
    if (circle.center.x-circle.radius<=0 && circle.velocity.x<0) circle.velocity.x=-circle.velocity.x*weakness;
    if (circle.center.y+circle.radius>=canvas.height && circle.velocity.y>0) circle.velocity.y=-circle.velocity.y*weakness;
    if (circle.center.y-circle.radius<=0 && circle.velocity.y<0) circle.velocity.y=-circle.velocity.y*weakness;*/

    if (circle.center.x+circle.radius>=canvas.width || circle.center.x-circle.radius<=0){
        circle.velocity.x=-circle.velocity.x*weakness;
        if (circle.center.x+circle.radius>=canvas.width) circle.center.x=canvas.width-circle.radius;
        else circle.center.x=circle.radius;
    }
    if (circle.center.y+circle.radius>=canvas.height || circle.center.y-circle.radius<=0){
        circle.velocity.y=-circle.velocity.y*weakness;        
        if (circle.center.y+circle.radius>=canvas.height) circle.center.y=canvas.height-circle.radius;
        else circle.center.y=circle.radius;
    }
}


//Update circle's center and velocity
function Update(circle){
    var maxV=1/70;
    circle.center=circle.center.add(circle.velocity.multiply(dt));
    circle.velocity=circle.velocity.add(circle.acceleration.multiply(dt));
    circle.angle+=dt*(circle.velocity.length()*maxV);//根据速度决定旋转速度
    
    Collision_chamber(circle);
}


//Trace back(abandoned)
/*function Back(circle,dtt){
    var maxV=1/70;
    circle.center=circle.center.subtract(circle.velocity.multiply(dtt));
    circle.velocity=circle.velocity.subtract(circle.acceleration.multiply(dtt));
    circle.angle-=dt*(circle.velocity.length()*maxV);//根据速度决定旋转速度
    
    Collision_chamber(circle);   
}*/


//Check collision between circle1 and circle2
function Collision_circle(circle1,circle2){  
    var dx=circle2.center.x-circle1.center.x;
    var dy=circle2.center.y-circle1.center.y;
    var distance=Math.sqrt(dx*dx+dy*dy);
    if (distance>circle1.radius+circle2.radius) return;
    var ax=dx/distance;
    var ay=dy/distance;
    var az=Math.sqrt(ax*ax+ay*ay);

    //va:圆心连线方向
    var va1=circle1.velocity.x*ax+circle1.velocity.y*ay;
    var vb1=-circle1.velocity.x*ay+circle1.velocity.y*ax;
    var va2=circle2.velocity.x*ax+circle2.velocity.y*ay;
    var vb2=-circle2.velocity.x*ay+circle2.velocity.y*ax;

    var temp=va2; va2=va1; va1=temp;
    
    if (distance<circle1.radius+circle2.radius){
        /*var dtt=(distance-(circle1.radius+circle2.radius))/(va1+va2);
        Back(circle1,dtt);
        Back(circle2,dtt);*/
        var det=((circle1.radius+circle2.radius)-distance)/2;
        circle1.center.x+=det*ax/az;
        circle1.center.y+=det*ay/az;
        circle2.center.x+=det*ax/az;
        circle2.center.y+=det*ay/az;
    }

    circle1.velocity.x=weakness*(va1*ax/az-vb1*ay/az);
    circle1.velocity.y=weakness*(va1*ay/az+vb1*ax/az);
    circle2.velocity.x=weakness*(va2*ax/az-vb2*ay/az);
    circle2.velocity.y=weakness*(va2*ay/az+vb2*ax/az);
}


//Time
function step(circle) {

    //update velocity
    Update(circle);
    //nowTime++;

    ctx.strokeStyle="#000000";
    ctx.fillStyle="#FFFFFF";

    //show circle
    ctx.beginPath();
    ctx.arc(circle.center.x,circle.center.y,circle.radius,0,Math.PI*2,true); 
    ctx.closePath();
    
    //show rotate
    ctx.moveTo(circle.center.x,circle.center.y); //begin_point
    ctx.lineTo(circle.center.x+circle.radius*Math.cos(circle.angle),circle.center.y+circle.radius*Math.sin(circle.angle)); //end_point

    //show ChamberBox
    ctx.moveTo(0,0);
    ctx.lineTo(canvas.width,0);
    ctx.moveTo(0,0);
    ctx.lineTo(0,canvas.height);
    ctx.moveTo(0,canvas.height);
    ctx.lineTo(canvas.width,canvas.height);
    ctx.moveTo(canvas.width,0);
    ctx.lineTo(canvas.width,canvas.height);

    ctx.fill();
    ctx.stroke();
}


//Main
function start(func,circles) {
    if (timeoutID) stop();
    ctx=canvas.getContext("2d");
    isContinue=true;
    var loop=function() {
        clearCanvas();
        for(var i in circles)
            func(circles[i]);
        for(var i in circles)
            for(var j in circles)
                if (i<j) Collision_circle(circles[i],circles[j]);
        if (isContinue)
            timeoutID=setTimeout(loop,10);
    }
    loop();
}


function stop(){
    clearTimeout(timeoutID);
    isContinue=false;
}

function clearCanvas() {
    if (ctx!=null)
        ctx.clearRect(0,0,canvas.width,canvas.height);
}


//Generate canvas,circles
var dt,nowTime;
var global_circles=new Array();

function Rand(l,r){
    var num=l+Math.random()*(r-l);
    num=parseInt(num,10);
    return num;
}

function AddCircle(){
    //circle(center,radius,velocity)
    var circle=new Circle(new Vector2(Rand(0,canvas.width),Rand(0,canvas.height)),20,new Vector2(Rand(-100,100),Rand(-100,100)));
    circle.initialize();
    global_circles.push(circle);
}

function generate(){
    canvas=document.getElementById("Canvas");
    
    //add_circle
    for(var i=1;i<=5;i++)
        AddCircle();

    //det_time
    dt=0.1;

    start(step,global_circles);
}