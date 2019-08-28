function Tile(x, y, num, width, height, boardWidth, boardHeight, direction) {
  this.x = x;
  this.y = y;

  const inner = document.createElement('div');
  inner.className = 'inner';
  inner.innerHTML = num;

  const size = boardWidth * boardHeight;
  const fontSize = Math.min(Math.max(10 - Math.sqrt(size), 2), 7);
  inner.style.fontSize = fontSize + 'vmin';

  const el = document.createElement('div');
  el.className = 'tile';
  el.appendChild(inner);
  el.style.width = width + '%';
  el.style.height = height + '%';
  el.style.left = x * width + '%';
  el.style.top = y * height + '%';

  this.correctPos = () => {
    if (direction) {
      return num === this.y * boardWidth + this.x + 1;
    }
    return num === this.y * boardWidth + this.x;
  };

  const setColor = () => {
    if (this.correctPos()) {
      inner.style.borderColor = '#000';
    } else {
      inner.style.borderColor = '#a00';
    }
  };

  setColor();

  this.setPosition = (newX, newY) => {
    this.x = newX;
    this.y = newY;
    el.style.left = newX * width + '%';
    el.style.top = newY * height + '%';

    setColor();
  };

  this.onClick = callback => {
    el.addEventListener('click', callback);
  };
  this.attach = box => {
    box.appendChild(el);
  };
}
