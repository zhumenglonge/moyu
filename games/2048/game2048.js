(function () {
  "use strict";

  var SIZE = 4;
  var TILE_COLORS = {
    2: "#3d4e73", 4: "#4a5d8a", 8: "#5b8cff", 16: "#6f7bff",
    32: "#8f6bff", 64: "#b45cff", 128: "#ff6bd6", 256: "#ff6b9d",
    512: "#ff6b81", 1024: "#ff8f5b", 2048: "#ffb454"
  };

  var gridEl = document.getElementById("grid");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var overlay = document.getElementById("overlay");
  var ovTitle = document.getElementById("ov-title");
  var ovText = document.getElementById("ov-text");
  var ovBtn = document.getElementById("ov-btn");
  var newGameBtn = document.getElementById("new-game");

  var board, score, over, winShown, keepPlaying;
  var animating = false;
  var tileEls = {};
  var tileId = 0;

  /* ---------- 布局辅助 ---------- */

  function posStyle(el, row, col) {
    el.style.left = 2.5 + col * 25 + "%";
    el.style.top = 2.5 + row * 25 + "%";
  }

  function styleTile(el, value) {
    el.textContent = value;
    el.style.background = TILE_COLORS[value] || "#ffd24a";
    el.style.color = value >= 8 ? "#fff" : "#e8edf6";
    el.style.fontSize = value < 100 ? "" : value < 1000 ? "28px" : "22px";
  }

  function buildBackground() {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var cell = document.createElement("div");
        cell.className = "cell";
        posStyle(cell, r, c);
        gridEl.appendChild(cell);
      }
    }
  }

  function renderTile(tile) {
    var el = document.createElement("div");
    el.className = "tile" + (tile.isNew ? " new" : "");
    styleTile(el, tile.value);
    posStyle(el, tile.row, tile.col);
    gridEl.appendChild(el);
    tileEls[tile.id] = el;
    tile.isNew = false;
    return el;
  }

  function moveTileEl(tile) {
    var el = tileEls[tile.id];
    if (el) posStyle(el, tile.row, tile.col);
  }

  function removeTileEl(tile) {
    var el = tileEls[tile.id];
    if (el) {
      el.remove();
      delete tileEls[tile.id];
    }
  }

  function replayMergeAnim(tile) {
    var el = tileEls[tile.id];
    if (!el) return;
    el.classList.remove("merged");
    void el.offsetWidth;
    el.classList.add("merged");
  }

  function newTile(row, col, value) {
    return { id: ++tileId, row: row, col: col, value: value, isNew: true };
  }

  /* ---------- 游戏逻辑 ---------- */

  function reset() {
    board = [];
    for (var r = 0; r < SIZE; r++) board.push([null, null, null, null]);
    score = 0;
    over = false;
    winShown = false;
    keepPlaying = false;
    animating = false;
    Object.keys(tileEls).forEach(function (id) { tileEls[id].remove(); });
    tileEls = {};
    overlay.style.display = "none";
    spawn();
    spawn();
    updateHud();
  }

  function spawn() {
    var empty = [];
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        if (!board[r][c]) empty.push({ r: r, c: c });
      }
    }
    if (!empty.length) return;
    var spot = empty[Math.floor(Math.random() * empty.length)];
    var tile = newTile(spot.r, spot.c, Math.random() < 0.9 ? 2 : 4);
    board[spot.r][spot.c] = tile;
    renderTile(tile);
  }

  function updateHud() {
    scoreEl.textContent = score;
    bestEl.textContent = Moyu.store.best("2048");
  }

  // 方向定义：lines 返回按"目标边在前"顺序的 tile 序列
  function collectLines(dir) {
    var lines = [];
    for (var i = 0; i < SIZE; i++) {
      var tiles = [];
      for (var j = 0; j < SIZE; j++) {
        var r, c;
        if (dir === "left") { r = i; c = j; }
        else if (dir === "right") { r = i; c = SIZE - 1 - j; }
        else if (dir === "up") { r = j; c = i; }
        else { r = SIZE - 1 - j; c = i; }
        if (board[r][c]) tiles.push(board[r][c]);
      }
      tiles.lineRow = i;
      lines.push(tiles);
    }
    return lines;
  }

  function move(dir) {
    if (over || animating) return;
    var moved = false;
    var deaths = [];
    var merges = [];
    var lines = collectLines(dir);

    lines.forEach(function (tiles) {
      var result = [null, null, null, null];
      var slot = 0;
      var i = 0;
      var idxAt = function (slot) {
        return dir === "left" ? { r: tiles.lineRow, c: slot }
             : dir === "right" ? { r: tiles.lineRow, c: SIZE - 1 - slot }
             : dir === "up" ? { r: slot, c: tiles.lineRow }
             : { r: SIZE - 1 - slot, c: tiles.lineRow };
      };
      while (i < tiles.length) {
        var t = tiles[i];
        if (i + 1 < tiles.length && tiles[i + 1].value === t.value) {
          var b = tiles[i + 1];
          var p = idxAt(slot);
          t.row = p.r; t.col = p.c;
          b.row = p.r; b.col = p.c;
          t.value *= 2;
          t.merged = true;
          score += t.value;
          deaths.push(b);
          merges.push(t);
          moved = true;
          result[dir === "left" || dir === "right" ? p.c : p.r] = t;
          i += 2;
        } else {
          var p2 = idxAt(slot);
          if (t.row !== p2.r || t.col !== p2.c) moved = true;
          t.row = p2.r; t.col = p2.c;
          result[dir === "left" || dir === "right" ? p2.c : p2.r] = t;
          i += 1;
        }
        slot++;
      }
      // 写回棋盘
      if (dir === "left" || dir === "right") {
        board[tiles.lineRow] = result;
      } else {
        for (var rr = 0; rr < SIZE; rr++) board[rr][tiles.lineRow] = result[rr];
      }
    });

    if (!moved) return;
    animating = true;

    // 所有 tile（含即将消失的）滑到新位置
    lines.forEach(function (tiles) {
      tiles.forEach(moveTileEl);
    });

    setTimeout(function () {
      deaths.forEach(function (b) { removeTileEl(b); });
      merges.forEach(function (t) {
        var el = tileEls[t.id];
        if (el) styleTile(el, t.value);
        replayMergeAnim(t);
        t.merged = false;
      });
      spawn();
      updateHud();
      Moyu.store.saveBest("2048", score);
      animating = false;

      if (!winShown && merges.some(function (t) { return t.value === 2048; })) {
        winShown = true;
        keepPlaying = true;
        showOverlay("你赢了 🎉", "拼出 2048！当前得分 " + score, "继续挑战");
      } else if (!canMove()) {
        over = true;
        showOverlay("游戏结束", "得分 " + score + " · 最高分 " + Moyu.store.best("2048"), "再来一局");
      }
    }, 130);
  }

  function canMove() {
    for (var r = 0; r < SIZE; r++) {
      for (var c = 0; c < SIZE; c++) {
        var t = board[r][c];
        if (!t) return true;
        if (c + 1 < SIZE) {
          var right = board[r][c + 1];
          if (!right || right.value === t.value) return true;
        }
        if (r + 1 < SIZE) {
          var down = board[r + 1][c];
          if (!down || down.value === t.value) return true;
        }
      }
    }
    return false;
  }

  function showOverlay(title, text, btn) {
    ovTitle.textContent = title;
    ovText.textContent = text;
    ovBtn.textContent = btn;
    overlay.style.display = "flex";
  }

  /* ---------- 输入 ---------- */

  document.addEventListener("keydown", function (e) {
    var key = e.key.toLowerCase();
    var dir = null;
    if (key === "arrowup" || key === "w") dir = "up";
    else if (key === "arrowdown" || key === "s") dir = "down";
    else if (key === "arrowleft" || key === "a") dir = "left";
    else if (key === "arrowright" || key === "d") dir = "right";
    if (!dir) return;
    e.preventDefault();
    move(dir);
  });

  var touchStart = null;
  document.addEventListener("touchstart", function (e) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!touchStart) return;
    var dx = e.changedTouches[0].clientX - touchStart.x;
    var dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }, { passive: true });

  ovBtn.addEventListener("click", function () {
    if (keepPlaying && !over) {
      overlay.style.display = "none";
    } else {
      reset();
    }
  });

  newGameBtn.addEventListener("click", reset);

  /* ---------- 启动 ---------- */

  buildBackground();
  reset();
})();
