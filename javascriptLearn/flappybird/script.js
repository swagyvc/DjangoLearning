// =========================
// Select Elements
// =========================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");

// =========================
// Constants
// =========================

const GRAVITY = 0.2;
const FLAP_STRENGTH = -4;
const PIPE_SPEED = 1.5;
const PIPE_GAP = 120;
const PIPE_WIDTH = 60;
const PIPE_SPAWN_INTERVAL = 1800;
const GROUND_HEIGHT = 80;

// =========================
// Load Best Score (persistent)
// =========================

let bestScore = Number(localStorage.getItem("flappyBestScore")) || 0;
bestScoreEl.textContent = bestScore;

// =========================
// Sound (Web Audio API)
// =========================

let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

function playFlapSound() {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
}

function playScoreSound() {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
}

function playHitSound() {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
}

// =========================
// Game State
// =========================

let gameState = "ready";
let score = 0;
let frameCount = 0;
let lastPipeSpawn = 0;
let groundOffset = 0;

const bird = {
    x: 80,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    velocity: 0
};

let pipes = [];

// =========================
// Reset Game
// =========================

function resetGame() {
    gameState = "ready";
    score = 0;
    scoreEl.textContent = score;
    frameCount = 0;
    lastPipeSpawn = 0;
    groundOffset = 0;
    pipes = [];

    bird.x = 80;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
}

// =========================
// Flap / Start
// =========================

function flap() {
    initAudio();

    if (gameState === "ready") {
        gameState = "playing";
        bird.velocity = FLAP_STRENGTH;
        playFlapSound();
        return;
    }

    if (gameState === "playing") {
        bird.velocity = FLAP_STRENGTH;
        playFlapSound();
        return;
    }

    if (gameState === "gameOver") {
        resetGame();
    }
}

// =========================
// Pipe Helpers
// =========================

function spawnPipe() {
    const minTop = 60;
    const maxTop = canvas.height - GROUND_HEIGHT - PIPE_GAP - 60;
    const topHeight = minTop + Math.random() * (maxTop - minTop);

    pipes.push({
        x: canvas.width,
        topHeight,
        passed: false
    });
}

function updatePipes() {
    const now = performance.now();

    if (gameState === "playing" && now - lastPipeSpawn >= PIPE_SPAWN_INTERVAL) {
        spawnPipe();
        lastPipeSpawn = now;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        if (gameState === "playing") {
            pipes[i].x -= PIPE_SPEED;
        }

        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }
}

// =========================
// Update
// =========================

function update() {
    frameCount++;

    if (gameState === "ready") {
        bird.y = canvas.height / 2 + Math.sin(frameCount * 0.05) * 8;
    }

    if (gameState === "playing") {
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;

        groundOffset = (groundOffset + PIPE_SPEED) % 24;
    }

    updatePipes();
    checkCollisions();
    checkScore();
}

// =========================
// Collision Detection
// =========================

function checkCollisions() {
    if (gameState !== "playing") return;

    if (bird.y < 0 || bird.y + bird.height > canvas.height - GROUND_HEIGHT) {
        triggerGameOver();
        return;
    }

    for (const pipe of pipes) {
        const inPipeX = bird.x + bird.width > pipe.x && bird.x < pipe.x + PIPE_WIDTH;

        if (!inPipeX) continue;

        const hitTop = bird.y < pipe.topHeight;
        const hitBottom = bird.y + bird.height > pipe.topHeight + PIPE_GAP;

        if (hitTop || hitBottom) {
            triggerGameOver();
            return;
        }
    }
}

// =========================
// Score
// =========================

function checkScore() {
    if (gameState !== "playing") return;

    for (const pipe of pipes) {
        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
            pipe.passed = true;
            score++;
            scoreEl.textContent = score;
            playScoreSound();
        }
    }
}

// =========================
// Game Over
// =========================

function triggerGameOver() {
    gameState = "gameOver";
    playHitSound();

    if (score > bestScore) {
        bestScore = score;
        bestScoreEl.textContent = bestScore;
        localStorage.setItem("flappyBestScore", bestScore);
    }
}

// =========================
// Draw
// =========================

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#4ec0ca");
    gradient.addColorStop(1, "#87ceeb");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
    const groundY = canvas.height - GROUND_HEIGHT;

    ctx.fillStyle = "#ded895";
    ctx.fillRect(0, groundY, canvas.width, GROUND_HEIGHT);

    ctx.fillStyle = "#73bf2e";
    ctx.fillRect(0, groundY, canvas.width, 20);

    ctx.strokeStyle = "#5a9a24";
    ctx.lineWidth = 2;
    for (let x = -groundOffset; x < canvas.width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, groundY + 20);
        ctx.lineTo(x + 12, groundY + GROUND_HEIGHT);
        ctx.stroke();
    }
}

function drawPipes() {
    for (const pipe of pipes) {
        const bottomY = pipe.topHeight + PIPE_GAP;
        const bottomHeight = canvas.height - GROUND_HEIGHT - bottomY;

        ctx.fillStyle = "#73bf2e";
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);

        ctx.fillStyle = "#5a9a24";
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 24, PIPE_WIDTH + 4, 24);
        ctx.fillRect(pipe.x - 2, bottomY, PIPE_WIDTH + 4, 24);
    }
}

function drawBird() {
    const centerX = bird.x + bird.width / 2;
    const centerY = bird.y + bird.height / 2;
    const rotation = Math.min(Math.max(bird.velocity * 0.05, -0.5), 0.8);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    ctx.fillStyle = "#f7d308";
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(8, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(10, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e86100";
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 10, 4);
    ctx.lineTo(bird.width / 2, 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawOverlay() {
    if (gameState === "ready") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Tap to Start", canvas.width / 2, canvas.height / 2);
        return;
    }

    if (gameState === "gameOver") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = "16px Arial";
        ctx.fillText("Press Space or Click to Restart", canvas.width / 2, canvas.height / 2 + 55);
    }
}

function draw() {
    drawSky();
    drawPipes();
    drawGround();
    drawBird();
    drawOverlay();
}

// =========================
// Game Loop
// =========================

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// =========================
// Event Listeners
// =========================

document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
    }
});

canvas.addEventListener("mousedown", flap);

// =========================
// Init
// =========================

resetGame();
requestAnimationFrame(gameLoop);
