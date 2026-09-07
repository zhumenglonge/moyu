/* 全站共享：老板键、高分存储、游戏暂停钩子 */
(function () {
  "use strict";

  /* ---------- localStorage 高分工具 ---------- */

  var Store = {
    get: function (key, fallback) {
      try {
        var v = localStorage.getItem("moyu." + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem("moyu." + key, JSON.stringify(value));
      } catch (e) {}
    },
    best: function (game) {
      return Store.get(game + ".best", 0);
    },
    saveBest: function (game, score) {
      if (score > Store.best(game)) Store.set(game + ".best", score);
    },
    readProgress: function (game) {
      return Store.get(game + ".progress", null);
    },
    writeProgress: function (game, data) {
      Store.set(game + ".progress", data);
    }
  };

  /* ---------- 老板键 ---------- */

  var FAKE_CODE = [
    '<span class="cm">#!/usr/bin/env python3</span>',
    '<span class="cm">"""数据管道调度入口 — v2.4.1</span>',
    '<span class="cm">负责每日 ETL 任务的编排、重试与告警。</span>',
    '<span class="cm">"""</span>',
    'from __future__ import annotations',
    '',
    'import asyncio',
    'import logging',
    'from dataclasses import dataclass, field',
    'from datetime import datetime, timedelta',
    'from typing import Iterable, Optional',
    '',
    'from .connectors import <span class="cls">PostgresSink</span>, <span class="cls">KafkaSource</span>',
    'from .metrics import <span class="fn">record_latency</span>, <span class="fn">record_throughput</span>',
    '',
    'logger = logging.getLogger(<span class="str">"pipeline.scheduler"</span>)',
    '',
    '',
    '@dataclass',
    'class <span class="cls">TaskConfig</span>:',
    '    name: str',
    '    source_topic: str',
    '    sink_table: str',
    '    retry_limit: int = <span class="num">3</span>',
    '    timeout: timedelta = field(default_factory=lambda: timedelta(minutes=<span class="num">30</span>))',
    '',
    '',
    'class <span class="cls">PipelineScheduler</span>:',
    '    <span class="kw">def</span> <span class="fn">__init__</span>(self, sink: <span class="cls">PostgresSink</span>, tasks: Iterable[<span class="cls">TaskConfig</span>]):',
    '        self._sink = sink',
    '        self._tasks = {t.name: t <span class="kw">for</span> t <span class="kw">in</span> tasks}',
    '        self._running: dict[str, asyncio.Task] = {}',
    '',
    '    <span class="kw">async def</span> <span class="fn">run_once</span>(self, task: <span class="cls">TaskConfig</span>) -> <span class="cls">Optional</span>[int]:',
    '        <span class="cm"># 拉取批次并写入目标表，返回影响行数</span>',
    '        started = datetime.now()',
    '        <span class="kw">try</span>:',
    '            async <span class="kw">with</span> <span class="cls">KafkaSource</span>(task.source_topic) <span class="kw">as</span> source:',
    '                rows = [msg.value async <span class="kw">for</span> msg <span class="kw">in</span> source.batch(max_size=<span class="num">5000</span>)]',
    '            affected = <span class="kw">await</span> self._sink.upsert(task.sink_table, rows)',
    '            <span class="fn">record_latency</span>(task.name, datetime.now() - started)',
    '            <span class="fn">record_throughput</span>(task.name, len(rows))',
    '            <span class="kw">return</span> affected',
    '        <span class="kw">except</span> <span class="cls">TimeoutError</span>:',
    '            logger.warning(<span class="str">"task %s timed out after %s"</span>, task.name, task.timeout)',
    '            <span class="kw">return</span> <span class="kw">None</span>',
    '',
    '    <span class="kw">async def</span> <span class="fn">execute</span>(self, name: str) -> bool:',
    '        task = self._tasks[name]',
    '        <span class="kw">for</span> attempt <span class="kw">in</span> range(task.retry_limit):',
    '            result = <span class="kw">await</span> self.<span class="fn">run_once</span>(task)',
    '            <span class="kw">if</span> result <span class="kw">is not</span> <span class="kw">None</span>:',
    '                logger.info(<span class="str">"task %s ok: %d rows"</span>, name, result)',
    '                <span class="kw">return</span> True',
    '        logger.error(<span class="str">"task %s failed after %d retries"</span>, name, task.retry_limit)',
    '        <span class="kw">return</span> False',
    '',
    '',
    'async <span class="kw">def</span> <span class="fn">main</span>() -> <span class="cls">None</span>:',
    '    logging.basicConfig(level=logging.INFO)',
    '    scheduler = <span class="cls">PipelineScheduler</span>(sink=<span class="cls">PostgresSink</span>(dsn=<span class="str">"postgresql://etl@db-prod:5432/warehouse"</span>), tasks=[',
    '        <span class="cls">TaskConfig</span>(<span class="str">"orders"</span>, <span class="str">"events.orders.v2"</span>, <span class="str">"fact_orders"</span>),',
    '        <span class="cls">TaskConfig</span>(<span class="str">"users"</span>, <span class="str">"events.users.v2"</span>, <span class="str">"dim_users"</span>, retry_limit=<span class="num">5</span>),',
    '    ])',
    '    <span class="kw">await</span> asyncio.gather(*(scheduler.execute(name) <span class="kw">for</span> name <span class="kw">in</span> scheduler._tasks))',
    '',
    '',
    '    <span class="kw">if</span> __name__ == <span class="str">"__main__"</span>:',
    '    asyncio.<span class="fn">run</span>(main())'
  ];

  var FAKE_FILES = [
    "connectors.py",
    "main.py",
    "metrics.py",
    "scheduler.py",
    "settings.py",
    "tests/",
    "requirements.txt",
    "README.md"
  ];

  var screen = null;
  var active = false;
  var prevTitle = document.title;

  function buildScreen() {
    screen = document.createElement("div");
    screen.className = "boss-screen";
    screen.setAttribute("aria-hidden", "true");

    var codeLines = FAKE_CODE.map(function (line, i) {
      return '<div id="boss-ln' + (i + 1) + '">' + (line || " ") + "</div>";
    }).join("");

    var filesHtml = FAKE_FILES.map(function (f) {
      var cls = /\/$/.test(f) ? "folder" : "file";
      var open = f === "main.py" ? " open" : "";
      return '<div class="' + cls + open + '">' + f + "</div>";
    }).join("");

    screen.innerHTML =
      '<div class="vs-body">' +
      '<div class="activity-bar">' +
      '<div class="act active">⌘</div><div class="act">🔍</div><div class="act">⑂</div><div class="act">▶</div><div class="act">🧩</div>' +
      "</div>" +
      '<div class="sidebar"><div class="sec-title">EXPLORER — ETL-PIPELINE</div>' + filesHtml + "</div>" +
      '<div class="main-col">' +
      '<div class="tabs">' +
      '<div class="tab active">🐍 main.py <span class="close">✕</span></div>' +
      '<div class="tab">📄 scheduler.py <span class="close">✕</span></div>' +
      "</div>" +
      '<div class="editor"><div class="gutter">' +
      FAKE_CODE.map(function (_, i) { return i + 1; }).join("<br>") +
      "</div>" +
      '<div class="code">' + codeLines + "</div></div>" +
      "</div></div>" +
      '<div class="status-bar">' +
      '<span>⑂ main*</span><span>0 ↓ 1 ↑</span>' +
      '<div class="right"><span>Ln 42, Col 8</span><span>Spaces: 4</span><span>UTF-8</span><span>Python 3.11.4</span><span>🔔</span></div>' +
      "</div>";

    document.body.appendChild(screen);
  }

  function toggle(force) {
    var shouldShow = typeof force === "boolean" ? force : !active;
    if (shouldShow === active) return;
    active = shouldShow;

    if (active) {
      if (!screen) buildScreen();
      screen.style.display = "flex";
      prevTitle = document.title;
      document.title = "main.py - etl-pipeline - Visual Studio Code";
    } else {
      screen.style.display = "none";
      document.title = prevTitle;
    }

    document.dispatchEvent(
      new CustomEvent(active ? "moyu:boss-on" : "moyu:boss-off")
    );
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.preventDefault();
      toggle();
    }
  });

  function initBossButton() {
    var btn = document.createElement("button");
    btn.className = "boss-btn";
    btn.type = "button";
    btn.textContent = "⌨ ESC 老板键";
    btn.title = "按 ESC 或点这里切换到伪装界面";
    btn.addEventListener("click", function () {
      toggle();
    });
    document.body.appendChild(btn);
  }

  function init() {
    initBossButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* ---------- 对外接口 ---------- */

  window.Moyu = {
    store: Store,
    boss: {
      toggle: toggle,
      isActive: function () { return active; }
    }
  };
})();
