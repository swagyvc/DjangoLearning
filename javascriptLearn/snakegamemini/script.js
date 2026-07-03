// Get canvas and context
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Score display
const scoreText = document.getElementById("score");

// Game settings
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Snake starts with one segment
let snake = [
    { x: 10, y: 10 }
];

// Initial movement (moving right)
let direction = { x: 1, y: 0 };

// Food position
let food = {
    x: 15,
    y: 15
};

// Score
let score = 0;

// ======================
// Main Game Loop
// ======================
function gameLoop() {
    update();
    draw();
}

// Run game every 100 milliseconds
setInterval(gameLoop, 100);

// ======================
// Update Game
// ======================
function update() {

    // Create new head
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Add new head
    snake.unshift(head);

    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {

        score++;
        scoreText.textContent = score;

        createFood();

    } else {

        // Remove tail
        snake.pop();

    }

    checkCollision();

}

// ======================
// Draw Everything
// ======================
function draw() {

    // Clear screen
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawFood();
    drawSnake();

}

// ======================
// Draw Snake
// ======================
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

// ======================
// Draw Food
// ======================
function drawFood() {

    ctx.fillStyle = "red";

    ctx.fillRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize - 2,
        gridSize - 2
    );

}

// ======================
// Create Random Food
// ======================
function createFood() {

    let validPosition = false;

    while (!validPosition) {

        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);

        validPosition = true;

        // Make sure food doesn't appear on snake
        for (let part of snake) {
            if (part.x === food.x && part.y === food.y) {
                validPosition = false;
                break;
            }
        }
    }

}

// ======================
// Keyboard Controls
// ======================
document.addEventListener("keydown", (event) => {

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

// ======================
// Collision Detection
// ======================
function checkCollision() {

    const head = snake[0];

    // Wall collision
    if (
        head.x < 0 ||
        head.x >= tileCount ||
        head.y < 0 ||
        head.y >= tileCount
    ) {
        gameOver();
        return;
    }

    // Snake collision
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

// ======================
// Game Over
// ======================
function gameOver() {

    alert("Game Over!\n\nScore: " + score);

    // Reset snake
    snake = [
        { x: 10, y: 10 }
    ];

    // Reset direction
    direction = {
        x: 1,
        y: 0
    };

    // Reset score
    score = 0;
    scoreText.textContent = score;

    // New food
    createFood();

}