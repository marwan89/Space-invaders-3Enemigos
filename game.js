(function(){
'use strict';
window.addEventListener('load',init,false);
window.addEventListener('resize',setFullscreen,false);
var canvas=null,ctx=null;
var lastPress=null;
var pause=true;
var gameover=true;
var score=0;
var dir=0;

var KEY_SPACE=32;
var KEY_ENTER=13;
var KEY_LEFT=37;
var KEY_UP=38;
var KEY_RIGHT=39;
var KEY_DOWN=40;

///////////////////////////////////////////////

var pressing=[];

var player=new Rectangle(100,290,10,10,0,3);

var shots=[];
var enemies=[];
///////////////////////////////////

var powerups=[];

var multishot=1;

var messages=[];

var spritesheet=new Image();
spritesheet.src='assets/spritesheet.png';

var spritesheet2=new Image();
spritesheet2.src='assets/spritesheet2.png';

var aTimer=0;//Timer xa cambiar las imagenes de mi spritesheet dinámicamente

var stars=[];
//Fondo
var background=new Image();
background.src='assets/fondo.jpg';

var bgTimer=0;

var eTimer=0;
var eTimer2=0;


function random(max){
    return ~~(Math.random()*max);
}
function setFullscreen(){
            var w=window.innerWidth/canvas.width;
            var h=window.innerHeight/canvas.height;
            var scale=Math.min(h,w);

            canvas.style.width=(canvas.width*scale)+'px';
            canvas.style.height=(canvas.height*scale)+'px';
            canvas.style.position='fixed';
            canvas.style.left='50%';
            canvas.style.top='50%';
            canvas.style.marginLeft=-(canvas.width*scale)/2+'px';
            canvas.style.marginTop=-(canvas.height*scale)/2+'px';
        }

function reset(){
      score=0;
        player.x=100;
        player.y=290;
        shots.length=0;
        enemies.length=0;
        enemies.push(new Rectangle(10,0,10,10,0,2));
        enemies.push(new Rectangle(40,0,10,10,0,2));
        gameover=false;
        player.timer=0;
        player.health=3;
        multishot=1;
        messages.length=0;
        aTimer=0;
}

function init(){
    canvas=document.getElementById('canvas');
    ctx=canvas.getContext('2d');
    //Genero 100 estrellas al azar
    for(var i=0;i<200;i++){
        stars.push(new Star(random(canvas.width),random(canvas.height),random(100)));
    }
    setFullscreen();
    run();
    repaint();
}

function run(){
    setTimeout(run,50);
    act();
}

function repaint(){
    requestAnimationFrame(repaint);
    paint(ctx);
}

function act(){
    if(!pause){
       if(gameover){
        reset();
       }

       //Xa controlar la imagen d fondo
       bgTimer++;
       if(bgTimer>0){
        bgTimer-=background.height;
       }
       //TIMER xa cambiar las imagenes dinámicamente
       aTimer++;
       if(aTimer>360){
        aTimer-=360;
       }
        
        if(pressing[KEY_RIGHT])
            player.x+=10;
       
        if(pressing[KEY_LEFT])
            player.x-=10;

        // Queremos mantenerlo dentro de la pantalla
        if(player.x>canvas.width-player.width)
            player.x=canvas.width-player.width;        
        if(player.x<0)
            player.x=0;    

        //Disparos de mi nave
        if(lastPress==KEY_SPACE){
            if(multishot==3){
                shots.push(new Rectangle(player.x-3,player.y+2,5,5));
                shots.push(new Rectangle(player.x+3,player.y,5,5));
                shots.push(new Rectangle(player.x+9,player.y+2,5,5));
            }else if(multishot==2){
                shots.push(new Rectangle(player.x,player.y,5,5));
                shots.push(new Rectangle(player.x+5,player.y,5,5));
            }else{
                 shots.push(new Rectangle(player.x+3,player.y,5,5));    
            }
           
            lastPress=null;
        }  

        //Mueve mis disparos.
        for(var i=0,l=shots.length;i<l;i++){
            shots[i].y-=10;
            if(shots[i].y<0){
                shots.splice(i--,1);
                l--;
            }
        }

        //Muevo los mensajes
        for(var i=0,l=messages.length;i<l;i++){
            messages[i].y-=2;
            if(messages[i].y<260){
                    messages.splice(i--,1);
                    l--;
                }
        }
        //Muevo las mejoras
        for(var i=0,l=powerups.length;i<l;i++){
            powerups[i].y+=10;
            if(powerups[i].y>canvas.height){
                powerups.splice(i--,1);
                l--;
                continue;
            }
            if(player.intersects(powerups[i])){
                if(powerups[i].type==1){//Si es de tipo multidisparo
                    if(multishot<3){//Como maximo que tenga +3 de tiro si consigue mas le damos mas puntos
                        multishot++;
                        messages.push(new Message('MULTI',player.x,player.y));
                    }else{
                        score+=5;
                        messages.push(new Message('+5',player.x,player.y));
                    }
                }else{
                    score+=5;
                        messages.push(new Message('+5',player.x,player.y));
                }
                powerups.splice(i--,1);
                l--;
            }
        }
        //Enemigo 2
        eTimer--;
            if(eTimer<0){
                enemies.push(new Rectangle(0,40,10,10,1));
                eTimer=20+random(140);
            }    
        //Enemigo 3
        eTimer2--;
            if(eTimer2<0){
                enemies.push(new Rectangle(random(15)*10,0,10,10,3));
                eTimer2=40+random(440);
            }      
        //Movemos los enemigos 
        for(var i=0;i<enemies.length;i++){
            if (enemies[i].timer>0) {//Quito el timer de los enemigos dañados
                enemies[i].timer--;
            }
             // Shooter
                if(enemies[i].type==1){
                    enemies[i].x+=5;
                    // Shooter Outside Screen
                    if(enemies[i].x>canvas.width){
                        enemies.splice(i--,1);
                        l--;
                        continue;
                    }
                    
                    // Shooter Shots
                    enemies[i].timer--;
                    if(enemies[i].timer<0){
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,0,10));
                        enemies[i].timer=10+random(30);
                    }
                    // Shot Intersects Shooter
                    for(var j=0,ll=shots.length;j<ll;j++){
                        if(shots[j].intersects(enemies[i])){
                            score++;
                            shots.splice(j--,1);
                            ll--;
                            enemies.splice(i--,1);
                            l--;
                        }
                    }
                }
                // EnemyShot
                else if(enemies[i].type==2){
                    enemies[i].x+=enemies[i].vx;
                    enemies[i].y+=enemies[i].vy;
                    // EnemyShot Outside Screen
                    if(enemies[i].x<0||enemies[i].x>canvas.width||enemies[i].y<0||enemies[i].y>canvas.height){
                        enemies.splice(i--,1);
                        l--;
                        continue;
                    }                    
                    // Player Intersects EnemyShot
                    if(player.intersects(enemies[i])&&player.timer<1){
                        player.health--;
                        player.timer=20;
                    }
                }else if(enemies[i].type==3){
                    enemies[i].y+=5;
                    // 8Shooter Outside Screen
                    if(enemies[i].y>canvas.height){
                        enemies.splice(i--,1);
                        l--;
                        continue;
                    }
                    //Genero 8 disparos
                    enemies[i].timer--;
                    if(enemies[i].timer<0){
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,0,10));
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,-7,7));
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,-10,0));
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,-7,-7));
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,0,-10));
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,7,-7));
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,10,0));
                        enemies.push(new Rectangle(enemies[i].x+3,enemies[i].y+5,5,5,2,0,7,7));
                        enemies[i].timer=30+random(30);
                    }
                 if(player.intersects(enemies[i])&&player.timer<1){
                        player.health--;
                        player.timer=20;
                    }
                    
                    // Shot Intersects 8Shooter
                    for(var j=0,ll=shots.length;j<ll;j++){
                        if(shots[j].intersects(enemies[i])){
                            score++;
                            enemies[i].health--;
                            if(enemies[i].health<1){
                                enemies.splice(i--,1);
                                l--;
                            }
                            else
                                enemies[i].timer=1;
                            shots.splice(j--,1);
                            ll--;
                        }
                    }

                }else{
            //Compruebo si los disparos coinciden con los enemigos
            for(var j=0,l=shots.length;j<l;j++){
                if(shots[j].intersects(enemies[i])){
                    score++;
                    enemies[i].health--;
                    if(enemies[i].health<1){
                        enemies[i].x=random(canvas.width/10)*10;
                        enemies[i].y=0;
                        enemies[i].health=2;
                        enemies.push(new Rectangle(random(canvas.width/10)*10,0,10,10,0,2));//Genero otra nave enemiga                    
                    }else{
                        enemies[i].timer=1;//Xa mostrar el efecto de dañado
                    }
                shots.splice(j--,1);//1 xq elimina un elemento del array
                l--;
                }

            }//Fin del for de los shots
            enemies[i].y+=5;//La velocidad a la que bajan las naves
            if(enemies[i].y>canvas.height){//Si llega hasta abajo lo vuelvo a colocar arriba(no lo elimino del array)
                enemies[i].x=random(canvas.width/10)*10;
                enemies[i].y=0;
                enemies[i].health=2;
            }
            if(player.intersects(enemies[i])&&player.timer<1){//Si una nave choca con nosotros
                player.health--;
                player.timer=20;
            }       
            /*
            si el disparo y la nave enemiga están uno enfrente del otro, al siguiente turno el disparo subirá a la posición de la nave,
            y la nave bajará su cuadro correspondiente,
            posteriormente se efectuará el análusis de colisión, pero para entonces, ninguno de los dos objetos estará colisionando:
            leo la colisión de ambos objetos dos veces: una justo antes de mover la nave enemiga, y la otra posterior a dicho movimiento
            */
              for(var j=0,l=shots.length;j<l;j++){
                if(shots[j].intersects(enemies[i])){
                    score++;
                    enemies[i].health--;
                    if(enemies[i].health<1){//Al matar un enemigo
                        var r=random(20);//4/20 mejora de puntos y 1/20 multidisparos
                        if(r<5){
                            if(r==0){
                                powerups.push(new Rectangle(enemies[i].x,enemies[i].y,10,10,1));//Tipo 1 xa multidisparo
                            }
                            else{
                                powerups.push(new Rectangle(enemies[i].x,enemies[i].y,10,10,0));
                            }
                        }
                        enemies[i].x=random(canvas.width/10)*10;
                        enemies[i].y=0;
                        enemies[i].health=2;
                        enemies.push(new Rectangle(random(canvas.width/10)*10,0,10,10,0,2));//Genero otra nave enemiga                    
                    }else{
                        enemies[i].timer=1;//Xa mostrar el efecto de dañado
                    }
                    shots.splice(j--,1);//1 xq elimina un elemento del array
                    l--;
                }
            }    
        }
        }//Fin del for de los enemigos

     //Muevo las estrellas
     for(var i=0;i<stars.length;i++){
        stars[i].y++;
        if(stars[i].y>canvas.height){
            stars[i].y=0;
        }
        stars[i].timer+=10;
        if(stars[i].timer>200){
            stars[i].timer-=200;
        }
     }   
    if(player.health<1){
        gameover=true;
        pause=true;
    }
     if(player.timer>0){
        player.timer--;
    }
}
    // Pause/Unpause
    if(lastPress==KEY_ENTER){
        pause=!pause;
        lastPress=null;
    }
}

function paint(ctx){
 

    ctx.fillStyle='#000';
    // ctx.fillRect(0,0,canvas.width,canvas.height);
       //Pinto las estrellas lo primero de todo para que queden en el fondo
    // ctx.fillStyle='#fff';
    // for(var i=0;i<stars.length;i++){
    //     var c=255-Math.abs(100-stars[i].timer);//La formula para hacer que una animación vaya hacia adelante y hacia atrás,
    //     //consiste primero en restar a la mitad del valor máximo, el temporizador.
    //     ctx.fillStyle='rgb('+c+','+c+','+c+')';
    //     ctx.fillRect(stars[i].x,stars[i].y,1,1);
    // }
    //Pinto el fondo
    if(background.width){
        ctx.drawImage(background,0,bgTimer);
        ctx.drawImage(background,0,background.height+bgTimer);
    }
       
    
    //Pinto mi personaje
    player.drawImageArea(ctx,spritesheet,0+(aTimer%3)*10,0,10,10);
        
    //Pinto los mensajes
    ctx.fillStyle='#fff';
    for(var i=0;i<messages.length;i++){
        ctx.fillText(messages[i].string,messages[i].x,messages[i].y);
    }
    //Pinto los disparos
    ctx.fillStyle='#f00';
    for(var l=0;l<shots.length;l++){
        shots[l].drawImageArea(ctx,spritesheet,70,0+(aTimer%2)*5,5,5);
    }
    //Pinto los enemigos
    for(var i=0;i<enemies.length;i++){
        if(enemies[i].type==0){
            if(enemies[i].timer%2==0){
               // ctx.strokeStyle='#00f';//lo pinto de azul
                enemies[i].drawImageArea(ctx,spritesheet,30,0,10,10);
            }
            else{
                //ctx.strokeStyle='#fff';
                enemies[i].drawImageArea(ctx,spritesheet,40,0,10,10);
            }
        }
        else if(enemies[i].type==1)
                enemies[i].drawImageArea(ctx,spritesheet2,5+(aTimer%2)*10,0,10,10);
            else if(enemies[i].type==2)
                enemies[i].drawImageArea(ctx,spritesheet2,0,(aTimer%2)*5,5,5); 
                else if(enemies[i].type==3){
                if(enemies[i].timer==1)
                    enemies[i].drawImageArea(ctx,spritesheet,120,0,10,10);
                else
                    enemies[i].drawImageArea(ctx,spritesheet,75+(aTimer%2)*10,0,10,10);
            } 
    }
    //Pinto las mejoras
    for(var i=0;i<powerups.length;i++){
        if(powerups[i].type==0){//multidisparo de naranja
            powerups[i].drawImageArea(ctx,spritesheet,50,0,10,10);
        }else{
            powerups[i].drawImageArea(ctx,spritesheet,60,0,10,10);
        }
    }
    //Pinto la puntuación
    ctx.fillStyle='#fff';
    ctx.fillText('Score: '+score,0,20);
    //Pinto la vida
    ctx.fillText('health'+player.health,160,20);
    //ctx.fillText('Last Press: '+lastPress,0,20);
    if(pause){
        ctx.textAlign='center';
        if(gameover)
            ctx.fillText('GAME OVER',100,150);
        else
            ctx.fillText('PAUSE',100,75);
        ctx.textAlign='left';
    }

    
}

//Mientras tengamos pulsado la tecla de dirección se moverá
document.addEventListener('keydown',function(evt){
    lastPress=evt.keyCode;
    pressing[evt.keyCode]=true;
},false);
//Cuando dejemos de pulsar se parará
document.addEventListener('keyup',function(evt){
    pressing[evt.keyCode]=false;
},false);

function Message(string,x,y){
    this.string=(string==null)?'?':string;
    this.x=(x==null)?0:x;
    this.y=(y==null)?0:y;
}

function Star(x,y,timer){
    this.x=(x==null)?0:x;
    this.y=(y==null)?0:y;
    this.timer=(timer==null)?0:timer;
}


function Rectangle(x,y,width,height,type,health,vx,vy){
        this.x=(x==null)?0:x;
        this.y=(y==null)?0:y;
        this.width=(width==null)?0:width;
        this.height=(height==null)?this.width:height;
        this.type=(type==null)?1:type;
        this.health=(health==null)?1:health;
        this.timer=0;
        this.vx=(vx==null)?0:vx;
        this.vy=(vy==null)?0:vy;
    }
//Con prototype añadimos la funcion intersects a la clase Rectangle
    Rectangle.prototype.intersects=function(rect){
        if(rect!=null){
            return(this.x<rect.x+rect.width&&
                this.x+this.width>rect.x&&
                this.y<rect.y+rect.height&&
                this.y+this.height>rect.y);
        }
    }
    //Con prototype añadimos la funcion fill a la clase Rectangle
    Rectangle.prototype.fill=function(ctx){
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }

    Rectangle.prototype.drawImageArea=function(ctx,img,sx,sy,sw,sh){
        if(img.width)
            ctx.drawImage(img,sx,sy,sw,sh,this.x,this.y,this.width,this.height);
        else
            ctx.strokeRect(this.x,this.y,this.width,this.height);
    }

window.requestAnimationFrame=(function(){
    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        function(callback){window.setTimeout(callback,17);};
    })();
})();   