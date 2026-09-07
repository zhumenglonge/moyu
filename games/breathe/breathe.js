/* 深呼吸：跟着圆圈做呼吸训练 */
(function () {
  "use strict";

  var MODES = {
    box:   { name: "均衡 4-4-4-4", phases: [4, 4, 4, 4] },
    relax: { name: "助眠 4-7-8",   phases: [4, 7, 8] }
  };

  var PHASE_TEXT = ["吸气", "停顿", "呼气", "停顿"];

  var circle = document.getElementById("circle");
  var phaseEl = document.getElementById("phase");
  var countEl = document.getElementById("count");
  var modeNameEl = document.getElementById("mode-name");
  var roundsEl = document.getElementById("rounds");
  var totalEl = document.getElementById("total");
  var toggleBtn = document.getElementById("toggle");

  var mode = "box";
  var running = false;
  var timer = null;
  var round = 0;

  var todayKey = new Date().toISOString().slice(0, 10);
  var total = Moyu.store.get("breathe." + todayKey, 0);

  function step(pi) {
    if (!running) return;
    var phases = MODES[mode].phases;
    if (pi >= phases.length) {
      round++;
      roundsEl.textContent = round;
      total++;
      totalEl.textContent = total;
      Moyu.store.set("breathe." + todayKey, total);
      pi = 0;
    }

    var seconds = phases[pi];
    phaseEl.textContent = PHASE_TEXT[pi] || "停顿";
    countEl.textContent = seconds;

    /* 吸气/呼气时圆圈同步伸缩，停顿时保持不动 */
    if (pi === 0) {
      circle.classList.remove("exhale");
      circle.classList.add("inhale");
    } else if (pi === 2) {
      circle.classList.remove("inhale");
      circle.classList.add("exhale");
    }
    circle.style.transitionDuration = (pi === 0 || pi === 2 ? seconds : 0.3) + "s";

    var left = seconds;
    countEl.textContent = left;
    timer = setInterval(function () {
      if (!running) return;
      left--;
      if (left > 0) {
        countEl.textContent = left;
      } else {
        clearInterval(timer);
        step(pi + 1);
      }
    }, 1000);
  }

  function start() {
    running = true;
    round = 0;
    roundsEl.textContent = "0";
    toggleBtn.textContent = "停一下";
    phaseEl.textContent = "吸气";
    step(0);
  }

  function stop() {
    running = false;
    if (timer) clearInterval(timer);
    circle.classList.remove("inhale", "exhale");
    circle.style.transitionDuration = "0.4s";
    phaseEl.textContent = "休息好了再来";
    countEl.textContent = "—";
    toggleBtn.textContent = "继续呼吸";
  }

  toggleBtn.addEventListener("click", function () {
    if (running) stop();
    else start();
  });

  /* 老板键亮起时自动暂停 */
  document.addEventListener("moyu:boss-on", stop);

  Array.prototype.forEach.call(document.querySelectorAll(".mode-btn"), function (btn) {
    btn.addEventListener("click", function () {
      if (mode === btn.getAttribute("data-mode")) return;
      var wasRunning = running;
      if (running) stop();
      mode = btn.getAttribute("data-mode");
      modeNameEl.textContent = MODES[mode].name;
      Array.prototype.forEach.call(document.querySelectorAll(".mode-btn"), function (b) {
        b.classList.toggle("active", b === btn);
      });
      if (wasRunning) start();
    });
  });

  totalEl.textContent = total;
})();
