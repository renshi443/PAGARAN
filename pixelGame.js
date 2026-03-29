// Canvas & Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");

const gameArea = document.getElementById("gameArea");
canvas.width = gameArea.clientWidth;
canvas.height = gameArea.clientHeight;

ctx.imageSmoothingEnabled = false;

// Load player image
const playerImg = new Image();
playerImg.src = "friend.jpg"; // Replace with your JPG

// --- Game Variables ---
const player = {
    x: 50,
    y: canvas.height - 60,
    size: 60,
    dy: 0,
    gravity: 0.8,
    jump: -15
};

const spikes = [];
let score = 0;
let spawnTimer = 0;
let gameOver = false;

// Load settings
let savedSpeed = parseInt(localStorage.getItem("speed")) || 6;
let savedVolume = parseInt(localStorage.getItem("volume")) || 50;
let gameSpeed = savedSpeed;
let maxGameSpeed = 12;

// Background pixels
const bgPixels = [];
for(let i=0;i<100;i++){
    bgPixels.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        size: 2,
        dy: Math.random()*0.5 + 0.2,
        color: ["#ff00cc","#00ffcc","#ffff00"][Math.floor(Math.random()*3)]
    });
}

// Background Music
const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5; // adjust volume 0.0-1.0

// Play music on first interaction
function startMusicOnce() {
    if(bgMusic.paused) bgMusic.play().catch(err => console.log("Music blocked:", err));
    window.removeEventListener("keydown", startMusicOnce);
    canvas.removeEventListener("mousedown", startMusicOnce);
}

window.addEventListener("keydown", startMusicOnce);
canvas.addEventListener("mousedown", startMusicOnce);

// Controls
document.addEventListener("keydown", e => {
    if(gameOver) return;
    if(e.code === "Space" || e.code === "ArrowUp"){
        const groundLevel = canvas.height - 20;
        if(player.y + player.size >= groundLevel) player.dy = player.jump;
    }
});

// Left click to jump
canvas.addEventListener("mousedown", e => {
    if(gameOver) return;
    const groundLevel = canvas.height - 20;
    if(player.y + player.size >= groundLevel) player.dy = player.jump;
});

// Draw Functions
function drawBG(){
    for(let p of bgPixels){
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        p.y += p.dy;
        if(p.y > canvas.height) p.y = 0;
    }
}

function drawGround(){
    const groundHeight = 20;
    const blockSize = 10;
    for(let i=0;i<canvas.width;i+=blockSize){
        for(let j=canvas.height-groundHeight;j<canvas.height;j+=blockSize){
            ctx.fillStyle = (i+j)%20===0 ? "#555555" : "#777777";
            ctx.fillRect(i, j, blockSize, blockSize);
        }
    }
}

function drawPlayer(){
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

function drawSpike(spike){
    const w = spike.type === "double" ? spike.size*2 + 5 : spike.size;
    const h = spike.size;
    const blockSize = 5;

    for(let i=0;i<w;i+=blockSize){
        for(let j=0;j<h;j+=blockSize){
            if(spike.type === "double"){
                ctx.fillStyle = ((i+j)%10===0) ? spike.color : "#880055";
            } else {
                ctx.fillStyle = ((i+j)%10===0) ? spike.color : "#440022";
            }
            ctx.fillRect(spike.x+i, spike.y+j, blockSize, blockSize);
        }
    }
}

// Spawn Obstacles
function spawnSpike(){
    const type = Math.floor(Math.random()*3); 
    const size = 30;

    let spike = {
        x: canvas.width,
        y: canvas.height - size - 20,
        size: size,
        type: ["single","double","tall"][type],
        color: ["#ff00cc","#00ffcc","#ffff00"][Math.floor(Math.random()*3)],
        dy: 0,
        moveDir: 1
    };

    if(Math.random() < 0.3){
        spike.dy = Math.random()*2 + 1;
        spike.moveDir = 1;
    }

    spikes.push(spike);
}

// Update Spikes
function updateSpikes(){
    for(let i=spikes.length-1;i>=0;i--){
        const s = spikes[i];
        s.x -= gameSpeed;

        if(s.dy > 0){
            s.y += s.dy * s.moveDir;
            if(s.y <= 0) s.moveDir = 1;
            if(s.y + s.size >= canvas.height - 20) s.moveDir = -1;
        }

        drawSpike(s);

        let spikeWidth = s.type === "double" ? s.size*2 + 5 : s.size;
        if(player.x < s.x + spikeWidth &&
           player.x + player.size > s.x &&
           player.y < s.y + s.size &&
           player.y + player.size > s.y){
            gameOver = true;
        }

        if(s.x + spikeWidth < 0){
            spikes.splice(i,1);
            score++;
            gameSpeed = Math.min(maxGameSpeed, savedSpeed + Math.floor(score/5));
        }
    }
}

// Death Screen
function drawDeathScreen(){
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const faceSize = 120;
    ctx.drawImage(playerImg, canvas.width/2 - faceSize/2, canvas.height/2 - faceSize/2 - 50, faceSize, faceSize);

    ctx.fillStyle = "#ff0000";
    ctx.font = "48px pixelFont, monospace";
    ctx.textAlign = "center";
    ctx.fillText("GEORGE DIED OH NO!", canvas.width/2, canvas.height/2 + 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "32px pixelFont, monospace";
    ctx.fillText("Final Score: " + score, canvas.width/2, canvas.height/2 + 130);
}

// Reset Game
function resetGame(){
    spikes.length = 0;
    player.y = canvas.height - player.size - 20;
    player.dy = 0;
    score = 0;
    gameSpeed = savedSpeed;
    spawnTimer = 0;
    gameOver = false;
    scoreDisplay.textContent = "Score: 0";
}

// Back / Retry Functions
function backToIntro(){
    window.location.href = "intro.html";
}

function retryGame(){
    resetGame();
}

// Game Loop
function gameLoop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawBG();
    drawGround();

    if(!gameOver){
        player.dy += player.gravity;
        player.y += player.dy;
        if(player.y + player.size > canvas.height - 20){
            player.y = canvas.height - player.size - 20;
            player.dy = 0;
        }

        drawPlayer();
        updateSpikes();

        spawnTimer++;
        if(spawnTimer > 100){
            spawnSpike();
            spawnTimer = 0;
        }

        scoreDisplay.textContent = "Score: " + score;
    } else {
        drawDeathScreen();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();