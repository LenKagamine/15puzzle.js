function Board(width, height, direction) {
  this.width = width;
  this.height = height;
  this.direction = direction;

  let box = null;
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

  const boardEl = document.getElementById('board');

  boardEl.style.borderColor = '#000';

  const tiles = nums.reduce((acc, num) => {
    if (num === 0) return acc;
    const index = direction ? num - 1 : num;
    const tile = new Tile(
      index % width,
      0 | (index / width),
      num,
      tileWidth,
      tileHeight,
      width,
      height,
      direction
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

  this.attach = b => {
    if (box) {
      this.detach();
    }
    box = b;

    box.innerHTML = '';
    Object.values(tiles).forEach(tile => tile && tile.attach(box));

    document.addEventListener('keydown', this.onKeyDown);
  };

  this.onKeyDown = e => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') this.moveUp();
    if (e.code === 'KeyD' || e.code === 'ArrowRight') this.moveRight();
    if (e.code === 'KeyS' || e.code === 'ArrowDown') this.moveDown();
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.moveLeft();
  };

  this.detach = () => {
    document.removeEventListener('keydown', this.onKeyDown);
    box = null;
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

      this.verify();
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

      this.verify();
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

      this.verify();
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

      this.verify();
    }
  };

  this.getNums = () => {
    const chunked = [];
    for (let i = 0, y = 0; y < height; y++, i += width) {
      chunked.push(nums.slice(i, i + width));
    }
    return chunked;
  };

  this.applyMoves = async (moves, delay = 0) => {
    let index = 0;

    for (const move of moves) {
      if (move === 1) this.moveDown();
      else if (move === 2) this.moveLeft();
      else if (move === 3) this.moveUp();
      else if (move === 4) this.moveRight();

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  this.scramble = () => {
    const randomMoves = [0 | (Math.random() * 4 + 1)];
    const moves = { 1: [1, 2, 4], 2: [1, 2, 3], 3: [2, 3, 4], 4: [1, 3, 4] };
    for (let i = 1; i < 500; i++) {
      randomMoves.push(
        moves[randomMoves[randomMoves.length - 1]][0 | (Math.random() * 3)]
      );
    }

    this.applyMoves(randomMoves);
  };

  this.setNums = newNums => {
    // Assumes correct parity and distinct numbers

    for (let i = 0; i < nums.length; i++) {
      const newNum = newNums[i];
      const x = i % width;
      const y = 0 | (i / width);

      nums[i] = newNum;
      if (newNum === 0) {
        blank.x = i % width;
        blank.y = 0 | (i / width);
      } else {
        tiles[newNum].setPosition(x, y);
      }
    }
  };

  this.verify = () => {
    if (nums.some(n => n !== 0 && !tiles[n].correctPos())) {
      boardEl.style.borderColor = '#a00';
    } else {
      boardEl.style.borderColor = '#000';
    }
  };

  this.reset = () => {
    const newNums = direction
      ? [...Array(length - 1).keys()].map(i => i + 1).concat(0)
      : [...Array(length).keys()];
    this.setNums(newNums);
  };
}
