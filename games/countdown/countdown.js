/* 摸鱼倒计时：下班倒计时时钟 */
(function () {
  "use strict";

  var DEFAULT_START = "09:00";
  var DEFAULT_END = "18:00";

  var elTimer = document.getElementById("timer");
  var elLabel = document.getElementById("label");
  var elSub = document.getElementById("sub");
  var elDate = document.getElementById("date");
  var elBar = document.getElementById("progress-bar");
  var elProgressText = document.getElementById("progress-text");
  var elQuote = document.getElementById("quote");
  var elStart = document.getElementById("work-start");
  var elEnd = document.getElementById("work-end");

  /* 按剩余时间分段的摸鱼语录 */
  var QUOTES = [
    { max: 10,  text: "冲刺阶段！收拾东西假装在忙，静音等下班。" },
    { max: 30,  text: "最后半小时，开始逐条检查今天鸽掉的群消息。" },
    { max: 60,  text: "一小时了，表格填得差不多了，该思考晚饭了。" },
    { max: 120, text: "还剩俩小时，水杯该续水了，顺便活动下颈椎。" },
    { max: 240, text: "下午茶时段，建议摸一口零食再战。" },
    { max: 480, text: "一天刚开头，稳住，先把最糊弄的活儿干完。" }
  ];

  var WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

  function parseTime(str) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(str || "");
    if (!m) return null;
    var h = parseInt(m[1], 10);
    var mi = parseInt(m[2], 10);
    if (h > 23 || mi > 59) return null;
    return { h: h, mi: mi };
  }

  function getTimes() {
    var s = parseTime(elStart.value) || parseTime(DEFAULT_START);
    var e = parseTime(elEnd.value) || parseTime(DEFAULT_END);
    return {
      start: s.h * 60 + s.mi,
      end: e.h * 60 + e.mi
    };
  }

  function saveTimes() {
    Moyu.store.set("countdown.times", {
      start: elStart.value,
      end: elEnd.value
    });
  }

  function loadTimes() {
    var saved = Moyu.store.get("countdown.times", null);
    if (saved) {
      if (parseTime(saved.start)) elStart.value = saved.start;
      if (parseTime(saved.end)) elEnd.value = saved.end;
    }
  }

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function fmt(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return pad(h) + ":" + pad(m) + ":" + pad(s);
  }

  function fmtHour(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    if (h === 0) return m + " 分钟";
    if (m === 0) return h + " 小时";
    return h + " 小时 " + m + " 分";
  }

  function pickQuote(minLeft) {
    for (var i = 0; i < QUOTES.length; i++) {
      if (minLeft <= QUOTES[i].max) return QUOTES[i].text;
    }
    return QUOTES[QUOTES.length - 1].text;
  }

  function update() {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var t = getTimes();
    var workLen = t.end - t.start;

    elDate.textContent =
      now.getFullYear() + " 年 " + (now.getMonth() + 1) + " 月 " +
      now.getDate() + " 日 · 星期" + WEEKDAYS[now.getDay()];

    if (nowMin < t.start) {
      /* 上班前：倒计时到上班 */
      var toStart = (t.start - nowMin) * 60 - now.getSeconds();
      elLabel.textContent = "距离上班";
      elTimer.textContent = fmt(toStart);
      elSub.textContent = "还没上班就开始摸，这觉悟可以。";
      elBar.style.width = "0%";
      elProgressText.textContent = "";
      elQuote.textContent = "通勤路上注意安全，到了先泡杯茶。";
      return;
    }

    if (workLen <= 0 || nowMin >= t.end) {
      /* 已下班：显示今天摸了多久 */
      var fishMin = nowMin - t.start;
      elLabel.textContent = "已下班";
      elTimer.textContent = "🎉";
      elSub.textContent = "今天工位在座 " + fmtHour(fishMin) + "，辛苦了。";
      elBar.style.width = "100%";
      elProgressText.textContent = "今日进度 100% · 打卡下班";
      elQuote.textContent = "下班后的时间才是自己的，好好享受。";
      return;
    }

    /* 工作中：倒计时到下班 */
    var leftSec = (t.end - nowMin) * 60 - now.getSeconds();
    var passed = nowMin - t.start;
    var pct = Math.round((passed / workLen) * 100);

    elLabel.textContent = "距离下班";
    elTimer.textContent = fmt(leftSec);
    elSub.textContent = "已坐班 " + fmtHour(passed) + " · 还需坚持 " + fmtHour(t.end - nowMin);
    elBar.style.width = pct + "%";
    elProgressText.textContent = "今日进度 " + pct + "%";
    elQuote.textContent = pickQuote(t.end - nowMin);
  }

  elStart.addEventListener("change", saveTimes);
  elEnd.addEventListener("change", saveTimes);

  document.getElementById("quick-off").addEventListener("click", function () {
    var now = new Date();
    var quick = pad(now.getHours()) + ":" + pad(now.getMinutes());
    elEnd.value = quick;
    saveTimes();
    update();
  });

  document.getElementById("reset-time").addEventListener("click", function () {
    elStart.value = DEFAULT_START;
    elEnd.value = DEFAULT_END;
    saveTimes();
    update();
  });

  loadTimes();
  update();
  setInterval(update, 1000);
})();
