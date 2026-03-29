// pixelBg.js
const canvasBg = document.createElement("canvas");
canvasBg.id = "bgCanvas";
document.getElementById("pixelBg").appendChild(canvasBg);
const ctxBg = canvasBg.getContext("2d");

canvasBg.width = window.innerWidth;
canvasBg.height = window.innerHeight;

const pixels = [];
for(let i=0;i<100;i++){
    pixels.push({
        x: Math.random()*canvasBg.width,
        y: Math.random()*canvasBg.height,
        size: 2,
        dy: Math.random()*0.5 + 0.2,
        color: ["#ff00cc","#00ffcc","#ffff00"][Math.floor(Math.random()*3)]
    });
}

function drawBg(){
    ctxBg.clearRect(0,0,canvasBg.width,canvasBg.height);
    for(let p of pixels){
        ctxBg.fillStyle = p.color;
        ctxBg.fillRect(p.x, p.y, p.size, p.size);
        p.y += p.dy;
        if(p.y > canvasBg.height) p.y = 0;
    }
    requestAnimationFrame(drawBg);
}

drawBg();

window.addEventListener("resize", ()=>{
    canvasBg.width = window.innerWidth;
    canvasBg.height = window.innerHeight;
});