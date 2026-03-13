class FluidSim {
    constructor(MaxP) {
        this.cap = MaxP;
        this.actcap = 0;
        this.r = 5;
        this.grid = [];
        this.rows = 0;
        this.cols = 0;
        this.h = 35;
        this.MaxD = 5.0;
        this.mousR = 10.0;
        this.x = new Float32Array(MaxP);
        this.y = new Float32Array(MaxP);
        this.vx = new Float32Array(MaxP);
        this.vy = new Float32Array(MaxP);
        
        this.ax = new Float32Array(MaxP);
        this.ay = new Float32Array(MaxP);
        this.density = new Float32Array(MaxP);
        this.clorM = []
        for (let i=0;i<=Math.PI;i+=Math.PI/100){
            let r1 = Math.floor(Math.sin(i-Math.PI/10)*255)
            let g1 = Math.floor(Math.sin(i+Math.PI/10)*255)
            let b1 = Math.floor(Math.cos(i)*255)
            this.clorM.push(`rgb(${r1}, ${g1}, ${b1})`);
        }
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
        const MAX_SPEED = 1500;
        const globalDamping = 0.995;
        for (let i=0;i<this.actcap;i++){
            this.vx[i] += this.ax[i] * dt;
            this.vy[i] += this.ay[i] * dt;
            this.vy[i] += g * dt;

            if (this.vx[i] > MAX_SPEED) this.vx[i] = MAX_SPEED;
            if (this.vx[i] < -MAX_SPEED) this.vx[i] = -MAX_SPEED;
            if (this.vy[i] > MAX_SPEED) this.vy[i] = MAX_SPEED;
            if (this.vy[i] < -MAX_SPEED) this.vy[i] = -MAX_SPEED;

            //this.vx[i] *= globalDamping;
            //this.vy[i] *= globalDamping;

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
            // if (isNaN(this.x[i]) || isNaN(this.y[i])) {
            //     this.x[i] = 500; // Reset to center of screen
            //     this.y[i] = 100;
            //     this.vx[i] = 0;
            //     this.vy[i] = 0;
            //     this.ax[i] = 0;
            //     this.ay[i] = 0;
            // }
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
            //if (this.density[i] > this.MaxD) this.density[i] = this.MaxD;
        }
    }



    applyPressure(){
        const targetDensity = 2;
        const stiffness = 900;
        const viscousity = 1;
        for(let i=0;i<this.actcap;i++){
            let pressureI = stiffness * (this.density[i] - targetDensity);
            //if(pressureI<0)pressureI=0;
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

                            if (dsq === 0) {
                            dx = (i - j) * 0.001; 
                            dy = (j - i) * 0.001;
                            dsq = dx * dx + dy * dy;
                            }//

                            if(dsq < this.h*this.h){
                                const dist = Math.sqrt(dsq);
                                const inf = (this.h - dist)/this.h;

                                let pressurej = (this.density[j]-targetDensity) * stiffness;
                                //if(pressurej<0) pressurej=0;
                                const sharedP = (pressureI+pressurej)/2;
                                let Pforce = sharedP*inf*inf;

                                const DirX = dx/dist;
                                const DirY = dy/dist;
                                
                                //if(Pforce>200){Pforce=200};
                                //if(Pforce<-200){Pforce=-200}; MAIN CULPRIT for Non homogeneous fluid sims...

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

    render(ctx,mode){
        if (mode==1){
        const waterd = new Path2D();
        const water2 = new Path2D();
        const water3 = new Path2D();
        const k = 0.4;
        for (let i=0;i<this.actcap;i++){
            let comp = this.density[i]*k;
            let Path = waterd;
            if(comp>1.2) Path = water2;
            if(comp>1.4) Path = water3; 
            Path.moveTo(this.x[i],this.y[i]);
            Path.arc(this.x[i]+this.r,this.y[i],this.r,0,Math.PI*2);
        }
        ctx.fillStyle = "#cad3fc";
        ctx.fill(waterd);    
        ctx.fillStyle = "#667dff";
        ctx.fill(water2);    
        ctx.fillStyle = "#000e4d";
        ctx.fill(water3);
        }
    if (mode==2){
        const maxSpeedc = 1000;
        for(let i=0;i<this.actcap;i++){
            let speed = Math.sqrt(this.vx[i]*this.vx[i] + this.vy[i]*this.vy[i]);
            let r = speed/maxSpeedc;
            if (r>1) r=1;
            let colorIndx = Math.floor(r * 255);
            ctx.fillStyle = this.clorM[colorIndx];
            ctx.beginPath();
            ctx.arc(this.x[i]+this.r,this.y[i],this.r,0,Math.PI*2);
            ctx.fill();
        }
    }
    }
    mouseEvents(md,mx,my,vx,vy,s){
        if(md && s==1){
            for(let i=0;i<10;i++){
                this.spwnP(mx + (Math.random()-0.5)*100, my + (Math.random()-0.5)*100);
            }}
        if(md && s==2){
            const rad2 = 9000;
            const k = 1.5;
            for(let i=0;i<this.actcap;i++){
                let dx = this.x[i] - mx;
                let dy = this.y[i] - my;
                let dist2 = dx*dx + dy*dy;
                if (rad2 > dist2){
                    this.vx[i] += vx*k;
                    this.vy[i] += vy*k;
                }
            }
        }
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

const engine = new FluidSim(50000)
engine.initGrid(w,h);

// const Path2 = new Path2D(); TESTER for if rendering is Ok.
// Path2.moveTo(100,100);
// Path2.arc(100,100,engine.r,0,Math.PI * 2);
// ctx.fillStyle = "rgb(83, 200, 243)";
// ctx.fill(Path2);

let isMd = false;
let mx = 0; my = 0
let pmx = 0; pmy = 0;
let mvx = 0; mvy = 0;
window.addEventListener('mousedown', () => isMd = true);
window.addEventListener('mouseup', () => isMd = false);
window.addEventListener('mousemove', (e) =>{
    const rect = canvas.getBoundingClientRect();
    pmx = mx;
    pmy = my;
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
    mvx = mx - pmx;
    mvy = my - pmy;
});

for (let i=0;i<500;i++){
   engine.spwnP(w/2+(Math.random()-0.5)*300,h/2+(Math.random()-0.5)*300);
}

let lt = performance.now();
//let lt =0;
function updateloop(currenttime){
    let dt = (currenttime-lt)/10000;
    //let dt = 0.016;
    //lt = currenttime;

    if (dt > 0.016){dt = 0.016;}

    //for (let i = 0; i < 500; i++) {
    //    if (engine.actcap < engine.cap) {
    //        // Drop them from the top middle of the screen
    //        engine.spwnP(w/2 + (Math.random() - 0.5) * 1000, h*0.7 + Math.random() * 300);
    //    }
    //} TAP

    // if(isMd){
    //     for(let i=0;i<10;i++){
    //         engine.spwnP(mx + (Math.random()-0.5)*100, my + (Math.random()-0.5)*100);
    //     }
    // }

    engine.mouseEvents(isMd,mx,my,mvx,mvy,2);

    //ctx.clearRect(0,0,w,h);
    let ss = 5;
    for (let s=0; s<ss;s++){
    engine.updateGrid();
    engine.calculateDensity();
    engine.applyPressure();
    engine.update(dt,w,h);}
    ctx.clearRect(0,0,w,h);
    engine.render(ctx,2)
    requestAnimationFrame(updateloop);
}
requestAnimationFrame(updateloop);