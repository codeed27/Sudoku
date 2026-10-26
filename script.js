
const board = document.getElementById("board");

let puzzle = [];
let solution = [];
let values = [];
let selected = null;
let mistakes = 0;
let seconds = 0;
let timer;
let finished = false;

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
    const rows = [];
    const stacks = shuffle([0,1,2]);
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

    let positions = shuffle(
        Array.from({ length: 81 }, (_, i) => i)
    );

    // Remove random cells to create the puzzle.
    positions.slice(0, 45).forEach(position => {
        let row = Math.floor(position / 9);
        let col = position % 9;
        puzzle[row][col] = 0;
    });

    values = puzzle.map(row => [...row]);
    mistakes = 0;
    seconds = 0;
    selected = null;
    finished = false;

    document.getElementById("mistakes").textContent = 0;
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("message").textContent =
        "Select an empty cell to begin.";

    clearInterval(timer);
    startTimer();
    drawBoard();
}

function drawBoard() {
    board.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("button");
            cell.className = "cell";
            cell.type = "button";

            if (puzzle[row][col] !== 0) {
                cell.textContent = puzzle[row][col];
                cell.classList.add("fixed");
            } else {
                cell.textContent = values[row][col] || "";
            }

            if (selected &&
                selected.row === row &&
                selected.col === col) {
                cell.classList.add("selected");
            }

            cell.addEventListener("click", () => {
                if (puzzle[row][col] !== 0 || finished) return;

                selected = { row, col };
                drawBoard();
            });

            board.appendChild(cell);
        }
    }
}

function enterNumber(number) {
    if (!selected || finished) {
        document.getElementById("message").textContent =
            "Select an empty cell first.";
        return;
    }

    const row = selected.row;
    const col = selected.col;

    if (number === 0) {
        values[row][col] = 0;
    } else {
        // Count a mistake only when a new incorrect number is entered.
        if (values[row][col] !== number &&
            number !== solution[row][col]) {
            mistakes++;
            document.getElementById("mistakes").textContent = mistakes;
        }

        values[row][col] = number;
    }

    document.getElementById("message").textContent =
        "Keep going. You're doing great!";

    drawBoard();
    checkCompletion();
}

function checkCompletion() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (values[row][col] !== solution[row][col]) {
                return;
            }
        }
    }

    finished = true;
    clearInterval(timer);

    document.getElementById("message").textContent =
        `Puzzle completed! Total mistakes: ${mistakes}`;
}

function resetGame() {
    values = puzzle.map(row => [...row]);
    mistakes = 0;
    seconds = 0;
    selected = null;
    finished = false;

    document.getElementById("mistakes").textContent = 0;
    document.getElementById("timer").textContent = "00:00";
    document.getElementById("message").textContent =
        "Puzzle reset. Start again!";

    clearInterval(timer);
    startTimer();
    drawBoard();
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

    if (event.key === "Backspace" ||
        event.key === "Delete") {
        enterNumber(0);
    }
});

newGame();