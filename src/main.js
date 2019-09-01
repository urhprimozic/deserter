kontra.init();
let {initPointer, onPointerDown, pointer} = kontra;
//resize canvas to cover the whole aera
let htmlCanvas = document.getElementById("canvas");
htmlCanvas.width = window.innerWidth;
htmlCanvas.height = window.innerHeight;

let canvas = kontra.getCanvas();
let ground = [canvas.width / 1.6, canvas.height-150];

let sprites = [];
let bombs = [];

initPointer();

onPointerDown(function () {
    if (player.reloading == 0) {
        createBullet(pointer.x, pointer.y);
        player.reloading = 40;
    }
});

function collide(spr1, spr2){
    if(spr1.x<=spr2.x && spr2.x <= spr1.x+spr1.width)
        if(spr1.y<=spr2.y && spr2.y <=spr1.y+ spr1.height)return true;
        return false;
}

function createBullet(rx, ry) {
    let Bullet = kontra.Sprite({
        x: player.x+player.width/2,
        y: player.y+player.height/2,
        v: 4,
        q: Math.atan2(ry - player.y-player.height/2, rx - player.x-player.width/2),
        dx: 0,
        dy: 0,
        ttl: 300,
        //throw this away
        width: 5,
        height: 5,
        color: 'blue',
        force: 7,
    });
    Bullet.dx = Math.cos(Bullet.q ) * Bullet.v;
    Bullet.dy = Math.sin(Bullet.q ) * Bullet.v;
    //add force to player
    player.dx -= Math.cos(Bullet.q) * Bullet.force*0.8;
    player.dy -=Math.sin(Bullet.q) * Bullet.force;
    sprites.push(Bullet);
}

function createBomb(x){
    let Bomb = kontra.Sprite({
        height: 40,
        width: 60,
        color: 'gray',
        x: x,
        y: -100,
        dy: 0,
        ddy: 0.2,
        dx: 0,
        ttl: 600,
        update(){
            this.advance();
            if(collide(this, player)){
                //animate explosion
                GameOver();
            }
        }
    });
    bombs.push(Bomb);
}

function GameOver(){
    alert("lol u dead bro");
    sprites = [];
    sprites.push(player);
    bombs = [];
    player.x = ground[0];
    player.y = ground[1];
}

let player = kontra.Sprite({
    x: ground[0],
    y: ground[1],
    width: 60,
    height: 60,
    color: 'red',
    dx: 0,
    ddx: 0,
    dy: 0,
    ddy: 0.13,
    g: 0.1, // ordinate axis acceleration
    vMax: 5,
    reloading: 0,
    update() {
        //reload
        if (this.reloading > 0)this.reloading -=1;

        //physics
        //update speed
        this.dx+=this.ddx;
        //upor
        this.dx *=0.98;
        //check for max speed
        if(Math.abs(this.dx) > this.vMax)this.dx = Math.sign(this.dx)*this.vMax;
        //out of bounds for x
        if(this.x+this.dx > canvas.width-100){
            this.dx = 0;
            this.x = canvas.width-100;
        }
        else if(this.x+this.dx < 100){
            this.dx = 0;
            this.x = 100;
        }
        //move
         if (this.y < ground[1]-1)this.x+=this.dx;

        //update vertical speed
        this.dy+=this.ddy;
   //     if(Math.abs(this.dy) > this.vMax)this.dy = Math.sign(this.dy)*this.vMax;
        if(this.y + this.dy > ground[1]){
            this.dy =0;
            this.y = ground[1];
        }
        else if(this.y+this.dy < 100){
            this.dy = 0;
            this.y = 100;
        }
        else this.y+=this.dy;
    }
});
player.render();

sprites.push(player);

let loop = kontra.GameLoop({
    update() {
        //chance for a bomb
        let seed =  Math.floor((Math.random() * 1001));
        if(seed >= 0 && seed <= 5)createBomb(Math.floor((Math.random() * (canvas.width-50)))+50)
        for (let i = 0; i < sprites.length; i++) sprites[i].update();
        for(let i = 0; i<bombs.length;i++)bombs[i].update();
        sprites = sprites.filter(sprite => sprite.isAlive());
    },
    render() {
        for (let i = 0; i < sprites.length; i++) sprites[i].render();
        for(let i = 0; i<bombs.length;i++)bombs[i].render();
    }
});
loop.start();
