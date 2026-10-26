
const board = document.getElementById("board");

let puzzle = [];
let solution = [];
let values = [];
let selected = null;
let mistakes = 0;
let seconds = 0;
let timer;
let finished = false;

const MAX_MISTAKES = 5;

const base = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
];

function shuffle(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(item => item.value);
}

function createSolution() {
    const digits = shuffle([1,2,3,4,5,6,7,8,9]);
    const bands = shuffle([0,1,2]);
    const stacks = shuffle([0,1,2]);
    const rows = [];
    const cols = [];

    bands.forEach(band => {
        shuffle([0,1,2]).forEach(row => {
            rows.push(band * 3 + row);
        });
    });

    stacks.forEach(stack => {
        shuffle([0,1,2]).forEach(col => {
            cols.push(stack * 3 + col);
        });
    });

    return rows.map(r =>
        cols.map(c => digits[base[r][c] - 1])
    );
}

function newGame() {
    solution = createSolution();
    puzzle = solution.map(row => [...row]);

    const positions = shuffle(
        Array.from({ length: 81 }, (_, i) => i)
    );

    positions.slice(0, 45).forEach(position => {
        const row = Math.floor(position / 9);
        const col = position % 9;
        puzzle[row][col] = 0;
    });

    values = puzzle.map(row => [...row]);
    mistakes = 0;
    seconds = 0;
    selected = null;
    finished = false;

    document.getElementById("mistakes").textContent = "0";
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("message").textContent =
        "Select an empty cell to begin.";

    document.getElementById("endScreen").classList.remove("show");

    clearInterval(timer);
    startTimer();
    drawBoard();
    updateNumberButtons();
}

function drawBoard() {
    board.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "cell";

            if (puzzle[row][col] !== 0) {
                cell.textContent = puzzle[row][col];
                cell.classList.add("fixed");
            } else {
                cell.textContent = values[row][col] || "";
            }

            if (
                selected &&
                selected.row === row &&
                selected.col === col
            ) {
                cell.classList.add("selected");
            }

            cell.addEventListener("click", () => {
                if (puzzle[row][col] !== 0 || finished) {
                    return;
                }

                selected = { row, col };
                drawBoard();
            });

            board.appendChild(cell);
        }
    }
}

function enterNumber(number) {
    if (finished) return;

    if (!selected) {
        document.getElementById("message").textContent =
            "Select an empty cell first.";
        return;
    }

    const row = selected.row;
    const col = selected.col;

    if (number === 0) {
        values[row][col] = 0;
    } else {
        // Do not count the same unchanged entry twice.
        if (values[row][col] === number) return;

        values[row][col] = number;

        // Count mistakes without showing which entry is wrong.
        if (number !== solution[row][col]) {
            mistakes++;
            document.getElementById("mistakes").textContent = mistakes;

            if (mistakes >= MAX_MISTAKES) {
                drawBoard();
                updateNumberButtons();
                endGame(false);
                return;
            }
        }
    }

    document.getElementById("message").textContent =
        "Keep going. You're doing great!";

    drawBoard();
    updateNumberButtons();
    checkCompletion();
}

function updateNumberButtons() {
    const buttons = document.querySelectorAll(".numbers button");

    buttons.forEach(button => {
        const number = Number(button.textContent.trim().replace("✓", ""));
        if (number < 1 || number > 9) return;

        // Mark a number complete when it appears nine times.
        let count = 0;

        values.forEach(row => {
            row.forEach(value => {
                if (value === number) count++;
            });
        });

        button.classList.toggle("completed", count >= 9);
    });
}

function checkCompletion() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (values[row][col] !== solution[row][col]) {
                return;
            }
        }
    }

    endGame(true);
}

function endGame(won) {
    finished = true;
    clearInterval(timer);

    const screen = document.getElementById("endScreen");
    const title = document.getElementById("endTitle");
    const text = document.getElementById("endText");
    const icon = document.getElementById("endIcon");

    if (won) {
        title.textContent = "PUZZLE COMPLETE!";
        text.textContent =
            `Congratulations! You finished with ${mistakes} mistake${mistakes === 1 ? "" : "s"}.`;
        icon.textContent = "🏆";
        document.getElementById("message").textContent =
            "You completed the Sudoku!";
    } else {
        title.textContent = "GAME OVER";
        text.textContent =
            "You have used all 5 chances. Start a new game to play again.";
        icon.textContent = "✦";
        document.getElementById("message").textContent =
            "Game over. Start a new game to continue.";
    }

    screen.classList.add("show");
}

function resetGame() {
    if (finished) return;

    values = puzzle.map(row => [...row]);
    mistakes = 0;
    seconds = 0;
    selected = null;

    document.getElementById("mistakes").textContent = "0";
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("message").textContent =
        "Puzzle reset. Start again!";

    clearInterval(timer);
    startTimer();
    drawBoard();
    updateNumberButtons();
}

function startTimer() {
    timer = setInterval(() => {
        if (finished) return;

        seconds++;

        const minutes = String(
            Math.floor(seconds / 60)
        ).padStart(2, "0");

        const secs = String(seconds % 60).padStart(2, "0");

        document.getElementById("timer").textContent =
            `${minutes}:${secs}`;
    }, 1000);
}

document.addEventListener("keydown", event => {
    if (/^[1-9]$/.test(event.key)) {
        enterNumber(Number(event.key));
    }

    if (
        event.key === "Backspace" ||
        event.key === "Delete"
    ) {
        enterNumber(0);
    }
});

newGame();

                    
        
    

    
