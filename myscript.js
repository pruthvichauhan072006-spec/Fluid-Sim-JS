class FluidSim {
    constructor(MaxP) {
        this.cap = MaxP;
        this.actcap = 0;
        this.r = 1;
        this.grid = [];
        this.rows = 0;
        this.cols = 0;
        this.h = 10;
        this.x = new Float32Array(MaxP);
        this.y = new Float32Array(MaxP);
        this.vx = new Float32Array(MaxP);
        this.vy = new Float32Array(MaxP);
        
        this.ax = new Float32Array(MaxP);
        this.ay = new Float32Array(MaxP);
        this.density = new Float32Array(MaxP);
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
        let g = 98;
        let damp = 0.5;
        let friction = 0.3;
        for (let i=0;i<this.actcap;i++){
            this.vx[i] += this.ax[i] * dt;
            this.vy[i] += this.ay[i] * dt;
            this.vy[i] += g * dt;

            this.x[i] += this.vx[i] * dt;
            this.y[i] += this.vy[i] * dt;

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
        this.cols = Math.ceil(w/this.h);
        this.rows = Math.ceil(h/this.h);
        this.grid = Array.from({ length: this.cols * this.rows }, () => []);
    }

    updateGrid(){
        for (let i=0;i<this.grid.length;i++){
            this.grid[i].length = 0;
        }
        for (let i=0;i<this.actcap;i++){
            let c = Math.floor(this.x[i] / this.h);
            let r = Math.floor(this.y[i] / this.h);
            if (c<0) c=0; if (c>=this.cols) c = this.cols-1;
            if (r<0) r=0; if (r>=this.rows) r = this.rows-1;
            let cellindex = c + ( r * this.cols);
            this.grid[cellindex].push(i);
        }
    }

    calculateDensity(){
        for(let i=0;i<this.actcap;i++){
            let currentD = 0;
            const col = Math.floor(this.x[i]/this.h);
            const row = Math.floor(this.y[i]/this.h);
            for(let dc=-1;dc<=1;dc++){
                for(let dr=-1;dr<=1;dr++){
                    const nc = col + dc;
                    const nr = row + dr;
                    if(nc<0 || nc >=this.cols || nr<0 || nr >=this.rows){continue;}
                    const CellIndex = nc + (nr * this.cols);
                    for (let j of this.grid[CellIndex]){
                        const dx = this.x[j] - this.x[i];
                        const dy = this.y[j] - this.y[i];
                        const dsq = dx*dx + dy*dy;
                        if(dsq<this.h*this.h){
                            const dist = Math.sqrt(dsq);
                            let influence = (this.h-dist)/this.h;
                            currentD += influence*influence;
                        }
                    }
                }
            }
            this.density[i] = currentD+1;
        }
    }



    applyPressure(){
        const targetDensity = 1;
        const stiffness = 900;
        const viscousity = 2;
        for(let i=0;i<this.actcap;i++){
            const pressureI = stiffness * (this.density[i] - targetDensity);
            const cols = Math.floor(this.x[i]/this.h);
            const rows = Math.floor(this.y[i]/this.h);

            let cAx = 0;
            let cAy = 0;

            for (let dr = -1;dr<=1;dr++){
                for(let dc =-1;dc<=1;dc++){
                    const ic = cols + dc;
                    const ir = rows + dr;
                    if( ic < 0 || ic >= this.cols || ir<0 || ir>= this.rows ) continue;
                    const cellIndex = ic + (ir * this.cols);
                    for (let j of this.grid[cellIndex]){
                            if (i === j) continue;
                            let dx = this.x[j] - this.x[i];
                            let dy = this.y[j] - this.y[i];
                            let dsq = (dx * dx) + (dy * dy);

                            // if (dsq === 0) {
                            // dx = (i - j) * 0.001; 
                            // dy = (j - i) * 0.001;
                            // dsq = dx * dx + dy * dy;
                            // }//

                            if(dsq < this.h*this.h){
                                const dist = Math.sqrt(dsq);
                                const inf = (this.h - dist)/this.h;

                                const pressurej = inf*(this.density[j]-targetDensity);
                                const sharedP = (pressureI+pressurej)/2;
                                let Pforce = inf*sharedP*inf;

                                const DirX = dx/dist;
                                const DirY = dy/dist;
                                
                                if(Pforce>200){Pforce=200};
                                if(Pforce<-200){Pforce=-200};

                                cAx -= DirX * Pforce;
                                cAy -= DirY * Pforce;

                                let dvx = this.vx[j] - this.vx[i];
                                let dvy = this.vy[j] - this.vy[i];

                                cAx += dvx * inf * viscousity;
                                cAy += dvy * inf * viscousity;

                            }
                    }
                }
            }
            this.ax[i] = cAx;
            this.ay[i] = cAy;
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
engine.initGrid(w,h);
let lt = performance.now();

const Path2 = new Path2D();
Path2.moveTo(100,100);
Path2.arc(100,100,engine.r,0,Math.PI * 2);
ctx.fillStyle = "#53c9f3";
ctx.fill(Path2);

for (let i=0;i<1000;i++){
    engine.spwnP(w/2+(Math.random()-0.5)*700,h/2+(Math.random()-0.5)*700);
}

function updateloop(currenttime){
    let dt = (currenttime-lt)/10000;
    if (dt > 0.05){dt = 0.05;}
    ctx.clearRect(0,0,w,h);
    engine.updateGrid();
    engine.calculateDensity();
    engine.applyPressure();
    engine.update(dt,w,h);
    engine.render(ctx)
    requestAnimationFrame(updateloop);
}
requestAnimationFrame(updateloop);