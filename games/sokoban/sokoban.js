(function () {
  "use strict";

  /* # 墙  空格 地板  . 目标  $ 箱子  * 箱子在目标上  @ 玩家  + 玩家在目标上 */
  var LEVELS = [
    [
      "#######",
      "#     #",
      "# @$. #",
      "#     #",
      "#######"
    ],
    [
      "#######",
      "#     #",
      "#  @  #",
      "#  $  #",
      "#  .  #",
      "#     #",
      "#######"
    ],
    [
      "########",
      "#      #",
      "# .$@$.#",
      "#      #",
      "########"
    ],
    [
      "########",
      "#  #   #",
      "#  $ . #",
      "#@ $ . #",
      "#  #   #",
      "########"
    ],
    [
      "########",
      "#      #",
      "#  # # #",
      "# .  $.#",
      "#  #   #",
      "# @  $ #",
      "#      #",
      "########"
    ],
    [
      "########",
      "#      #",
      "# ## . #",
      "# #  $ #",
      "# @ $  #",
      "#    . #",
      "########"
    ],
    [
      "#########",
      "#       #",
      "# $$  . #",
      "#  $ .. #",
      "#@      #",
      "#########"
    ],
    [
      "#########",
      "#   #   #",
      "# $ . $ #",
      "#   #   #",
      "## ### ##",
      "#   @   #",
      "#   .   #",
      "#########"
    ],
    [
      "########",
      "#.    .#",
      "# $  $ #",
      "# $  $ #",
      "#  @   #",
      "#.    .#",
      "########"
    ],
    [
      "##########",
      "#   ...  #",
      "#   ###  #",
      "# $ $ $ @#",
      "#        #",
      "##########"
    ]
  ];

  var boardEl = document.getElementById("board");
  var levelEl = document.getElementById("level");
  var movesEl = document.getElementById("moves");
  var solvedEl = document.getElementById("solved");
  var overlay = document.getElementById("overlay");
  var ovTitle = document.getElementById("ov-title");
  var ovText = document.getElementById("ov-text");
  var ovBtn = document.getElementById("ov-btn");

  var levelIndex = 0;
  var walls, goals, boxes, player;
  var rows, cols;
  var moves = 0;
  var undoStack = [];

  function parseLevel(index) {
    var raw = LEVELS[index];
    walls = [];
    goals = [];
    boxes = [];
    rows = raw.length;
    cols = 0;
    for (var r = 0; r < raw.length; r++) {
      cols = Math.max(cols, raw[r].length);
    }
    for (var rr = 0; rr < rows; rr++) {
      walls.push([]);
      goals.push([]);
      for (var cc = 0; cc < cols; cc++) {
        walls[rr][cc] = false;
        goals[rr][cc] = false;
        var ch = raw[rr][cc] || " ";
        if (ch === "#") walls[rr][cc] = true;
        if (ch === "." || ch === "*" || ch === "+") goals[rr][cc] = true;
        if (ch === "$" || ch === "*") boxes.push({ r: rr, c: cc });
        if (ch === "@" || ch === "+") player = { r: rr, c: cc };
      }
    }
    moves = 0;
    undoStack = [];
  }

  function render() {
    boardEl.innerHTML = "";
    boardEl.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    var cellSize = Math.max(24, Math.min(46, Math.floor(340 / cols)));
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var cell = document.createElement("div");
        var isBox = boxes.some(function (b) { return b.r === r && b.c === c; });
        var isGoal = goals[r][c];
        var isPlayer = player.r === r && player.c === c;

        if (walls[r][c]) {
          cell.className = "soko-cell soko-wall";
        } else if (isBox) {
          cell.className = "soko-cell soko-box" + (isGoal ? " soko-box-done" : "");
          cell.textContent = "📦";
        } else if (isPlayer) {
          cell.className = "soko-cell soko-floor";
          cell.textContent = "🧑";
        } else if (isGoal) {
          cell.className = "soko-cell soko-goal";
          cell.textContent = "◇";
        } else {
          cell.className = "soko-cell soko-floor";
        }
        cell.style.width = cellSize + "px";
        cell.style.height = cellSize + "px";
        boardEl.appendChild(cell);
      }
    }
    levelEl.textContent = levelIndex + 1;
    movesEl.textContent = moves;
    solvedEl.textContent = Moyu.store.get("sokoban.solved", 0);
  }

  function isWall(r, c) { return r < 0 || r >= rows || c < 0 || c >= cols || walls[r][c]; }
  function boxAt(r, c) {
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i].r === r && boxes[i].c === c) return boxes[i];
    }
    return null;
  }

  function tryMove(dr, dc) {
    if (!overlayHidden()) return;
    var nr = player.r + dr;
    var nc = player.c + dc;
    if (isWall(nr, nc)) return;
    var box = boxAt(nr, nc);
    var entry = { player: { r: player.r, c: player.c }, boxFinal: null };
    if (box) {
      var br = nr + dr;
      var bc = nc + dc;
      if (isWall(br, bc) || boxAt(br, bc)) return;
      box.r = br;
      box.c = bc;
      entry.boxFinal = { r: br, c: bc };
    }
    player.r = nr;
    player.c = nc;
    undoStack.push(entry);
    moves++;
    render();
    checkWin();
  }

  function overlayHidden() { return overlay.style.display === "none" || !overlay.style.display; }

  function undo() {
    if (!undoStack.length || !overlayHidden()) return;
    var last = undoStack.pop();
    if (last.boxFinal) {
      var b = boxAt(last.boxFinal.r, last.boxFinal.c);
      if (b) {
        b.r = player.r;
        b.c = player.c;
      }
    }
    player.r = last.player.r;
    player.c = last.player.c;
    moves = Math.max(0, moves - 1);
    render();
  }

  function checkWin() {
    var all = boxes.every(function (b) { return goals[b.r][b.c]; });
    if (!all) return;
    var solved = Moyu.store.get("sokoban.solved", 0);
    Moyu.store.set("sokoban.solved", Math.max(solved, levelIndex + 1));
    solvedEl.textContent = Math.max(solved, levelIndex + 1);

    var isLast = levelIndex === LEVELS.length - 1;
    var allDone = Math.max(solved, levelIndex + 1) >= LEVELS.length;
    if (isLast) {
      ovTitle.textContent = "全部通关 🏆";
      ovText.textContent = "10 关全部完成！共 " + LEVELS.length + " 关，你已称王。点击从头再玩。";
      ovBtn.textContent = "回到第 1 关";
    } else {
      ovTitle.textContent = "过关！🎉";
      ovText.textContent = "用了 " + moves + " 步。";
      ovBtn.textContent = "下一关 ›";
    }
    overlay.style.display = "flex";
  }

  function loadLevel(index) {
    levelIndex = ((index % LEVELS.length) + LEVELS.length) % LEVELS.length;
    parseLevel(levelIndex);
    overlay.style.display = "none";
    render();
  }

  /* ---------- 输入 ---------- */

  document.addEventListener("keydown", function (e) {
    var key = e.key.toLowerCase();
    if (key === "arrowup" || key === "w") { e.preventDefault(); tryMove(-1, 0); }
    else if (key === "arrowdown" || key === "s") { e.preventDefault(); tryMove(1, 0); }
    else if (key === "arrowleft" || key === "a") { e.preventDefault(); tryMove(0, -1); }
    else if (key === "arrowright" || key === "d") { e.preventDefault(); tryMove(0, 1); }
    else if (key === "z") undo();
    else if (key === "r") loadLevel(levelIndex);
  });

  // 触摸方向键（简单虚拟方向键）
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
    if (Math.abs(dx) > Math.abs(dy)) tryMove(0, dx > 0 ? 1 : -1);
    else tryMove(dy > 0 ? 1 : -1, 0);
  }, { passive: true });

  document.getElementById("undo").addEventListener("click", undo);
  document.getElementById("reset").addEventListener("click", function () { loadLevel(levelIndex); });
  document.getElementById("prev").addEventListener("click", function () { loadLevel(levelIndex - 1); });
  document.getElementById("next").addEventListener("click", function () { loadLevel(levelIndex + 1); });

  ovBtn.addEventListener("click", function () {
    var solved = Moyu.store.get("sokoban.solved", 0);
    if (solved >= LEVELS.length && levelIndex === LEVELS.length - 1) {
      loadLevel(0);
    } else {
      loadLevel(levelIndex + 1);
    }
  });

  loadLevel(0);
})();
