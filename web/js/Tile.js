function Tile(x, y, num, width, height) {
  this.x = x;
  this.y = y;

  const el = document.createElement("div");
  el.className = "tile";
  el.innerHTML = `<div class="inner">${num}</div>`;
  el.style.width = width + "%";
  el.style.height = height + "%";
  el.style.left = x * width + "%";
  el.style.top = y * height + "%";

  this.setPosition = (newX, newY) => {
    this.x = newX;
    this.y = newY;
    el.style.left = newX * width + "%";
    el.style.top = newY * height + "%";
  };

  this.onClick = callback => {
    el.addEventListener("click", callback);
  };

  this.attach = box => {
    box.appendChild(el);
  };
}
