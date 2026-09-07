/* 六十甲子：天干地支纪年训练，四种模式 + 小抄 */
(function () {
  "use strict";

  var STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  var BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  var ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

  var TOTAL = 10; // 每局题数
  var MODES = ["year", "zodiac", "order", "mix"];
  var MODE_NAME = {
    year: "年份 → 干支",
    zodiac: "地支 ↔ 生肖",
    order: "顺序填空",
    mix: "混合模式"
  };

  var el = {
    score: document.getElementById("score"),
    combo: document.getElementById("combo"),
    progress: document.getElementById("progress"),
    best: document.getElementById("best"),
    cheatToggle: document.getElementById("cheat-toggle"),
    cheat: document.getElementById("cheat"),
    cheatStems: document.getElementById("cheat-stems"),
    cheatBranches: document.getElementById("cheat-branches"),
    cheatZodiac: document.getElementById("cheat-zodiac"),
    quiz: document.getElementById("quiz"),
    result: document.getElementById("result"),
    modeTag: document.getElementById("mode-tag"),
    question: document.getElementById("question"),
    options: document.getElementById("options"),
    feedback: document.getElementById("feedback"),
    verdict: document.getElementById("verdict"),
    explain: document.getElementById("explain"),
    next: document.getElementById("next"),
    finalScore: document.getElementById("final-score"),
    finalSub: document.getElementById("final-sub"),
    finalMsg: document.getElementById("final-msg"),
    restart: document.getElementById("restart"),
    modes: document.getElementById("modes")
  };

  var mode = "year";
  var qNo = 0;        // 0-based
  var score = 0;
  var combo = 0;
  var maxCombo = 0;
  var answered = false;

  /* ---------- 干支计算 ---------- */

  /* 公元 4 年 = 甲子，天干十年一轮看尾数，地支十二年一轮 */
  function yearStem(year) { return STEMS[((year - 4) % 10 + 10) % 10]; }
  function yearBranch(year) { return BRANCHES[((year - 4) % 12 + 12) % 12]; }
  function ganzhi(year) { return yearStem(year) + yearBranch(year); }
  function zodiacOf(year) { return ZODIAC[((year - 4) % 12 + 12) % 12]; }

  /* 随机取 1900–2099 之间一个好算的年份 */
  function randomYear() { return 1900 + Math.floor(Math.random() * 200); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pickWrong(pool, answer, n) {
    var wrong = shuffle(pool.filter(function (x) { return x !== answer; })).slice(0, n);
    return shuffle(wrong.concat([answer]));
  }

  /* ---------- 出题 ---------- */

  var current = null; // { question, options, answer, explain }

  function makeQuestion() {
    var kind = mode === "mix"
      ? ["year", "year", "zodiac", "order"][Math.floor(Math.random() * 4)]
      : mode;
    return kind === "year" ? qYear()
      : kind === "zodiac" ? qZodiac()
      : qOrder();
  }

  /* 模式一：某年是什么干支年？干扰项换天干或换地支 */
  function qYear() {
    var y = randomYear();
    var answer = ganzhi(y);
    var stem = yearStem(y);
    var branch = yearBranch(y);
    /* 候选池：同地支换天干 + 同天干换地支，都是"看着都对"的陷阱 */
    var pool = STEMS.map(function (s) { return s + branch; })
      .concat(BRANCHES.map(function (b) { return stem + b; }));
    return {
      question: y + " 年是什么干支年？",
      options: pickWrong(pool, answer, 3),
      answer: answer,
      explain: y + " 尾数 " + (y % 10) + " → 天干「" + stem + "」；(" + y + "−4)÷12 余 " + (((y - 4) % 12 + 12) % 12) + " → 地支「" + branch + "」，所以是 " + answer + "，生肖" + zodiacOf(y) + "。"
    };
  }

  /* 模式二：地支与生肖互相翻译 */
  function qZodiac() {
    var toZodiac = Math.random() < 0.5;
    var i = Math.floor(Math.random() * 12);
    var answer = toZodiac ? ZODIAC[i] : BRANCHES[i];
    var from = toZodiac ? BRANCHES[i] : ZODIAC[i];
    var pool = toZodiac ? ZODIAC : BRANCHES;
    return {
      question: toZodiac ? "地支「" + from + "」对应哪个生肖？" : "生肖「" + from + "」对应哪个地支？",
      options: pickWrong(pool, answer, 3),
      answer: answer,
      explain: "子鼠、丑牛、寅虎、卯兔、辰龙、巳蛇、午马、未羊、申猴、酉鸡、戌狗、亥猪——" + from + " ↔ " + answer + "。"
    };
  }

  /* 模式三：顺序填空（天干/地支/生肖轮盘上挖一个洞） */
  function qOrder() {
    var isStem = Math.random() < 0.5;
    var pool = isStem ? STEMS : BRANCHES;
    var names = isStem ? ["天干", "地支"] : ["地支", "天干"];
    var i = Math.floor(Math.random() * pool.length);
    var answer = pool[i];
    var prev = pool[(i - 1 + pool.length) % pool.length];
    var next = pool[(i + 1) % pool.length];
    return {
      question: "在" + names[0] + "序列里填空：… " + prev + " 【？】 " + next + " …",
      options: pickWrong(pool, answer, 3),
      answer: answer,
      explain: names[0] + "顺序：" + pool.join("") + "（" + names[1] + "同理，背熟顺序就百战百胜）。"
    };
  }

  /* ---------- 渲染 ---------- */

  function renderStatus() {
    el.score.textContent = score;
    el.combo.textContent = combo;
    el.progress.textContent = Math.min(qNo + 1, TOTAL) + "/" + TOTAL;
  }

  function renderQuestion() {
    current = makeQuestion();
    answered = false;
    el.modeTag.textContent = MODE_NAME[mode];
    el.question.textContent = current.question;
    el.feedback.hidden = true;
    el.next.hidden = true;

    el.options.innerHTML = "";
    current.options.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gz-option";
      btn.innerHTML = "<span class=\"gz-key\">" + (i + 1) + "</span>" + opt;
      btn.addEventListener("click", function () { answer(btn, opt); });
      el.options.appendChild(btn);
    });
    renderStatus();
  }

  function answer(btn, opt) {
    if (answered) return;
    answered = true;
    var correct = opt === current.answer;

    var buttons = el.options.querySelectorAll(".gz-option");
    Array.prototype.forEach.call(buttons, function (b) {
      b.disabled = true;
      if (b.textContent.slice(1) === current.answer) b.classList.add("correct");
    });
    if (correct) {
      btn.classList.add("correct");
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      score += 10 + Math.min(combo, 5) * 2; // 连击加成，封顶 +20/题
      el.verdict.textContent = "✅ 正确！" + (combo >= 3 ? " 连对 " + combo + "，出师了！" : "");
    } else {
      btn.classList.add("wrong");
      combo = 0;
      el.verdict.textContent = "❌ 正确答案是「" + current.answer + "」";
    }
    el.explain.textContent = current.explain;
    el.feedback.hidden = false;
    el.next.hidden = false;
    el.next.textContent = qNo + 1 >= TOTAL ? "看结算 →" : "下一题 →";
    el.next.focus();
    renderStatus();
  }

  function finish() {
    el.quiz.hidden = true;
    el.result.hidden = false;
    el.finalScore.textContent = score;
    el.finalSub.textContent = "满分 " + TOTAL * 20 + " · 最长连对 " + maxCombo + " 连 · " + MODE_NAME[mode];

    var ratio = score / (TOTAL * 20);
    el.finalMsg.textContent =
      ratio >= 0.95 ? "六十甲子已刻进 DNA，同事问年份你张口就来。" :
      ratio >= 0.7 ? "离满分就差一口诀，明天再来一轮巩固。" :
      ratio >= 0.4 ? "进步神速！记得先翻小抄再答题。" :
      "万事开头难，先把「天干看尾数」焊死在脑子里。";

    if (window.Moyu) Moyu.store.saveBest("ganzhi." + mode, score);
    el.best.textContent = window.Moyu ? Moyu.store.best("ganzhi." + mode) : 0;
  }

  function next() {
    qNo++;
    if (qNo >= TOTAL) finish();
    else renderQuestion();
  }

  function start() {
    qNo = 0;
    score = 0;
    combo = 0;
    maxCombo = 0;
    el.result.hidden = true;
    el.quiz.hidden = false;
    renderQuestion();
  }

  /* ---------- 小抄 ---------- */

  function initCheat() {
    /* 天干：尾数 → 字 */
    el.cheatStems.innerHTML = STEMS.map(function (s, i) {
      return "<span class=\"gz-pair\"><b>" + s + "</b><i>" + ((i + 4) % 10) + "</i></span>";
    }).join("");
    /* 地支：余数 → 字 */
    el.cheatBranches.innerHTML = BRANCHES.map(function (b, i) {
      return "<span class=\"gz-pair\"><b>" + b + "</b><i>" + i + "</i></span>";
    }).join("");
    /* 生肖：字 ↔ 字 */
    el.cheatZodiac.innerHTML = ZODIAC.map(function (z, i) {
      return "<span class=\"gz-pair\"><b>" + BRANCHES[i] + z + "</b></span>";
    }).join("");

    el.cheatToggle.addEventListener("click", function () {
      el.cheat.hidden = !el.cheat.hidden;
      el.cheatToggle.textContent = el.cheat.hidden ? "📖 小抄" : "🙈 收起小抄";
    });
  }

  /* ---------- 模式切换 ---------- */

  function setMode(m) {
    mode = m;
    var btns = el.modes.querySelectorAll(".mode-btn");
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle("active", b.getAttribute("data-mode") === m);
    });
    el.best.textContent = window.Moyu ? Moyu.store.best("ganzhi." + mode) : 0;
    start();
  }

  el.modes.addEventListener("click", function (e) {
    var btn = e.target.closest(".mode-btn");
    if (btn) setMode(btn.getAttribute("data-mode"));
  });

  el.next.addEventListener("click", next);
  el.restart.addEventListener("click", start);

  /* 键盘：1-4 作答，Enter 下一题 */
  document.addEventListener("keydown", function (e) {
    if (Moyu && Moyu.boss.isActive()) return;
    if (e.key === "Enter" && !el.next.hidden && !el.quiz.hidden) {
      e.preventDefault();
      next();
    } else if (!answered && /^[1-4]$/.test(e.key)) {
      var btn = el.options.querySelectorAll(".gz-option")[Number(e.key) - 1];
      if (btn) btn.click();
    }
  });

  initCheat();
  el.best.textContent = window.Moyu ? Moyu.store.best("ganzhi." + mode) : 0;
  start();
})();
