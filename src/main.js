kontra.init();
let {initPointer, onPointerDown, pointer, SpriteSheet} = kontra;
//resize canvas to cover the whole aera
let htmlCanvas = document.getElementById("canvas");
htmlCanvas.width = window.innerWidth;
htmlCanvas.height = window.innerHeight;

let canvas = kontra.getCanvas();
let ground = [canvas.width / 1.6, canvas.height - 150];

let sprites = [];//0 is player, 1 is player's arm, others are bullets
let enemyBullets = [];
let enemies = [];
let env = [];
let particles = [];
let preEnv = [];

let armySpeed = 4;
initPointer();

let playerIsAlive = true;
let isOver = false;
let lastBunker = screen.width;

//assets
let playerImg = new Image();
playerImg.src = 'img/player.png';
playerImg.onload = function () {
    let playerSheet = SpriteSheet({
        image: playerImg,
        frameWidth: 24,
        frameHeight: 50,
        animations: {
            // create a named animation: walk
            walk: {
                frames: [0, 1, 2, 3, 2, 1],  // frames 0 through 9
                frameRate: 6
            },
            fly: {
                frames: [1, 2],
                frameRate: 2
            }
        }
    });
    let bombImg = new Image();
    bombImg.src = 'img/bomb.png';
    bombImg.onload = function () {
        let bombSheet = SpriteSheet({
            image: bombImg,
            frameWidth: 80,
            frameHeight: 40,
            animations: {
                fall: {
                    frames: '0..5',
                    frameRate: 5
                }
            }
        });

        let gunnerImg = new Image();
        gunnerImg.src = 'img/bunker.png';
        gunnerImg.onload = function () {


            function animate(sprite, animation) {
                if (sprite.anime !== animation) {
                    sprite.playAnimation(animation);
                    sprite.anime = animation;
                }
            }

            onPointerDown(function () {
                if (player.reloading === 0) {
                    createBullet(pointer.x, pointer.y);
                    player.reloading = 40;
                }
            });


            function createBullet(rx, ry) {
                let Bullet = kontra.Sprite({
                    x: player.x + player.width / 2,
                    y: player.y + player.height / 2,
                    v: 6,
                    q: Math.atan2(ry - player.y - player.height / 2, rx - player.x - player.width / 2),
                    dx: 0,
                    dy: 0,
                    ttl: 300,
                    //throw this away
                    width: 5,
                    height: 5,
                    color: 'blue',
                    force: 7,
                    update() {
                        // for (let i = 0; i < enemies.length; i++) if (this.collidesWith(enemies[i])) enemies[i].ttl = 0;
                        if (this.collidesWith(groundSpr)) this.ttl = 0;
                        this.advance();
                    }
                });
                Bullet.dx = Math.cos(Bullet.q) * Bullet.v;
                Bullet.dy = Math.sin(Bullet.q) * Bullet.v;
                //add force to player
                player.dx -= Math.cos(Bullet.q) * Bullet.force * 0.8;
                player.dy -= Math.sin(Bullet.q) * Bullet.force;
                sprites.push(Bullet);
            }

            function death() {
                playerIsAlive = false;
                player.ttl = 0;
                playerGun.ttl = 0;

                /*
                for(let i = 0;i<enemies.length;i++)enemies[i].dx = 0;
                for(let i = 0;i<preEnv.length;i++)preEnv[i].dx = 0;*/
                for (let i = 0; i < 40; i++) {
                    let r = 2 * Math.random();
                    if (r < 1) r = 2;
                    let j = 1;
                    let dx = Math.floor(Math.random() * r * 2) - r;
                    if (Math.random() > 0.5) j = -1;
                    let blood = kontra.Sprite({
                        x: Math.floor(Math.random() * (player.width - 10)) + player.x + 5,
                        y: Math.floor(Math.random() * (player.height - 10)) + player.y + 5,
                        dx: dx,
                        dy: j * Math.sqrt(r * r - dx * dx),
                        ddy: 0.09,
                        width: 7,
                        height: 7,
                        color: 'red',
                        ttl: 180,
                        update() {
                            if (this.collidesWith(groundSpr)) {
                                this.dy = 0;
                                this.dx = 0;
                                this.ddy = 0;
                            }
                            if (this.ttl === 1) {
                                this.ttl = Infinity;
                                if (!isOver) {
                                    isOver = true;
                                    GameOver();
                                }
                            }
                            this.advance();
                        }
                    });
                    particles.push(blood);
                }
                player.y = 2*canvas.height;
                player.height = 0;
            }

            let ExplosionForce = [5, 10];

            function createExplosion(x, y) {
                //small particles
                for (let i = 0; i < 50; i++) {
                    let r = ExplosionForce[0] * Math.random();
                    if (r < 2) r = ExplosionForce[0];
                    let dx = Math.floor((Math.random() * r * 2)) - r;
                    let dy = 1;
                    if (Math.random() >= 0.5) dy = -1;
                    let red = Math.floor((Math.random() * 105)) + 150;
                    let g = Math.floor((Math.random() * 140));
                    let b = Math.floor((Math.random() * 60));
                    let color = 'rgb(' + red.toString() + ',' + g.toString() + ',' + b.toString() + ')';
                    let small = kontra.Sprite({
                        ttl: 60,
                        x: x,
                        y: y,
                        dx: dx,
                        dy: Math.sqrt(r * r - dx * dx) * dy,
                        color: color,
                        ddy: 0.11,
                        height: 5,
                        width: 5,
                        update() {
                            //AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD Color changing
                            if (this.collidesWith(groundSpr)) this.ttl = 0;
                            this.advance();
                            if (this.collidesWith(player) && playerIsAlive) death();
                        }
                    });
                    particles.push(small);
                }

                //big
                /*
                                                        ADDDDDDDD
                */
            }

            function createBomb(x) {
                let Bomb = kontra.Sprite({
                    height: 40,
                    width: 80,
                    x: x,
                    y: -100,
                    dy: 0,
                    ddy: 0.18,
                    vMax: 9,
                    dx: 0,
                    ttl: 600,
                    animations: bombSheet.animations,
                    update() {
                        this.currentAnimation.update();
                        if (this.dy > this.vMax) {
                            this.ddy = 0;
                            this.dy = this.vMax;
                        }
                        if (this.collidesWith(player)) {
                            this.ttl = 0;
                            createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                        }
                        if (this.collidesWith(groundSpr)) {
                            this.ttl = 0;
                            createExplosion(this.x + this.width / 2, ground[1] - 5);
                        }
                        for (let i = 2; i < sprites.length; i++) if (this.collidesWith(sprites[i])) {
                            sprites[2].ttl = 0;
                            this.ttl = 0;
                            createExplosion(this.x + this.width / 2, this.y + this.height / 2);
                        }
                        this.advance();
                    }
                });

                enemies.push(Bomb);
                Bomb.playAnimation('fall');
            }

            function createEnemyBullet(x, y, rx, ry) {
                let Bullet = kontra.Sprite({
                    x: x,
                    y: y,
                    v: 8,
                    q: Math.atan2(ry - y, rx - x),
                    dx: 0,
                    dy: 0,
                    ttl: 300,
                    //throw this away
                    width: 7,
                    height: 7,
                    color: 'yellow',
                    update(){
                        if(this.collidesWith(player)){
                            this.ttl = 0;
                            death();
                        }
                        this.advance();
                    }
                });
                Bullet.dx = Math.cos(Bullet.q) * Bullet.v;
                Bullet.dy = Math.sin(Bullet.q) * Bullet.v;
                enemyBullets.push(Bullet);
            }

            function createGunner() {
                lastBunker = -200;
                let Gunner = kontra.Sprite({
                    height: 80,
                    width: 160,
                    x: -200,
                    y: ground[1] - 80,
                    dx: armySpeed,
                    ttl: 600,
                    pause: 18,
                    counter: 0,
                    i: 1,
                    image: gunnerImg,
                    update() {
                        if (lastBunker == this.x) lastBunker += this.dx;
                        if (this.counter <= 0) {
                            if (this.i < 3) this.counter = this.pause;
                            else {
                                this.i = 0;
                                this.counter = this.pause * 6;
                            }
                            if (this.x < canvas.width && playerIsAlive) createEnemyBullet(this.x + this.width / 2, this.y + this.height / 2, player.x + player.width / 2, player.y + player.height / 2);
                            this.i += 1;
                        }
                        this.counter -= 1;
                        //  this.i += 1;


                        this.advance();
                    }
                });
                let Gun = kontra.Sprite({
                    height: 10,
                    width: 150,
                    anchor: {x: 0, y: 0.5},
                    x: Gunner.x + Gunner.width / 2,
                    y: Gunner.y + Gunner.height / 2,
                    ttl: 600,
                    dx: armySpeed,
                    color: 'black',
                    update() {
                        if(playerIsAlive)this.rotation = Math.atan2(player.y + player.height / 2 - Gunner.y - Gunner.height / 2, player.x + player.width / 2 - Gunner.x + Gunner.width / 2);
                        this.advance();
                    }
                });
                enemies.push(Gun);
                enemies.push(Gunner);
            }

            function GameOver() {
                alert("lol u dead bro");
                sprites = [];
                sprites.push(player);
                enemies = [];
                player.x = ground[0];
                player.y = ground[1];
            }

            function createGrass(x) {
                //let layers = Math.floor(Math.random())
                /*
                1 tile is 10x10
                so 10 tiles on grass
                 */
                let coloring = []
                for (let i = 0; i < 11; i++) {
                    let row = [];
                    let color = 'rgb(' + Math.floor(Math.random() * i * 10).toString() + ',' + (Math.floor(Math.random() * 155) + 100).toString() + ',' + Math.floor(Math.random() * i * 10).toString() + ')';
                    if (i === 0)color = 'rgb(0,100,0)';
                    if (i === 1)color = 'rgb(10,130,10)';
                    if (i === 2)color = 'rgb(20,160,20)';
                        row.push(color);
                    for (let j = 0; j < 10; j++) {
                        if (Math.random() * (i + 1) <= 0.99) row.push(1);
                        else row.push(0);
                    }
                    coloring.push(row);
                }

                let tile = 10;
                let grass = kontra.Sprite({
                    x: x,
                    y: ground[1],
                    dx: armySpeed,
                    coloring: coloring,
                    ttl: 800,
                    update() {
                        if (this.x === 0) createGrass(-100);
                        this.advance();
                    },
                    render() {
                        for (let i = 0; i < 11; i++) {//vrste
                            this.context.fillStyle = coloring[i][0];
                            for (let j = 0; j < 10; j++) {
                                if (coloring[i][j + 1]) this.context.fillRect(this.x + j * tile, this.y + i * tile, tile, tile);
                            }
                        }
                    }
                });
                preEnv.push(grass);
            }
            for(let i = 0;i*100<canvas.width;i++)createGrass(i*100);

            let groundSpr = kontra.Sprite({
                x: 0,
                y: ground[1],
                height: canvas.height - ground[1],
                width: canvas.width,
                color: '#9f9f9f'
            });
            env.push(groundSpr);
            groundSpr.render();
            let player = kontra.Sprite({
                x: ground[0],
                y: ground[1] - 100,
                dx: 0,
                ddx: 0,
                dy: 0,
                ddy: 0.13,
                g: 0.1, // ordinate axis acceleration
                vMax: 5,
                reloading: 0,
                // anchor: {x: 1, y: 1},
                height: 100,
                width: 48,
                animations: playerSheet.animations,
                anime: 'walk',
                update() {
                    //reload
                    this.currentAnimation.update();
                    if (this.reloading > 0) this.reloading -= 1;

                    //physics
                    //update speed
                    this.dx += this.ddx;
                    //upor
                    this.dx *= 0.98;
                    //check for max speed
                    if (Math.abs(this.dx) > this.vMax) this.dx = Math.sign(this.dx) * this.vMax;
                    //out of bounds for x
                    if (this.x + this.dx > canvas.width - 100) {
                        this.dx = 0;
                        this.x = canvas.width - 100;
                    } else if (this.x + this.dx < 100) {
                        this.dx = 0;
                        this.x = 100;
                    }
                    //move
                    if (this.y + this.height < ground[1]) {
                        this.x += this.dx;
                        animate(this, 'fly');
                    } else animate(this, 'walk');
                    //update vertical speed
                    this.dy += this.ddy;
                    //     if(Math.abs(this.dy) > this.vMax)this.dy = Math.sign(this.dy)*this.vMax;
                    if (this.y + this.height + this.dy >= ground[1]) {
                        this.dy = 0;
                        this.y = ground[1] - this.height;
                    } else if (this.y + this.dy < 100) {
                        this.dy = 0;
                        this.y = 100;
                    } else this.y += this.dy;

                    //collisions are dealt elsewhere
                    /*
                    for (let i = 0; i < enemies.length; i++) {
                        if (this.collidesWith(enemies[i])) GameOver();
                    }*/
                }
            });


//player.render();
            player.playAnimation('walk');
            sprites.push(player);

            let playerGun = new kontra.Sprite({
                color: 'black',
                width: 28,
                height: 4,
                anchor: {x: 1, y: 0.5},
                rotation: 0,
                update() {
                    this.x = player.x + player.width / 2;
                    this.y = player.y + player.height / 2;
                    this.rotation = 3.1416 + Math.atan2(pointer.y - player.y - player.height / 2, pointer.x - player.x - player.width / 2);
                    this.advance();
                }
            });
            sprites.push(playerGun);

            let loop = kontra.GameLoop({
                update() {
                    //chance for a bomb
                    let seed = Math.floor((Math.random() * 1001));
                    if (seed >= 0 && seed <= 7) createBomb(Math.floor((Math.random() * (canvas.width - 50))) + 50)
                    if (seed > 7 && seed <= 10 && lastBunker > canvas.height * 2 / 3) createGunner();
                    sprites = sprites.filter(sprite => sprite.isAlive());
                    enemies = enemies.filter(sprite => sprite.isAlive());
                    enemyBullets = enemyBullets.filter(sprite => sprite.isAlive());
                    particles = particles.filter(sprite => sprite.isAlive());
                    env = env.filter(sprite => sprite.isAlive());
                    preEnv = preEnv.filter(sprite => sprite.isAlive());
                    for (let i = 0; i < env.length; i++) env[i].update();
                    for (let i = 0; i < enemyBullets.length; i++) enemyBullets[i].update();
                    for (let i = 0; i < enemies.length; i++) enemies[i].update();
                    for (let i = 0; i < sprites.length; i++) sprites[i].update();
                    for (let i = 0; i < particles.length; i++) particles[i].update();
                    for (let i = 0; i < preEnv.length; i++) preEnv[i].update();

                },
                render() {
                    for (let i = 0; i < env.length; i++) env[i].render();
                    for (let i = 0; i < enemyBullets.length; i++) enemyBullets[i].render();
                    for (let i = 0; i < enemies.length; i++) enemies[i].render();
                    for (let i = 2; i < sprites.length; i++) sprites[i].render();
                    if (playerGun.isAlive()) sprites[1].render();
                    if (player.isAlive()) sprites[0].render();
                    for (let i = 0; i < particles.length; i++) particles[i].render();
                    for (let i = 0; i < preEnv.length; i++) preEnv[i].render();
                }
            });
//actuallll start


            loop.start();
        };
    };
};