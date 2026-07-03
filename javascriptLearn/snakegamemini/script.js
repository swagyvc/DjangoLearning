// Canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Score
const scoreText = document.getElementById("score");

// Settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Snake
let snake = [
    { x: 10, y: 10 }
];

// Initial direction
let direction = {
    x: 1,
    y: 0
};

// Food
let food = {
    x: 15,
    y: 15
};

// Score
let score = 0;

// Create first food
createFood();

// Main game loop
setInterval(gameLoop, 100);

function gameLoop() {
    update();
    draw();
}

// =====================
// Update
// =====================
function update() {

    // New head
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Wrap horizontally
    if (head.x < 0) {
        head.x = tileCount - 1;
    } else if (head.x >= tileCount) {
        head.x = 0;
    }

    // Wrap vertically
    if (head.y < 0) {
        head.y = tileCount - 1;
    } else if (head.y >= tileCount) {
        head.y = 0;
    }

    // Add head
    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {

        score++;
        scoreText.textContent = score;
        createFood();

    } else {

        snake.pop();

    }

    checkCollision();

}

// =====================
// Draw
// =====================
function draw() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFood();
    drawSnake();

}

// =====================
// Draw Snake
// =====================
function drawSnake() {

    ctx.fillStyle = "lime";

    snake.forEach(part => {

        ctx.fillRect(
            part.x * gridSize,
            part.y * gridSize,
            gridSize - 2,
            gridSize - 2
        );

    });

}

// =====================
// Draw Food
// =====================
function drawFood() {

    ctx.fillStyle = "red";

    ctx.fillRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize - 2,
        gridSize - 2
    );

}

// =====================
// Create Food
// =====================
function createFood() {

    let valid = false;

    while (!valid) {

        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);

        valid = true;

        for (let part of snake) {

            if (part.x === food.x && part.y === food.y) {
                valid = false;
                break;
            }

        }

    }

}

// =====================
// Controls
// =====================
document.addEventListener("keydown", function(event) {

    switch (event.key) {

        case "ArrowUp":
            if (direction.y !== 1) {
                direction = { x: 0, y: -1 };
            }
            break;

        case "ArrowDown":
            if (direction.y !== -1) {
                direction = { x: 0, y: 1 };
            }
            break;

        case "ArrowLeft":
            if (direction.x !== 1) {
                direction = { x: -1, y: 0 };
            }
            break;

        case "ArrowRight":
            if (direction.x !== -1) {
                direction = { x: 1, y: 0 };
            }
            break;

    }

});

// =====================
// Self Collision
// =====================
function checkCollision() {

    const head = snake[0];

    for (let i = 1; i < snake.length; i++) {

        if (
            head.x === snake[i].x &&
            head.y === snake[i].y
        ) {

            gameOver();
            return;

        }

    }

}

// =====================
// Game Over
// =====================
function gameOver() {

    alert("Game Over!\nScore: " + score);

    snake = [
        { x: 10, y: 10 }
    ];

    direction = {
        x: 1,
        y: 0
    };

    score = 0;
    scoreText.textContent = score;

    createFood();

}