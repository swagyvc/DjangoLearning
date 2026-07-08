const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ===============================
// Canvas
// ===============================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player.groundY = canvas.height - 180;
    if (!player.jumping) player.y = player.groundY;
}

window.addEventListener("resize", resizeCanvas);

// ===============================
// Road
// ===============================

const ROAD_WIDTH = 500;
const LANE_OFFSET = 180;

let lanes = [];

function updateLanes() {
    lanes = [
        canvas.width / 2 - LANE_OFFSET,
        canvas.width / 2,
        canvas.width / 2 + LANE_OFFSET
    ];
}

// ===============================
// Player
// ===============================

const player = {

    lane: 1,
    targetLane: 1,

    width: 60,
    height: 90,

    x: 0,

    y: 0,
    groundY: 0,

    jumping: false,
    velocityY: 0,

    sliding: false,

    speed: 10

};

// ===============================
// Obstacles
// ===============================

const obstacles = [];

const obstacleSpeed = 9;

function spawnObstacle() {

    const lane = Math.floor(Math.random() * 3);

    obstacles.push({

        lane,

        width: 60,
        height: 60,

        y: -80

    });

}

// ===============================
// Timing
// ===============================

let spawnTimer = 0;

let roadOffset = 0;

let gameOver = false;

// ===============================
// Keyboard
// ===============================

document.addEventListener("keydown", (e) => {

    if (gameOver) {

        if (e.key.toLowerCase() === "r") {

            restart();

        }

        return;
    }

    switch (e.key.toLowerCase()) {

        case "arrowleft":
        case "a":

            player.targetLane--;

            break;

        case "arrowright":
        case "d":

            player.targetLane++;

            break;

        case " ":
        case "w":

            jump();

            break;

        case "arrowdown":
        case "s":

            slide();

            break;

    }

    player.targetLane = Math.max(0, Math.min(2, player.targetLane));

});

// ===============================
// Jump
// ===============================

function jump() {

    if (player.jumping) return;

    player.jumping = true;

    player.velocityY = -18;

}

// ===============================
// Slide
// ===============================

function slide() {

    if (player.sliding) return;

    player.sliding = true;

    player.height = 45;

    player.y += 45;

    setTimeout(() => {

        player.height = 90;
        player.y -= 45;

        player.sliding = false;

    }, 500);

}

// ===============================
// Update
// ===============================

function update() {

    if (gameOver) return;

    // Road

    roadOffset += obstacleSpeed;

    if (roadOffset > 80)
        roadOffset = 0;

    // Smooth lane movement

    const targetX = lanes[player.targetLane];

    player.x += (targetX - player.x) * 0.18;

    player.lane = player.targetLane;

    // Jump physics

    if (player.jumping) {

        player.velocityY += 0.9;

        player.y += player.velocityY;

        if (player.y >= player.groundY) {

            player.y = player.groundY;

            player.velocityY = 0;

            player.jumping = false;

        }

    }

    // Spawn obstacles

    spawnTimer++;

    if (spawnTimer > 70) {

        spawnObstacle();

        spawnTimer = 0;

    }

    // Move obstacles

    for (let i = obstacles.length - 1; i >= 0; i--) {

        obstacles[i].y += obstacleSpeed;

        if (obstacles[i].y > canvas.height + 100) {

            obstacles.splice(i, 1);

            continue;

        }

        checkCollision(obstacles[i]);

    }

}

// ===============================
// Collision
// ===============================

function checkCollision(obstacle) {

    const ox = lanes[obstacle.lane] - obstacle.width / 2;

    const px = player.x - player.width / 2;

    if (

        px < ox + obstacle.width &&
        px + player.width > ox &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y

    ) {

        gameOver = true;

    }

}

// ===============================
// Draw Road
// ===============================

function drawRoad() {

    ctx.fillStyle = "#666";

    ctx.fillRect(
        canvas.width / 2 - ROAD_WIDTH / 2,
        0,
        ROAD_WIDTH,
        canvas.height
    );

    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - ROAD_WIDTH / 2, 0);
    ctx.lineTo(canvas.width / 2 - ROAD_WIDTH / 2, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + ROAD_WIDTH / 2, 0);
    ctx.lineTo(canvas.width / 2 + ROAD_WIDTH / 2, canvas.height);
    ctx.stroke();

    for (let y = -40 + roadOffset; y < canvas.height; y += 80) {

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 90, y);
        ctx.lineTo(canvas.width / 2 - 90, y + 40);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 90, y);
        ctx.lineTo(canvas.width / 2 + 90, y + 40);
        ctx.stroke();

    }

}

// ===============================
// Draw Player
// ===============================

function drawPlayer() {

    ctx.fillStyle = "#FFD700";

    ctx.fillRect(
        player.x - player.width / 2,
        player.y,
        player.width,
        player.height
    );

}

// ===============================
// Draw Obstacles
// ===============================

function drawObstacles() {

    ctx.fillStyle = "crimson";

    for (const obstacle of obstacles) {

        ctx.fillRect(
            lanes[obstacle.lane] - obstacle.width / 2,
            obstacle.y,
            obstacle.width,
            obstacle.height
        );

    }

}

// ===============================
// Draw UI
// ===============================

function drawUI() {

    if (!gameOver) return;

    ctx.fillStyle = "rgba(0,0,0,.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "70px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    ctx.font = "30px Arial";
    ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 60);

}

// ===============================
// Restart
// ===============================

function restart() {

    obstacles.length = 0;

    gameOver = false;

    spawnTimer = 0;

    player.targetLane = 1;
    player.x = lanes[1];

    player.y = player.groundY;

}

// ===============================
// Draw
// ===============================

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();

    drawObstacles();

    drawPlayer();

    drawUI();

}

// ===============================
// Loop
// ===============================

function gameLoop() {

    update();

    draw();

    requestAnimationFrame(gameLoop);

}

// ===============================
// Start
// ===============================

resizeCanvas();
updateLanes();

player.x = lanes[1];
player.y = player.groundY;

gameLoop();