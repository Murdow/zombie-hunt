/*----------------------------------------------------------------------*/
/*-----------------------------MARCH 2015-------------------------------*/
/*----------------------------------------------------------------------*/

/*get canvas from html*/
var gameCanvas = document.getElementById("backgroundCanvas"); 
var ctxBackground = gameCanvas.getContext('2d'); 

var heroCanvas = document.getElementById("heroCanvas"); 
var ctxHero = heroCanvas.getContext('2d'); 

var enemyCanvas = document.getElementById("enemyCanvas"); 
var ctxEnemy = enemyCanvas.getContext('2d'); 

var canvasHUD = document.getElementById("canvasHUD"); 
var ctxHUD = canvasHUD.getContext('2d');

var backgroundImg = new Image(); 
backgroundImg.src = 'Images/background.png';

var heroImg = new Image();
heroImg.src = 'Images/hero.png';

var enemyImg = new Image();
enemyImg.src = 'Images/ZombieGirl.png';

var bulletImg = new Image();
bulletImg.src = 'Images/Bullet.png';

var bloodImg = new Image();
bloodImg.src = 'Images/blood.png';

var menuScreen = new Image();
menuScreen.src = 'Images/MenuScreen.png';

var hud = new Image();
hud.src = 'Images/HUD.png';

backgroundImg.addEventListener('load',Init,false);

var canvasWidth = backgroundCanvas.width;
var canvasHeight = backgroundCanvas.height;

var isPlaying = false;

var requestAnimFrame = window.requestAnimationFrame || 
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.msRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       function(callback){
                           window.setTimeout(callback,1000 / 60);
                       };
var player;

//enemies
var spawnInterval;
var enemies;
var spawnRate = 2000;
var spawnAmount = 2;

var bullets;
var bullet = new Bullet();
var bloodList;
//menu
var isMenu = true;
var mouseX = 0;
var mouseY = 0;

//score
ctxHUD.fillStyle = "hsla(0,0%,0%,1)"; //transparencia
ctxHUD.font = "bold 20px Arial";

/*MAIN FUNCTIONS*/
function Init()
{
    DrawMenu();   
    document.addEventListener('click',PlayButton,false);
}

function gameLoop()
{
    if(isPlaying)
    {
        clearScreen();
        player.Draw();
        drawAllEnemies();
        moveAllBullets();
        DrawBlood();    
        updateHUD();   
        player.HeroCollision();
        requestAnimFrame(gameLoop);
    }
}

function startGameLoop()
{
    isPlaying = true;
    gameLoop();
    startSpawningEnemies();
}
function stopGameLoop()
{
    isPlaying = false;
    stopSpawningEnemies();
}

function DrawBg()
{		
	ctxBackground.drawImage(backgroundImg, 0, 0);
}

function updateHUD()
{
    ctxHUD.clearRect(0,0,canvasWidth,canvasHeight);    
    ctxHUD.drawImage(hud, 0, 0);
    ctxHUD.fillText("Zombies Killed: " + player.score, 450,canvasHeight - 27);    
}
function clearScreen(){
    ctxEnemy.clearRect(0,0,canvasWidth,canvasHeight);
    ctxHero.clearRect(0,0,canvasWidth,canvasHeight); 
    ctxHUD.clearRect(0,0,canvasWidth,canvasHeight);
}
//....



//HERO OBJECT
function Hero()
{
    this.playerPosX = (canvasWidth / 2);
    this.playerPosY = (canvasHeight / 2);
    this.heroWidth = 27;
    this.heroHeight = 35;
    this.moveSpeed = 2;
    this.isUpKey = false;
    this.isDownKey = false;
    this.isRightKey = false;
    this.isLeftKey = false; 
    this.score = 0;
}

Hero.prototype.Draw = function() 
{     
     this.Move();     
     ctxHero.drawImage(heroImg, this.playerPosX, this.playerPosY);    
};
Hero.prototype.Move = function() 
{
     if(this.isUpKey && this.playerPosY > 0)
     {
           this.playerPosY -= this.moveSpeed;  
     }
     if(this.isDownKey && (this.playerPosY + this.heroHeight) < canvasHeight)
     {
           this.playerPosY += this.moveSpeed;  
     }
     if(this.isLeftKey && this.playerPosX > 0)
     {
           this.playerPosX -= this.moveSpeed;  
     }
     if(this.isRightKey && (this.playerPosX + this.heroWidth) < canvasWidth)
     {
           this.playerPosX += this.moveSpeed;  
     }
};
Hero.prototype.HeroCollision = function()
{
    for(var i = 0; i < enemies.length; i++)
    {
        if(this.playerPosX >= enemies[i].enemyPosX && this.playerPosX <= enemies[i].enemyPosX + enemies[i].enemyWidth &&
           this.playerPosY <= enemies[i].enemyPosY + enemies[i].enemyHeight  && this.playerPosY >= enemies[i].enemyPosY ||
           this.playerPosX + this.heroWidth >= enemies[i].enemyPosX && this.playerPosX + this.heroWidth <= enemies[i].enemyPosX + enemies[i].enemyWidth &&
           this.playerPosY <= enemies[i].enemyPosY + enemies[i].enemyHeight && this.playerPosY >= enemies[i].enemyPosY)
        {          
                isPlaying = false;
                isMenu = true;
                clearScreen();
                DrawMenu();
            
        }
    }
};
//end hero obj....



//BULLET OBJECT
function Bullet()
{
    this.bulletPosX;
    this.bulletPosY; 
    this.bulletSpeed = 2;
    this.isShooting = false;
    this.bullets = [];
    this.currentBullet = 0;
    
}
Bullet.prototype.Draw = function()
{    
    ctxHero.drawImage(bulletImg,this.bulletPosX,this.bulletPosY);
};
Bullet.prototype.BulletMove = function()
{
    this.bulletPosY -= this.bulletSpeed;
    this.CheckBulletStatus();
    this.isCollision();
    this.Draw();
};
Bullet.prototype.Trigger = function()
{   
    bullet = new Bullet();
    bullet.bulletPosX = player.playerPosX;
    bullet.bulletPosY = player.playerPosY;
    bullets.push(bullet);    
};
function moveAllBullets()
{
    for(var i = 0; i < bullets.length; i++)
    {
            bullets[i].BulletMove();
    }
}
Bullet.prototype.CheckBulletStatus = function()
{
    if(this.bulletPosY < 0)
        this.DestroyBullets();
    
};
Bullet.prototype.DestroyBullets = function()
{
    bullets.splice(bullets.indexOf(this),1);    
};
Bullet.prototype.isCollision = function()
{
    for(var i = 0; i < enemies.length; i++)
    {
        if(this.bulletPosX >= enemies[i].enemyPosX && this.bulletPosX <= enemies[i].enemyPosX + enemies[i].enemyWidth &&
           this.bulletPosY <= enemies[i].enemyPosY + enemies[i].enemyHeight)
       {
           createBlood(enemies[i].enemyPosX,enemies[i].enemyPosY);
           enemies[i].destroyEnemies();
           this.DestroyBullets();
           updateScore();
       }
    }
};
function updateScore()
{
    player.score += 1;
    updateHUD();
}
//End bullet obj....



//INPUT
function checkKeyDown(e)
{
    //e.keyCode e e.which pega o valor numerico da tecla, não precisa d ambos mas alguns browsers podem n reconhcer algum deles
    var keyID = e.keyCode || e.which;
    
    if(keyID === 38 || keyID === 87) //up arrow or W
    {        
        player.isUpKey = true;
            e.preventDefault(); // impede q as setas deem scroll na pagina
    }
    if(keyID === 39 || keyID === 68) //right arrow or D
    {
        player.isRightKey = true;
            e.preventDefault(); 
    }
    if(keyID === 40 || keyID === 83) //down arrow or S
    {
        player.isDownKey = true;
            e.preventDefault(); 
    }
    if(keyID === 37 || keyID === 65) //left arrow or A
    {
        player.isLeftKey = true;
            e.preventDefault(); 
    }
    if(keyID === 32) //spacebar
    {
        bullet.Trigger();
            e.preventDefault(); 
    }
    //console.log(keyID);
}
function checkKeyUp(e)
{
    var keyID = e.keyCode || e.which;
    if(keyID === 38 || keyID === 87) 
    {
        player.isUpKey = false;
            e.preventDefault(); // impede q as setas deem scroll na pagina
    }
    if(keyID === 39 || keyID === 68) 
    {
        player.isRightKey = false;
            e.preventDefault(); 
    }
    if(keyID === 40 || keyID === 83) 
    {
         player.isDownKey = false;
            e.preventDefault(); 
    }
    if(keyID === 37 || keyID === 65) 
    {
         player.isLeftKey = false;
            e.preventDefault(); 
    }    
}
//End input....





//ENEMY OBJECT
function Enemy()
{
    this.enemyPosX = Math.floor(Math.random() * (canvasWidth - 30));//Math.florr converte o numero p/ int
    this.enemyPosY = Math.floor(Math.random() * -canvasHeight);
    this.moveSpeed = 0.9;    
    this.enemyWidth = 23;
    this.enemyHeight = 30;
}
Enemy.prototype.Draw = function() 
{        
     ctxEnemy.drawImage(enemyImg, this.enemyPosX, this.enemyPosY);     
};
Enemy.prototype.EnemyMove = function()
{
    this.enemyPosY += this.moveSpeed; 
    this.checkEnemiesStatus();
    this.Draw();
};
function drawAllEnemies()
{    
    for(var i = 0; i < enemies.length;i++)
    {        
        enemies[i].EnemyMove();
    }
}

function spawnEnemy(enemiesNumber)
{
    for(var i = 0; i < enemiesNumber ; i++)
    {
           enemies[enemies.length] = new Enemy();           
    }
}
function startSpawningEnemies()
{
    stopSpawningEnemies();
    spawnInterval = setInterval(function() {spawnEnemy(spawnAmount);}, spawnRate);
}
function stopSpawningEnemies()
{
    clearInterval(spawnInterval);
}
Enemy.prototype.checkEnemiesStatus = function()
{
    if(this.enemyPosY > canvasHeight)
        this.destroyEnemies();
};
Enemy.prototype.destroyEnemies = function()
{
    enemies.splice(enemies.indexOf(this),1);
};
//End enemy obj....



//BLOOD OBJECT
function Blood()
{
    this.bloodPosX;
    this.bloodPosY;
    this.bloodWidth = 24;
    this.bloodHeight = 16;
}

function createBlood(x,y)
{
    blood = new Blood();
    blood.bloodPosX = x;
    blood.bloodPosY = y;
    bloodList.push(blood);
}
function DrawBlood()
{
    for(var i = 0; i < bloodList.length; i++)
    {
           ctxBackground.drawImage(bloodImg, bloodList[i].bloodPosX, bloodList[i].bloodPosY);     
    }
}
//End blood obj....



//MENU
function BtnPlay()
{
    this.btnPosX = 470;
    this.btnPosY = 300;
    this.btnWidth = 80;
    this.btnHeight = 50;
}
BtnPlay.prototype.CheckClick = function()
{
    if(mouseX >= this.btnPosX && mouseX <= this.btnPosX + this.btnWidth &&
       mouseY >= this.btnPosY && mouseY <= this.btnPosY + this.btnHeight &&
       isMenu)
    {
            isMenu = false;
            return true;
    }
};
function DrawMenu()
{
    	ctxBackground.drawImage(menuScreen, 0, 0);
}
function PlayGame()
{
    player = new Hero();
    enemies = new Array();
    bullets = new Array();
    bloodList = new Array();
    DrawBg();	    
    startGameLoop();    
    document.addEventListener('keydown',checkKeyDown,false);
    document.addEventListener('keyup',checkKeyUp,false);
    updateHUD();
}
function PlayButton(e)
{
    mouseX = e.pageX - gameCanvas.offsetLeft;
    mouseY = e.pageY - gameCanvas.offsetTop;
    btnPlay = new BtnPlay();
    if(btnPlay.CheckClick())
        PlayGame();
}