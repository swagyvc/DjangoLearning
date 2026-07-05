// ======================================
// Select Elements
// ======================================

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const restartBtn = document.getElementById("restartBtn");
const resetScoreBtn = document.getElementById("resetScoreBtn");

const xScoreText = document.getElementById("xScore");
const oScoreText = document.getElementById("oScore");
const drawScoreText = document.getElementById("drawScore");

// ======================================
// Game Variables
// ======================================

let currentPlayer = "X";
let gameActive = true;

let board = ["", "", "", "", "", "", "", "", ""];

let xScore = 0;
let oScore = 0;
let drawScore = 0;

// ======================================
// Winning Patterns
// ======================================

const winningConditions = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
];

// ======================================
// Event Listeners
// ======================================

cells.forEach(cell => {
    cell.addEventListener("click", handleCellClick);
});

restartBtn.addEventListener("click", restartGame);

resetScoreBtn.addEventListener("click", resetScore);

// ======================================
// Handle Click
// ======================================

function handleCellClick(event) {

    const cell = event.target;
    const index = Number(cell.dataset.index);

    // Ignore occupied cells or finished game
    if (board[index] !== "" || !gameActive) {
        return;
    }

    board[index] = currentPlayer;

    cell.textContent = currentPlayer;
    cell.classList.add("disabled");

    checkWinner();
}

// ======================================
// Check Winner
// ======================================

function checkWinner() {

    let winner = false;

    for (const condition of winningConditions) {

        const [a, b, c] = condition;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            winner = true;

            cells[a].classList.add("winner");
            cells[b].classList.add("winner");
            cells[c].classList.add("winner");

            break;
        }
    }

    if (winner) {

        statusText.textContent = `🎉 Player ${currentPlayer} Wins!`;

        gameActive = false;

        if (currentPlayer === "X") {

            xScore++;

            xScoreText.textContent = xScore;

        } else {

            oScore++;

            oScoreText.textContent = oScore;
        }

        return;
    }

    // Draw

    if (!board.includes("")) {

        statusText.textContent = "🤝 It's a Draw!";

        drawScore++;

        drawScoreText.textContent = drawScore;

        gameActive = false;

        return;
    }

    switchPlayer();
}

// ======================================
// Switch Player
// ======================================

function switchPlayer() {

    currentPlayer = currentPlayer === "X" ? "O" : "X";

    statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

// ======================================
// Restart Board
// ======================================

function restartGame() {

    board = ["", "", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameActive = true;

    statusText.textContent = "Player X's Turn";

    cells.forEach(cell => {

        cell.textContent = "";

        cell.classList.remove("winner");

        cell.classList.remove("disabled");

    });

}

// ======================================
// Reset Scoreboard
// ======================================

function resetScore() {

    xScore = 0;
    oScore = 0;
    drawScore = 0;

    xScoreText.textContent = 0;
    oScoreText.textContent = 0;
    drawScoreText.textContent = 0;

    restartGame();
}