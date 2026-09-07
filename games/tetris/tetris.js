(function () {
  "use strict";

  var COLS = 10;
  var ROWS = 20;
  var CELL = 30;

  // 7 种方块：4x4 或 3x3 矩阵定义（每个元素为 [x, y] 偏移）
  var SHAPES = {
    I: { cells: [[0, 1], [1, 1], [2, 1], [3, 1]], size: 4, color: "#4dd0e1" },
    O: { cells: [[1, 0], [2, 0], [1, 1], [2, 1]], size: 4, color: "#ffd24a" },
    T: { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], size: 3, color: "#b45cff" },
    S: { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], size: 3, color: "#3ddc97" },
    Z: { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], size: 3, color: "#ff6b81" },
    J: { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], size: 3, color: "#5b8cff" },
    L: { cells: [[2, 0], [0, 1], [1, 1], [2, 1]], size: 3, color: "#ff8f5b" }
  };
  var KEYS = ["I", "O", "T", "S", "Z", "J", "L"];

  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");
  var nextCanvas = document.getElementById("next");
  var nextCtx = nextCanvas.getContext("2d");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var levelEl = document.getElementById("level");
  var linesEl = document.getElementById("lines");
  var overlay = document.getElementById("overlay");
  var ovTitle = document.getElementById("ov-title");
  var ovText = document.getElementById("ov-text");
  var ovBtn = document.getElementById("ov-btn");
  var pauseBtn = document.getElementById("pause-btn");
  var restartBtn = document.getElementById("restart-btn");

  var grid, cur, next, score, lines, level, over, paused, running;
  var dropTimer = null;
  var dropCount = 0;

  function emptyGrid() {
    var g = [];
    for (var r = 0; r < ROWS; r++) g.push(new Array(COLS).fill(null));
    return g;
  }

  function randomPiece() {
    var k = KEYS[Math.floor(Math.random() * KEYS.length)];
    var s = SHAPES[k];
    return {
      type: k,
      color: s.color,
      size: s.size,
      cells: s.cells.map(function (c) { return { x: c[0], y: c[1] }; }),
      x: Math.floor((COLS - s.size) / 2),
      y: -1
    };
  }

  function collides(piece, ox, oy, cells) {
    var cs = cells || piece.cells;
    for (var i = 0; i < cs.length; i++) {
      var gx = piece.x + cs[i].x + ox;
      var gy = piece.y + cs[i].y + oy;
      if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
      if (gy >= 0 && grid[gy][gx]) return true;
    }
    return false;
  }

  function rotateCells(piece) {
    var n = piece.size;
    return piece.cells.map(function (c) {
      return { x: n - 1 - c.y, y: c.x };
    });
  }

  function spawn() {
    cur = next || randomPiece();
    next = randomPiece();
    if (collides(cur, 0, 0)) {
      gameOver();
    }
  }

  function dropInterval() {
    return Math.max(80, 800 - (level - 1) * 70);
  }

  function lockPiece() {
    var i;
    for (i = 0; i < cur.cells.length; i++) {
      var gx = cur.x + cur.cells[i].x;
      var gy = cur.y + cur.cells[i].y;
      if (gy < 0) {
        gameOver();
        return;
      }
      grid[gy][gx] = cur.color;
    }
    clearLines();
    spawn();
    draw();
  }

  function clearLines() {
    var cleared = 0;
    for (var r = ROWS - 1; r >= 0; r--) {
      var full = true;
      for (var c = 0; c < COLS; c++) {
        if (!grid[r][c]) { full = false; break; }
      }
      if (full) {
        grid.splice(r, 1);
        grid.unshift(new Array(COLS).fill(null));
        cleared++;
        r++; // 重扫当前行（已下移）
      }
    }
    if (cleared > 0) {
      var table = [0, 100, 300, 500, 800];
      score += table[cleared] * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      updateHud();
    }
  }

  function updateHud() {
    scoreEl.textContent = score;
    bestEl.textContent = Moyu.store.best("tetris");
    levelEl.textContent = level;
    linesEl.textContent = lines;
  }

  function gameOver() {
    over = true;
    running = false;
    stopLoop();
    Moyu.store.saveBest("tetris", score);
    updateHud();
    ovTitle.textContent = "游戏结束";
    ovText.textContent = "得分 " + score + " · 消除 " + lines + " 行 · 最高分 " + Moyu.store.best("tetris");
    ovBtn.textContent = "再来一局";
    overlay.style.display = "flex";
  }

  /* ---------- 主循环 ---------- */

  function loop() {
    dropCount++;
    if (dropCount >= 1) {
      dropCount = 0;
      tick();
    }
    if (running) {
      dropTimer = setTimeout(loop, dropInterval());
    }
  }

  function tick() {
    if (collides(cur, 0, 1)) {
      lockPiece();
    } else {
      cur.y++;
    }
    draw();
  }

  function stopLoop() {
    if (dropTimer) {
      clearTimeout(dropTimer);
      dropTimer = null;
    }
  }

  function startLoop() {
    stopLoop();
    dropCount = 0;
    dropTimer = setTimeout(loop, dropInterval());
  }

  /* ---------- 渲染 ---------- */

  function drawCell(px, py, color, alpha) {
    ctx.globalAlpha = alpha === undefined ? 1 : alpha;
    ctx.fillStyle = color;
    ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(px + 1, py + 1, CELL - 2, 4);
  }

  function draw() {
    ctx.fillStyle = "#161e2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 网格线
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (var x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL + 0.5, 0);
      ctx.lineTo(x * CELL + 0.5, canvas.height);
      ctx.stroke();
    }
    for (var y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL + 0.5);
      ctx.lineTo(canvas.width, y * CELL + 0.5);
      ctx.stroke();
    }

    // 已落下的方块
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (grid[r][c]) drawCell(c * CELL, r * CELL, grid[r][c]);
      }
    }

    if (!cur || over) return;

    // 落点投影
    var dist = 0;
    while (!collides(cur, 0, dist + 1)) dist++;
    if (dist > 0) {
      for (var i = 0; i < cur.cells.length; i++) {
        var gx = cur.x + cur.cells[i].x;
        var gy = cur.y + cur.cells[i].y + dist;
        if (gy >= 0) drawCell(gx * CELL, gy * CELL, cur.color, 0.18);
      }
    }

    // 当前方块
    for (var j = 0; j < cur.cells.length; j++) {
      var px = (cur.x + cur.cells[j].x) * CELL;
      var py = (cur.y + cur.cells[j].y) * CELL;
      if (py >= 0) drawCell(px, py, cur.color);
    }

    drawNext();
  }

  function drawNext() {
    nextCtx.fillStyle = "#161e2e";
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!next) return;
    var mini = 18;
    // 计算方块包围盒以居中
    var minX = 9, maxX = 0, minY = 9, maxY = 0;
    next.cells.forEach(function (c) {
      minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x);
      minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y);
    });
    var w = (maxX - minX + 1) * mini;
    var h = (maxY - minY + 1) * mini;
    var ox = (nextCanvas.width - w) / 2;
    var oy = (nextCanvas.height - h) / 2;
    next.cells.forEach(function (c) {
      var px = ox + (c.x - minX) * mini;
      var py = oy + (c.y - minY) * mini;
      nextCtx.fillStyle = next.color;
      nextCtx.fillRect(px + 1, py + 1, mini - 2, mini - 2);
      nextCtx.fillStyle = "rgba(255,255,255,0.18)";
      nextCtx.fillRect(px + 1, py + 1, mini - 2, 3);
    });
  }

  /* ---------- 操作 ---------- */

  function move(dx) {
    if (!playing()) return;
    if (!collides(cur, dx, 0)) {
      cur.x += dx;
      draw();
    }
  }

  function softDrop() {
    if (!playing()) return;
    tick();
    // 软降奖励 1 分/格
    if (running) {
      score += 1;
      updateHud();
    }
  }

  function hardDrop() {
    if (!playing()) return;
    var dist = 0;
    while (!collides(cur, 0, dist + 1)) dist++;
    score += dist * 2;
    cur.y += dist;
    lockPiece();
    updateHud();
  }

  function rotate() {
    if (!playing()) return;
    if (cur.type === "O") return;
    var rotated = rotateCells(cur);
    // 尝试踢墙：原位、左移、右移、上移
    var kicks = [0, -1, 1, -2, 2];
    for (var i = 0; i < kicks.length; i++) {
      if (!collides(cur, kicks[i], 0, rotated)) {
        cur.x += kicks[i];
        cur.cells = rotated;
        draw();
        return;
      }
    }
  }

  function playing() {
    return running && !paused && !over;
  }

  function togglePause(force) {
    if (over || !running) return;
    paused = typeof force === "boolean" ? force : !paused;
    if (paused) {
      stopLoop();
      pauseBtn.textContent = "继续 (P)";
      ovTitle.textContent = "已暂停";
      ovText.textContent = "休息一下，喝口水";
      ovBtn.textContent = "继续";
      overlay.style.display = "flex";
    } else {
      pauseBtn.textContent = "暂停 (P)";
      overlay.style.display = "none";
      startLoop();
    }
  }

  function start() {
    grid = emptyGrid();
    score = 0;
    lines = 0;
    level = 1;
    over = false;
    paused = false;
    next = null;
    spawn();
    running = true;
    updateHud();
    overlay.style.display = "none";
    pauseBtn.textContent = "暂停 (P)";
    draw();
    startLoop();
  }

  /* ---------- 输入 ---------- */

  document.addEventListener("keydown", function (e) {
    var key = e.key.toLowerCase();
    if (key === "p") {
      togglePause();
      return;
    }
    if (key === "arrowleft") { e.preventDefault(); move(-1); }
    else if (key === "arrowright") { e.preventDefault(); move(1); }
    else if (key === "arrowdown") { e.preventDefault(); softDrop(); }
    else if (key === "arrowup" || key === "x") { e.preventDefault(); rotate(); }
    else if (key === " " || e.code === "Space") { e.preventDefault(); hardDrop(); }
  });

  pauseBtn.addEventListener("click", function () { togglePause(); });
  restartBtn.addEventListener("click", start);
  ovBtn.addEventListener("click", function () {
    if (paused) togglePause(false);
    else start();
  });

  // 老板键自动暂停
  document.addEventListener("moyu:boss-on", function () {
    if (playing()) togglePause(true);
  });

  /* ---------- 初始 ---------- */

  grid = emptyGrid();
  score = 0;
  lines = 0;
  level = 1;
  over = false;
  paused = false;
  running = false;
  updateHud();
  draw();
})();
