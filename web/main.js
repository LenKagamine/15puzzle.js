function toMoves(sol) {
  const MOVES = ["Null", "D", "L", "U", "R"];
  return sol.map(m => MOVES[m]);
}

function Tile(x, y, num, width, height) {
  this.x = x;
  this.y = y;

  const el = document.createElement("div");
  el.className = "tile";
  el.innerHTML = `<div class="inner">${num}</div>`;
  el.style.width = width + "%";
  el.style.height = height + "%";
  el.style.top = y * width + "%";
  el.style.left = x * height + "%";

  this.setPosition = (newX, newY) => {
    this.x = newX;
    this.y = newY;
    el.style.top = newY * width + "%";
    el.style.left = newX * height + "%";
  };

  this.onClick = callback => {
    el.addEventListener("click", callback);
  };

  this.attach = box => {
    box.appendChild(el);
  };
}

function Board(width, height, direction) {
  const blank = {
    x: direction ? width - 1 : 0,
    y: direction ? height - 1 : 0
  };
  const length = width * height;
  const nums = direction
    ? [...Array(length - 1).keys()].map(i => i + 1).concat(0)
    : [...Array(length).keys()];

  const tileWidth = 100 / width;
  const tileHeight = 100 / height;

  const tiles = nums.reduce((acc, num) => {
    if (num === 0) return acc;
    const index = direction ? num - 1 : num;
    const tile = new Tile(
      index % width,
      0 | (index / width),
      num,
      tileWidth,
      tileHeight
    );

    tile.onClick(() => {
      const { x, y } = tile;
      if (blank.x - 1 === x && blank.y === y) {
        this.moveRight();
      } else if (blank.x + 1 === x && blank.y === y) {
        this.moveLeft();
      } else if (blank.y - 1 === y && blank.x === x) {
        this.moveDown();
      } else if (blank.y + 1 === y && blank.x === x) {
        this.moveUp();
      }
    });

    return {
      ...acc,
      [num]: tile
    };
  }, {});

  this.attach = box => {
    box.innerHTML = "";
    Object.values(tiles).forEach(tile => tile && tile.attach(box));

    document.addEventListener("keydown", e => {
      if (e.code === "KeyW" || e.code === "ArrowUp") this.moveUp();
      if (e.code === "KeyD" || e.code === "ArrowRight") this.moveRight();
      if (e.code === "KeyS" || e.code === "ArrowDown") this.moveDown();
      if (e.code === "KeyA" || e.code === "ArrowLeft") this.moveLeft();
    });
  };

  this.moveUp = () => {
    if (blank.y < height - 1) {
      const blankIndex = blank.y * width + blank.x;
      const tileIndex = blankIndex + width;
      const tileNum = nums[tileIndex];
      tiles[tileNum].setPosition(blank.x, blank.y);
      nums[tileIndex] = 0;
      nums[blankIndex] = tileNum;
      blank.y += 1;
    }
  };

  this.moveRight = () => {
    if (blank.x > 0) {
      const blankIndex = blank.y * width + blank.x;
      const tileIndex = blankIndex - 1;
      const tileNum = nums[tileIndex];
      tiles[tileNum].setPosition(blank.x, blank.y);
      nums[tileIndex] = 0;
      nums[blankIndex] = tileNum;
      blank.x -= 1;
    }
  };

  this.moveDown = () => {
    if (blank.y > 0) {
      const blankIndex = blank.y * width + blank.x;
      const tileIndex = blankIndex - width;
      const tileNum = nums[tileIndex];
      tiles[tileNum].setPosition(blank.x, blank.y);
      nums[tileIndex] = 0;
      nums[blankIndex] = tileNum;
      blank.y -= 1;
    }
  };

  this.moveLeft = () => {
    if (blank.x < width - 1) {
      const blankIndex = blank.y * width + blank.x;
      const tileIndex = blankIndex + 1;
      const tileNum = nums[tileIndex];
      tiles[tileNum].setPosition(blank.x, blank.y);
      nums[tileIndex] = 0;
      nums[blankIndex] = tileNum;
      blank.x += 1;
    }
  };

  this.getNums = () => {
    const chunked = [];
    for (let i = 0, y = 0; y < height; y++, i += width) {
      chunked.push(nums.slice(i, i + width));
    }
    return chunked;
  };

  this.applyMoves = moves => {
    let index = 0;

    const applyMove = () => {
      setTimeout(() => {
        const move = moves[index];

        if (move === 1) this.moveDown();
        else if (move === 2) this.moveLeft();
        else if (move === 3) this.moveUp();
        else if (move === 4) this.moveRight();

        if (++index < moves.length) applyMove();
      }, 500);
    };
    applyMove();
  };
}

const board = new Board(4, 4, true);
board.attach(document.getElementById("root"));

const setupBtn = document.getElementById("setup-btn");
const solveBtn = document.getElementById("solve-btn");

Module.addOnPostRun(() => {
  const database555Reg = [
    [[1, 2, 3, 0], [5, 6, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 4], [0, 0, 7, 8], [0, 0, 11, 12], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [9, 10, 0, 0], [13, 14, 15, 0]]
  ];
  const database8reg = [[[1, 2, 3], [4, 5, 6], [7, 8, 0]]];
  const database8rev = [[[0, 1, 2], [3, 4, 5], [6, 7, 8]]];

  setupBtn.addEventListener("click", () => {
    Module.setup(database555Reg);
    solveBtn.disabled = false;
  });

  solveBtn.addEventListener("click", () => {
    const startBoard = board.getNums();

    const solution = Module.solve(startBoard);

    board.applyMoves(solution);

    // const testBoards = [
    //   [[1, 2, 3, 4], [5, 6, 8, 12], [9, 10, 7, 0], [13, 14, 11, 15]],
    //   [[1, 9, 11, 4], [14, 8, 2, 7], [10, 6, 3, 12], [5, 0, 13, 15]],
    //   [[2, 7, 11, 5], [13, 0, 9, 4], [14, 1, 8, 6], [10, 3, 12, 15]],
    //   [[15, 14, 1, 6], [9, 11, 4, 12], [0, 10, 7, 3], [13, 8, 5, 2]],
    //   [[5, 6, 13, 4], [10, 0, 12, 14], [11, 8, 9, 2], [15, 7, 3, 1]]
    // ];
    //
    // testBoards.forEach(b => {
    //   const startTime = performance.now();
    //   Module.solve(b);
    //   console.log("Time:", performance.now() - startTime);
    // });
  });
});
