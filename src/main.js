kontra.init();

//resize canvas to cover the whole aera
let htmlCanvas = document.getElementById("canvas");
htmlCanvas.width = window.innerWidth;
htmlCanvas.height = window.innerHeight;

let canvas = kontra.getCanvas();
let ground = [canvas.width/1.6 , canvas.height/1.6];

let player  = kontra.Sprite({
    x: canvas.width,
    y: ground[1],
    width: 60,
    height: 60,
    color: 'red',
    dx: -0,
    ddx: 0,
    dy: 0,
    ddy: 0,
    g: 0.1,
    dxMax: 10,
    update() {

      //  alert(this.dx);
        if(this.dx > this.dxMax)this.dx=this.dxMax;
        player.advance();
    }
});
player.render();
let loop = kontra.GameLoop({
    update() {
        player.update();
    },
    render() {
        player.render();
    }
});
loop.start();
