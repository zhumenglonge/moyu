(function () {
  "use strict";

  var COLS = 22;
  var ROWS = 22;
  var CELL = 20;
  var BASE_INTERVAL = 150;
  var MIN_INTERVAL = 60;

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var lenEl = document.getElementById("len");
  var overlay = document.getElementById("overlay");
  var ovTitle = document.getElementById("ov-title");
  var ovText = document.getElementById("ov-text");
  var ovBtn = document.getElementById("ov-btn");

  var snake, dir, nextDir, food, score, interval, timer, running, dead;

  function reset() {
    snake = [
      { x: 10, y: 11 },
      { x: 9, y: 11 },
      { x: 8, y: 11 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    interval = BASE_INTERVAL;
    dead = false;
    running = false;
    placeFood();
    updateHud();
    draw();
  }

  function updateHud() {
    scoreEl.textContent = score;
    lenEl.textContent = snake.length;
    bestEl.textContent = Moyu.store.best("snake");
  }

  function placeFood() {
    var free = [];
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        var onSnake = snake.some(function (s) { return s.x === x && s.y === y; });
        if (!onSnake) free.push({ x: x, y: y });
      }
    }
    food = free[Math.floor(Math.random() * free.length)];
  }

  function start() {
    if (running || dead) {
      if (dead) reset();
    }
    running = true;
    overlay.style.display = "none";
    clearInterval(timer);
    timer = setInterval(tick, interval);
  }

  function pause(showOverlay, title, text, btnText) {
    running = false;
    clearInterval(timer);
    if (showOverlay) {
      ovTitle.textContent = title;
      ovText.textContent = text;
      ovBtn.textContent = btnText;
      overlay.style.display = "flex";
    }
  }

  function gameOver() {
    dead = true;
    Moyu.store.saveBest("snake", score);
    updateHud();
    pause(true, "游戏结束 🐟", "本局得分 " + score + " · 最高分 " + Moyu.store.best("snake"), "再来一局");
  }

  function tick() {
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return gameOver();
    for (var i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) return gameOver();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      interval = Math.max(MIN_INTERVAL, BASE_INTERVAL - snake.length * 2.5);
      clearInterval(timer);
      timer = setInterval(tick, interval);
      placeFood();
      updateHud();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    ctx.fillStyle = "#161e2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1b2740";
    for (var y = 0; y < ROWS; y++) {
      for (var x = 0; x < COLS; x++) {
        if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // 食物
    ctx.fillStyle = "#ff6b81";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // 蛇身
    for (var j = snake.length - 1; j >= 0; j--) {
      var seg = snake[j];
      var t = j / Math.max(snake.length - 1, 1);
      var r = Math.round(91 + (0) * t);
      var g = Math.round(140 - 60 * t);
      var b = Math.round(255 - 80 * t);
      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      var pad = j === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 5);
      ctx.fill();
    }

    // 眼睛
    var h = snake[0];
    ctx.fillStyle = "#fff";
    var ex = h.x * CELL + CELL / 2 + dir.x * 4;
    var ey = h.y * CELL + CELL / 2 + dir.y * 4;
    var ox = dir.x === 0 ? 4 : 0;
    var oy = dir.y === 0 ? 4 : 0;
    ctx.beginPath();
    ctx.arc(ex - ox, ey - oy, 2.4, 0, Math.PI * 2);
    ctx.arc(ex + ox, ey + oy, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  document.addEventListener("keydown", function (e) {
    var key = e.key.toLowerCase();
    var d = null;
    if (key === "arrowup" || key === "w") d = { x: 0, y: -1 };
    else if (key === "arrowdown" || key === "s") d = { x: 0, y: 1 };
    else if (key === "arrowleft" || key === "a") d = { x: -1, y: 0 };
    else if (key === "arrowright" || key === "d") d = { x: 1, y: 0 };
    if (!d) return;
    e.preventDefault();
    if (!running && !dead) start();
    // 禁止 180 度回头
    if (d.x === -dir.x && d.y === -dir.y) return;
    nextDir = d;
  });

  // 触摸滑动
  var touchStart = null;
  document.addEventListener("touchstart", function (e) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!touchStart) return;
    var dx = e.changedTouches[0].clientX - touchStart.x;
    var dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    var d;
    if (Math.abs(dx) > Math.abs(dy)) d = { x: dx > 0 ? 1 : -1, y: 0 };
    else d = { x: 0, y: dy > 0 ? 1 : -1 };
    if (!running && !dead) start();
    if (d.x === -dir.x && d.y === -dir.y) return;
    nextDir = d;
  }, { passive: true });

  // 老板键暂停/恢复
  var wasRunningBeforeBoss = false;
  document.addEventListener("moyu:boss-on", function () {
    if (running) {
      wasRunningBeforeBoss = true;
      pause(false);
    }
  });
  document.addEventListener("moyu:boss-off", function () {
    if (wasRunningBeforeBoss && !dead) {
      wasRunningBeforeBoss = false;
      start();
    }
  });

  ovBtn.addEventListener("click", start);

  reset();
})();
