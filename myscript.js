class FluidSim {
    constructor(MaxP) {
        this.cap = MaxP;
        this.actcap = 0;
        this.r = 5;
        this.grid = [];
        this.rows = 0;
        this.cols = 0;
        this.h = 25;
        this.x = new Float32Array(MaxP);
        this.y = new Float32Array(MaxP);
        this.vx = new Float32Array(MaxP);
        this.vy = new Float32Array(MaxP);
        
        this.ax = new Float32Array(MaxP);
        this.ay = new Float32Array(MaxP);
    }
    spwnP(x,y){
        if (this.actcap < this.cap){
            let i = this.actcap;
            this.x[i] = x;
            this.y[i] = y;
            this.vx[i] = (Math.random()-0.5)*10;
            this.vy[i] = 0;
            this.actcap++;
        }
    }
    update(dt,w,h){
        let g = 9.8/10;
        let damp = 0.5;
        let friction = 0.3;
        for (let i=0;i<this.actcap;i++){
            //this.vx[i] += this.ax[i] * dt;
            //this.vy[i] += this.ay[i] * dt;
            this.vy[i] -= g * dt;
            this.vx[i];

            this.x[i] += this.vx[i] * dt;
            this.y[i] -= this.vy[i] * dt;

            if (this.x[i] < 0){
                    this.x[i] = 0;
                    this.vx[i] *= -damp;
                    this.vy[i] *= friction;
            } else if (this.x[i] > w - this.r*2) {
                    this.x[i] = w - this.r*2;
                    this.vx[i] *= -damp;
                    this.vy[i] *= friction;
                }
            if (this.y[i] < 0 + this.r){
                    this.y[i] = 0 + this.r;
                    this.vy[i] *= -damp;
                    this.vx[i] *= friction;
            } else if (this.y[i] > h - this.r){
                    this.y[i] = h - this.r;
                    this.vy[i] *= -damp;
                    this.vx[i] *= friction;
                }
        }
    }
    initGrid(w,h){
        this.rows = Math.ceil(w/this.h);
        this.cols = Math.ceil(h/this.h);
        this.grid = Array.from({lenght: this.rows*this.cols}, () => []);
    }
    updateGrid(){
        for (let i=0;i<this.grid.length;i++){
            this.grid[i].length =0;
        }
        for (let i=0;i<this.actcap;i++){
            let c = Math.floor(this.x[i]/this.h);
            let r = Math.floor(this.y[i]/this.h);
            if (c<0) c=0; if (c>this.cols) c= this.cols-1;
            if (r<0) r=0; if (r>this.rows) c= this.rows-1;
            let cellindex = c + (r*this.cols);
            this.grid[cellindex].push(i);
        }
    }
    calculateDensity(){
        for(let i=0;i<this.actcap;i++){
            let currentD = 0;
            const rows = Math.floor(this.x[i]/this.h);
            const cols = Math.floor(this.y[i]/this.h);
        }
    }
    render(ctx){
        const waterc = new Path2D();
        let Path = waterc;
        ctx.fillStyle = "#7991ff";
        for (let i=0;i<this.actcap;i++){
            Path.moveTo(this.x[i],this.y[i]);
            Path.arc(this.x[i]+this.r,this.y[i],this.r,0,Math.PI*2);
        }
        ctx.fill(Path);    
    }
}

const canvas = document.getElementById("FluidCanvas");
const ctx = canvas.getContext("2d");
const container = document.getElementById("Container");
const dpr = window.devicePixelRatio || 1;

let w = container.clientWidth;
let h = container.clientHeight;

canvas.width = w * dpr;
canvas.height = h * dpr;

canvas.style.width = w + "px";
canvas.style.height = h + "px";
ctx.scale(dpr,dpr);

const engine = new FluidSim(5000)
let lt = performance.now();

const Path2 = new Path2D();
Path2.moveTo(100,100);
Path2.arc(100,100,engine.r,0,Math.PI * 2);
ctx.fillStyle = "#53c9f3";
ctx.fill(Path2);

for (let i=0;i<100;i++){
    engine.spwnP(w/2+(Math.random()-0.5)*100,h/2);
}

function updateloop(currenttime){
    let dt = (currenttime-lt)/10000;
    if (dt > 0.5){dt = 0.5;}
    ctx.clearRect(0,0,w,h);
    engine.update(dt,w,h);
    engine.render(ctx)
    requestAnimationFrame(updateloop);
}
requestAnimationFrame(updateloop);