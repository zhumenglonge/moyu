/* 扫雷：经典规则 + 首点安全 + 快速翻开 */
(function () {
  "use strict";

  var LEVELS = {
    easy:   { w: 9,  h: 9,  mines: 10, key: "minesweeper.easy" },
    normal: { w: 16, h: 16, mines: 40, key: "minesweeper.normal" },
    hard:   { w: 30, h: 16, mines: 99, key: "minesweeper.hard" }
  };

  var elBoard = document.getElementById("board");
  var elMinesLeft = document.getElementById("mines-left");
  var elTime = document.getElementById("time");
  var elBest = document.getElementById("best");
  var elResult = document.getElementById("result");
  var elFace = document.getElementById("face");
  var elMsg = document.getElementById("msg");

  var level = "easy";
  var cfg = LEVELS[level];
  var grid = [];        // { mine, open, flag, num }
  var started = false;  // 是否已布雷（首点后）
  var over = false;
  var flags = 0;
  var opened = 0;
  var timer = 0;
  var timerId = null;
  var cells = [];       // DOM 缓存

  /* ---------- 工具 ---------- */

  function idx(x, y) { return y * cfg.w + x; }
  function inBoard(x, y) { return x >= 0 && x < cfg.w && y >= 0 && y < cfg.h; }

  function neighbors(x, y) {
    var out = [];
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (inBoard(x + dx, y + dy)) out.push([x + dx, y + dy]);
      }
    }
    return out;
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  /* ---------- 游戏流程 ---------- */

  function reset() {
    cfg = LEVELS[level];
    grid = [];
    started = false;
    over = false;
    flags = 0;
    opened = 0;
    timer = 0;
    if (timerId) { clearInterval(timerId); timerId = null; }
    elTime.textContent = "0";
    elResult.hidden = true;
    elBoard.style.gridTemplateColumns = "repeat(" + cfg.w + ", 1fr)";
    elBoard.style.maxWidth = (cfg.w * 34) + "px";
    renderBest();
    build();
    updateMinesLeft();
  }

  function build() {
    elBoard.innerHTML = "";
    cells = [];
    for (var y = 0; y < cfg.h; y++) {
      for (var x = 0; x < cfg.w; x++) {
        grid.push({ mine: false, open: false, flag: false, num: 0 });
        var c = document.createElement("button");
        c.type = "button";
        c.className = "ms-cell";
        c.dataset.x = x;
        c.dataset.y = y;
        elBoard.appendChild(c);
        cells.push(c);
      }
    }
  }

  /* 首次点击后布雷，避开首点及其邻域 */
  function layMines(sx, sy) {
    var safe = {};
    safe[idx(sx, sy)] = true;
    neighbors(sx, sy).forEach(function (n) { safe[idx(n[0], n[1])] = true; });

    var pool = [];
    for (var i = 0; i < grid.length; i++) {
      if (!safe[i]) pool.push(i);
    }
    shuffle(pool);
    for (var m = 0; m < cfg.mines && m < pool.length; m++) {
      grid[pool[m]].mine = true;
    }

    for (var y = 0; y < cfg.h; y++) {
      for (var x = 0; x < cfg.w; x++) {
        if (grid[idx(x, y)].mine) continue;
        var n = 0;
        neighbors(x, y).forEach(function (nb) {
          if (grid[idx(nb[0], nb[1])].mine) n++;
        });
        grid[idx(x, y)].num = n;
      }
    }
    started = true;
    timerId = setInterval(function () {
      timer++;
      elTime.textContent = timer;
    }, 1000);
  }

  function open(x, y) {
    if (!inBoard(x, y)) return;
    var cell = grid[idx(x, y)];
    if (cell.open || cell.flag) return;
    cell.open = true;
    opened++;

    var dom = cells[idx(x, y)];
    dom.classList.add("open");
    if (cell.mine) {
      dom.classList.add("boom");
      dom.textContent = "💣";
      return;
    }
    if (cell.num > 0) {
      dom.textContent = cell.num;
      dom.classList.add("n" + cell.num);
      return;
    }
    /* 空白格：洪泛展开 */
    neighbors(x, y).forEach(function (nb) { open(nb[0], nb[1]); });
  }

  function floodReveal(x, y) {
    neighbors(x, y).forEach(function (nb) { open(nb[0], nb[1]); });
  }

  function toggleFlag(x, y) {
    var cell = grid[idx(x, y)];
    if (cell.open || over) return;
    cell.flag = !cell.flag;
    if (cell.flag) flags++;
    else flags--;
    cells[idx(x, y)].classList.toggle("flag", cell.flag);
    cells[idx(x, y)].textContent = cell.flag ? "🚩" : "";
    updateMinesLeft();
  }

  function updateMinesLeft() {
    elMinesLeft.textContent = cfg.mines - flags;
  }

  function checkWin() {
    if (opened === cfg.w * cfg.h - cfg.mines) {
      finish(true);
    }
  }

  function finish(win) {
    over = true;
    if (timerId) { clearInterval(timerId); timerId = null; }

    if (win) {
      elFace.textContent = "🎉";
      elMsg.textContent = "用时 " + timer + " 秒，全员拆除！";
      var best = Moyu.store.get(LEVELS[level].key, null);
      if (best === null || timer < best) {
        Moyu.store.set(LEVELS[level].key, timer);
        elMsg.textContent = "用时 " + timer + " 秒，新纪录！🏆";
      }
      renderBest();
      /* 胜利后给所有雷补旗 */
      grid.forEach(function (cell, i) {
        if (cell.mine && !cell.flag) {
          cell.flag = true;
          cells[i].classList.add("flag");
          cells[i].textContent = "🚩";
        }
      });
      flags = cfg.mines;
      updateMinesLeft();
    } else {
      elFace.textContent = "💥";
      elMsg.textContent = "踩雷了！再摸一局？";
      grid.forEach(function (cell, i) {
        if (cell.mine && !cell.open) {
          cells[i].classList.add("open", "mine");
          cells[i].textContent = "💣";
        }
      });
    }
    elResult.hidden = false;
  }

  function renderBest() {
    var best = Moyu.store.get(LEVELS[level].key, null);
    elBest.textContent = best === null ? "--" : best + "s";
  }

  /* ---------- 事件 ---------- */

  function cellXY(target) {
    var x = parseInt(target.dataset.x, 10);
    var y = parseInt(target.dataset.y, 10);
    return isNaN(x) || isNaN(y) ? null : { x: x, y: y };
  }

  elBoard.addEventListener("click", function (e) {
    var pos = cellXY(e.target);
    if (!pos || over) return;
    var cell = grid[idx(pos.x, pos.y)];
    if (cell.flag) return;

    if (!started) layMines(pos.x, pos.y);
    open(pos.x, pos.y);

    if (grid[idx(pos.x, pos.y)].mine) { finish(false); return; }
    checkWin();
  });

  elBoard.addEventListener("dblclick", function (e) {
    var pos = cellXY(e.target);
    if (!pos || over) return;
    var cell = grid[idx(pos.x, pos.y)];
    if (!cell.open || cell.num === 0) return;

    /* 旗数足够才快速翻开周围 */
    var f = 0;
    neighbors(pos.x, pos.y).forEach(function (nb) {
      if (grid[idx(nb[0], nb[1])].flag) f++;
    });
    if (f !== cell.num) return;

    floodReveal(pos.x, pos.y);
    var boom = false;
    grid.forEach(function (c) { if (c.open && c.mine) boom = true; });
    if (boom) { finish(false); return; }
    checkWin();
  });

  elBoard.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    var pos = cellXY(e.target);
    if (!pos || over || !started) return;
    toggleFlag(pos.x, pos.y);
  });

  /* 移动端长按插旗 */
  var longTimer = null;
  var longFired = false;
  elBoard.addEventListener("touchstart", function (e) {
    var pos = cellXY(e.target);
    if (!pos || over || !started) return;
    longFired = false;
    longTimer = setTimeout(function () {
      longFired = true;
      toggleFlag(pos.x, pos.y);
    }, 400);
  }, { passive: true });
  ["touchend", "touchmove", "touchcancel"].forEach(function (ev) {
    elBoard.addEventListener(ev, function () {
      clearTimeout(longTimer);
    }, { passive: true });
  });
  elBoard.addEventListener("click", function (e) {
    if (longFired) { e.stopPropagation(); e.preventDefault(); longFired = false; }
  }, true);

  /* 键盘：Insert 插旗，R 重开 */
  document.addEventListener("keydown", function (e) {
    if (Moyu.boss.isActive()) return;
    if (e.key === "Insert") {
      e.preventDefault();
      var focus = elBoard.querySelector(".ms-cell:focus");
      var pos = focus && cellXY(focus);
      if (pos && over === false && started) toggleFlag(pos.x, pos.y);
    } else if (e.key === "r" || e.key === "R") {
      reset();
    }
  });

  document.getElementById("new-game").addEventListener("click", reset);

  document.getElementById("modes").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-level]");
    if (!btn) return;
    level = btn.dataset.level;
    document.querySelectorAll(".mode-btn").forEach(function (b) {
      b.classList.toggle("active", b === btn);
    });
    reset();
  });

  reset();
})();
