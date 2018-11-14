"use strict";

function toMoves(sol) {
  const MOVES = ["Null", "D", "L", "U", "R"];
  return sol.map(m => MOVES[m]);
}

function fromMoves(moves) {
  const DIR = {
    D: 1,
    L: 2,
    U: 3,
    R: 4
  };
  return moves.map(m => DIR[m]);
}

function getPattern(name) {
  const pattern = PATTERNS[name];

  if (!pattern) return null;

  const dir = name.split("-")[1] === "reg";
  const width = PATTERNS[name][0][0].length;
  const height = PATTERNS[name][0].length;

  return {
    name,
    grids: pattern,
    dir,
    width,
    height
  };
}

const root = document.getElementById("board");
// Board
const widthInput = document.getElementById("board-width");
const heightInput = document.getElementById("board-height");
const directionInput = document.getElementById("direction");
const boardBtn = document.getElementById("new-board");
const resetBtn = document.getElementById("reset-board");
const scrambleBtn = document.getElementById("scramble-board");
// Solver
const solveBtn = document.getElementById("solve-btn");
const movesInput = document.getElementById("moves-input");
const applyBtn = document.getElementById("apply-btn");
// Pattern
const patternSelect = document.getElementById("pattern-select");
const setupBtn = document.getElementById("setup-btn");
const selectedPatternText = document.getElementById("selected-pattern");
// Warning
const errorSize = document.getElementById("error-size");
const errorDir = document.getElementById("error-dir");
// Test
const testBtn = document.getElementById("test-btn");

const PATTERNS = {
  "8-reg": [[[1, 2, 3], [4, 5, 6], [7, 8, 0]]],
  "8-rev": [[[0, 1, 2], [3, 4, 5], [6, 7, 8]]],
  "443-reg": [
    [[1, 2, 0, 0], [5, 6, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 3, 4], [0, 0, 7, 8], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [9, 10, 11, 0]]
  ],
  "555-reg": [
    [[1, 2, 3, 0], [5, 6, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 4], [0, 0, 7, 8], [0, 0, 11, 12], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [9, 10, 0, 0], [13, 14, 15, 0]]
  ],
  "555-rev": [
    [[0, 1, 2, 3], [0, 0, 6, 7], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [4, 5, 0, 0], [8, 9, 0, 0], [12, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 10, 11], [0, 13, 14, 15]]
  ],
  "663-reg": [
    [[1, 2, 0, 0], [5, 6, 0, 0], [9, 10, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 3, 4], [0, 0, 7, 8], [0, 0, 11, 12], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [13, 14, 15, 0]]
  ]
};

const testBoards = [
  // 4x4 regular boards
  [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 0, 15]], // 1
  [[1, 2, 3, 4], [5, 6, 8, 12], [9, 10, 7, 0], [13, 14, 11, 15]], // 5
  [[1, 9, 11, 4], [14, 8, 2, 7], [10, 6, 3, 12], [5, 0, 13, 15]], // 36
  [[2, 7, 11, 5], [13, 0, 9, 4], [14, 1, 8, 6], [10, 3, 12, 15]], // 40
  [[9, 5, 8, 13], [7, 11, 1, 2], [12, 4, 6, 0], [10, 14, 15, 3]], // 49
  [[15, 14, 1, 6], [9, 11, 4, 12], [0, 10, 7, 3], [13, 8, 5, 2]], // 52
  // [[5, 6, 13, 4], [10, 0, 12, 14], [11, 8, 9, 2], [15, 7, 3, 1]] // 56
];

let selectedPattern = null;
let board = new Board(3, 3, true);
board.attach(root);

const solver = new Solver("js/worker.js", solverReady);

scrambleBtn.addEventListener("click", () => board.scramble());
resetBtn.addEventListener("click", () => board.reset());

// Make sure the pattern and board match
function validate() {
  const pattern = getPattern(selectedPattern);

  if (!pattern) {
    solveBtn.disabled = !selectedPattern;
  } else {
    const badSize =
      pattern.width !== board.width || pattern.height !== board.height;
    const badDir = pattern.dir !== board.direction;

    errorSize.style.display = badSize ? "block" : "none";
    errorDir.style.display = badDir ? "block" : "none";

    solveBtn.disabled = badSize || badDir || !selectedPattern;
  }
}

function loadNewBoard() {
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  const direction = directionInput.checked;

  board.detach(root);
  board = new Board(width, height, direction);
  board.attach(root);

  validate();
}

boardBtn.addEventListener("click", loadNewBoard);

applyBtn.addEventListener("click", () => {
  const moves = fromMoves(movesInput.value.split(" "));
  board.applyMoves(moves, 100);
});

function solverReady() {
  setupBtn.disabled = false;

  async function setupSolver() {
    const pattern = getPattern(patternSelect.value);
    if (!pattern) return;

    setupBtn.disabled = true;
    solveBtn.disabled = true;
    selectedPatternText.innerHTML = "Loading pattern: " + pattern.name;

    const before = selectedPattern
      ? solver.clean().then(() => Promise.resolve((selectedPattern = null)))
      : Promise.resolve();
    await before.then(() => solver.setup(pattern.grids)).then(() => {
      selectedPattern = patternSelect.value;

      widthInput.value = pattern.width;
      heightInput.value = pattern.height;
      directionInput.checked = pattern.dir;

      setupBtn.disabled = false;
      selectedPatternText.innerHTML = "Selected pattern: " + pattern.name;
      validate();
    });
  }

  setupBtn.addEventListener("click", setupSolver);

  solveBtn.addEventListener("click", () => {
    setupBtn.disabled = true;
    solveBtn.disabled = true;

    const startBoard = board.getNums();

    solver.solve(startBoard).then(solution => {
      movesInput.value = toMoves(solution).join(" ");

      setupBtn.disabled = false;
      solveBtn.disabled = false;
    });
  });

  testBtn.addEventListener("click", async () => {
    setupBtn.disabled = true;
    solveBtn.disabled = true;

    // set board to 4x4 reg
    widthInput.value = 4;
    heightInput.value = 4;
    directionInput.checked = true;
    loadNewBoard();

    // load 555-reg
    patternSelect.value = "555-reg";
    await setupSolver();

    // solve all boards
    for (const b of testBoards) {
      board.setNums(b.flat());

      const startTime = performance.now();
      const solution = await solver.solve(b);
      console.log("Time:", performance.now() - startTime);

      await new Promise(resolve => setTimeout(resolve, 500));
      await board.applyMoves(solution, 50);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Tests complete!");
  });
}
