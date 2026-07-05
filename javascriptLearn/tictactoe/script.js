// =========================
// Select Elements
// =========================

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const restartBtn = document.getElementById("restartBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const xScoreText = document.getElementById("xScore");
const oScoreText = document.getElementById("oScore");
const drawScoreText = document.getElementById("drawScore");

// =========================
// Load Scores (persistent)
// =========================

let xScore = Number(localStorage.getItem("xScore")) || 0;
let oScore = Number(localStorage.getItem("oScore")) || 0;
let drawScore = Number(localStorage.getItem("drawScore")) || 0;

xScoreText.textContent = xScore;
oScoreText.textContent = oScore;
drawScoreText.textContent = drawScore;

// =========================
// Game State
// =========================

let currentPlayer = "X";
let gameActive = true;

let board = ["", "", "", "", "", "", "", "", ""];

// =========================
// Winning Conditions
// =========================

const winPatterns = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
];

// =========================
// Event Listeners
// =========================

cells.forEach(cell => {
    cell.addEventListener("click", handleClick);
});

restartBtn.addEventListener("click", restartGame);
resetScoreBtn.addEventListener("click", resetScores);

// =========================
// Handle Click
// =========================

function handleClick(e) {

    const cell = e.target;
    const index = Number(cell.dataset.index);

    if (board[index] !== "" || !gameActive) return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add("disabled");

    checkGame();
}

// =========================
// Check Winner / Draw
// =========================

function checkGame() {

    let winner = null;

    for (let pattern of winPatterns) {

        const [a, b, c] = pattern;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            winner = pattern;
            break;
        }
    }

    if (winner) {

        gameActive = false;

        // highlight winning cells
        winner.forEach(i => {
            cells[i].classList.add("winner");
        });

        statusText.textContent = `🎉 Player ${currentPlayer} Wins!`;

        updateScore(currentPlayer);

        setTimeout(restartGame, 2000);

        return;
    }

    // Draw check
    if (!board.includes("")) {

        gameActive = false;

        statusText.textContent = "🤝 It's a Draw!";

        updateScore("draw");

        setTimeout(restartGame, 2000);

        return;
    }

    switchPlayer();
}

// =========================
// Switch Player
// =========================

function switchPlayer() {

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

// =========================
// Update Score
// =========================

function updateScore(result) {

    if (result === "X") {
        xScore++;
        localStorage.setItem("xScore", xScore);
        xScoreText.textContent = xScore;
    }

    else if (result === "O") {
        oScore++;
        localStorage.setItem("oScore", oScore);
        oScoreText.textContent = oScore;
    }

    else {
        drawScore++;
        localStorage.setItem("drawScore", drawScore);
        drawScoreText.textContent = drawScore;
    }
}

// =========================
// Restart Game (new round)
// =========================

function restartGame() {

    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";

    statusText.textContent = "Player X's Turn";

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winner");
        cell.classList.remove("disabled");
    });
}

// =========================
// Reset All Scores
// =========================

function resetScores() {

    xScore = 0;
    oScore = 0;
    drawScore = 0;

    localStorage.setItem("xScore", 0);
    localStorage.setItem("oScore", 0);
    localStorage.setItem("drawScore", 0);

    xScoreText.textContent = 0;
    oScoreText.textContent = 0;
    drawScoreText.textContent = 0;

    restartGame();
}