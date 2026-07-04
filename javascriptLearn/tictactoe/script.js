const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let currentPlayer = "X";
let gameActive = true;

let board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];