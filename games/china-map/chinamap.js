/* 中国地图：全国 → 省 → 地级市 → 区县 三级下钻 + 随机抽目的地
 * 边界数据来自高德开放平台 DataV GeoJSON（公开接口，浏览器直连） */
(function () {
  "use strict";

  var GEO_BASE = "https://geo.datav.aliyun.com/areas_v3/bound/";
  /* 省→市→县→乡镇 名称树（乡镇只有名称没有边界），懒加载
   * 实际格式是嵌套字典：{省名: {市名: {县名: [乡镇名, ...]}}} */
  var PCAS_URL = "https://unpkg.com/china-division/dist/pcas.json";
  var ROOT_CODE = "100000";
  var ROOT_NAME = "中国";
  var NS = "http://www.w3.org/2000/svg";
  var PAD = 18;          // 地图四周留白（视图坐标）
  var LABEL_AREA = 1600; // 投影后面积超过它才显示名称，避免小区域文字糊成一团

  var svg = document.getElementById("cm-svg");
  var crumbEl = document.getElementById("cm-crumb");
  var tipEl = document.getElementById("cm-tip");
  var loadingEl = document.getElementById("cm-loading");
  var resultEl = document.getElementById("cm-result");
  var resultPlaceEl = document.getElementById("cm-result-place");
  var resultMsgEl = document.getElementById("cm-result-msg");
  var townsEl = document.getElementById("cm-towns");
  var randomBtn = document.getElementById("cm-random");
  var upBtn = document.getElementById("cm-up");

  var cache = {};     // adcode -> Promise<geojson>
  var trail = [];     // 面包屑：[{code, name}]，最后一项是当前层
  var view = null;    // 当前 viewBox {x, y, w, h}
  var baseView = null;
  var busy = false;
  var dragging = false;
  var moved = false;
  var dragStart = null;

  var DEST_MSGS = [
    "缘分到了，别问，问就是天意。",
    "地图说：就是这儿，买票吧。",
    "人生就像随机数，这次的落点还挺美。",
    "不是你想去哪，是骰子指到哪。",
    "请假理由已帮你想好：说走就走的旅行。",
    "别看了，再摇一次钱包就要哭了。",
    "此地名不见经传，正好没人跟你抢。",
    "命运的齿轮开始转动，目的地已锁定。",
    "摸鱼五分钟，规划旅行两小时。"
  ];

  /* ---------- 数据加载 ---------- */

  function fetchGeo(code) {
    if (!cache[code]) {
      cache[code] = fetch(GEO_BASE + code + "_full.json").then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).catch(function (e) {
        delete cache[code]; // 失败不缓存，下次还能重试
        throw e;
      });
    }
    return cache[code];
  }

  function filterFeatures(geo) {
    return (geo.features || []).filter(function (f) {
      return f.properties && f.properties.name && ringsOf(f.geometry).length > 0;
    });
  }

  /* ---------- 几何工具 ---------- */

  function ringsOf(geom) {
    if (!geom) return [];
    if (geom.type === "Polygon") return geom.coordinates;
    if (geom.type === "MultiPolygon") {
      var out = [];
      (geom.coordinates || []).forEach(function (poly) {
        out.push.apply(out, poly);
      });
      return out;
    }
    return [];
  }

  /* 简单等距圆柱投影：按中心纬度做 cos 修正，bbox 铺满宽 1000 的画布 */
  function makeProjector(feats) {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    feats.forEach(function (f) {
      ringsOf(f.geometry).forEach(function (ring) {
        for (var i = 0; i < ring.length; i++) {
          var lon = ring[i][0], lat = ring[i][1];
          if (lon < minX) minX = lon;
          if (lon > maxX) maxX = lon;
          if (lat < minY) minY = lat;
          if (lat > maxY) maxY = lat;
        }
      });
    });
    var kx = Math.cos(((minY + maxY) / 2) * Math.PI / 180);
    var w = Math.max((maxX - minX) * kx, 1e-6);
    var h = Math.max(maxY - minY, 1e-6);
    var scale = 1000 / w;
    var VH = h * scale;
    return {
      x: function (lon) { return (lon - minX) * kx * scale; },
      y: function (lat) { return VH - (lat - minY) * scale; }
    };
  }

  /* 一个 feature 转成 path 字符串 + 投影后 bbox（顺带抽稀过近的点） */
  function featurePaths(f, proj) {
    var d = "";
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    ringsOf(f.geometry).forEach(function (ring) {
      var started = false, lastX = 0, lastY = 0;
      for (var i = 0; i < ring.length; i++) {
        var x = proj.x(ring[i][0]);
        var y = proj.y(ring[i][1]);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (started && i < ring.length - 1) {
          var dx = x - lastX, dy = y - lastY;
          if (dx * dx + dy * dy < 0.2) continue; // 屏幕上不足 0.45px 的点跳过
        }
        d += (started ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
        lastX = x; lastY = y; started = true;
      }
      if (started) d += "Z";
    });
    return {
      d: d,
      bbox: { minX: minX, maxX: maxX, minY: minY, maxY: maxY }
    };
  }

  /* ---------- 渲染 ---------- */

  function render(feats, hlAdcode) {
    if (!feats.length) return;
    tipEl.style.display = "none"; // 切层后鼠标未动时，避免旧 tooltip 残留
    var proj = makeProjector(feats);

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var gMap = document.createElementNS(NS, "g");
    var gText = document.createElementNS(NS, "g");
    gText.setAttribute("class", "cm-labels");
    var width = 0, height = 0;

    feats.forEach(function (f) {
      var r = featurePaths(f, proj);
      if (!r.d) return;
      var b = r.bbox;
      if (b.maxX > width) width = b.maxX;
      if (b.maxY > height) height = b.maxY;

      var path = document.createElementNS(NS, "path");
      path.setAttribute("d", r.d);
      path.setAttribute("class", "cm-region" +
        (hlAdcode && String(f.properties.adcode) === String(hlAdcode) ? " hl" : ""));
      path.dataset.adcode = f.properties.adcode;
      path.dataset.name = f.properties.name;
      path.dataset.level = f.properties.level || "";
      gMap.appendChild(path);

      var bw = b.maxX - b.minX, bh = b.maxY - b.minY;
      if (bw * bh > LABEL_AREA) {
        var t = document.createElementNS(NS, "text");
        t.setAttribute("x", ((b.minX + b.maxX) / 2).toFixed(1));
        t.setAttribute("y", ((b.minY + b.maxY) / 2).toFixed(1));
        t.setAttribute("font-size", Math.max(9, Math.min(20, Math.sqrt(bw * bh) / 8)).toFixed(1));
        t.textContent = f.properties.name;
        gText.appendChild(t);
      }
    });

    svg.appendChild(gMap);
    svg.appendChild(gText);

    baseView = { x: -PAD, y: -PAD, w: width + PAD * 2, h: height + PAD * 2 };
    resetView();
  }

  /* ---------- 视图控制（缩放 / 平移） ---------- */

  function applyView() {
    svg.setAttribute("viewBox",
      view.x + " " + view.y + " " + view.w + " " + view.h);
  }

  function resetView() {
    view = { x: baseView.x, y: baseView.y, w: baseView.w, h: baseView.h };
    applyView();
  }

  function zoomAt(clientX, clientY, factor) {
    var rect = svg.getBoundingClientRect();
    var mx = view.x + (clientX - rect.left) / rect.width * view.w;
    var my = view.y + (clientY - rect.top) / rect.height * view.h;
    view.w *= factor;
    view.h *= factor;
    view.x = mx - (mx - view.x) * factor;
    view.y = my - (my - view.y) * factor;
    applyView();
  }

  function zoomCenter(factor) {
    var rect = svg.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  /* ---------- 面包屑 ---------- */

  function renderCrumb() {
    crumbEl.innerHTML = "";
    trail.forEach(function (t, i) {
      if (i > 0) {
        var sep = document.createElement("span");
        sep.className = "sep";
        sep.textContent = "›";
        crumbEl.appendChild(sep);
      }
      if (i === trail.length - 1) {
        var cur = document.createElement("span");
        cur.className = "cur";
        cur.textContent = t.name;
        crumbEl.appendChild(cur);
      } else {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cm-crumb-btn";
        btn.textContent = t.name;
        btn.addEventListener("click", function () { gotoLevel(i); });
        crumbEl.appendChild(btn);
      }
    });
    upBtn.disabled = trail.length < 2;
  }

  function gotoLevel(i) {
    if (busy || i === trail.length - 1) return;
    trail = trail.slice(0, i + 1);
    var cur = trail[trail.length - 1];
    hideTowns();
    showLoading(true);
    fetchGeo(cur.code).then(function (geo) {
      hideResult();
      render(filterFeatures(geo));
      renderCrumb();
      showLoading(false);
    }).catch(function () {
      toast("加载失败了，网络似乎开小差，稍后再试试～");
      showLoading(false);
    });
  }

  /* ---------- 乡镇/街道列表（县级以下没有边界多边形，用名称列表呈现） ---------- */

  var pcasPromise = null;

  function loadPcas() {
    if (!pcasPromise) {
      pcasPromise = fetch(PCAS_URL).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).catch(function (e) {
        pcasPromise = null; // 失败不缓存，下次还能重试
        throw e;
      });
    }
    return pcasPromise;
  }

  /* 名称宽松相等：去空格后全等，或前缀匹配且长度接近（如「内蒙古自治区」vs「内蒙古」） */
  function looseEq(a, b) {
    if (!a || !b) return false;
    a = String(a).replace(/\s/g, "");
    b = String(b).replace(/\s/g, "");
    if (a === b) return true;
    return (a.indexOf(b) === 0 || b.indexOf(a) === 0) &&
      Math.abs(a.length - b.length) <= 3;
  }

  /* 在 pcas 嵌套字典里按名称路径深度优先查找，返回末级的乡镇名数组；
   * 允许跳过中间层，兼容直辖市/省直辖县等结构差异 */
  function findTowns(dict, names) {
    function dfs(node, idx) {
      if (idx === names.length) return Array.isArray(node) ? node : null;
      if (!node || typeof node !== "object" || Array.isArray(node)) return null;
      var keys = Object.keys(node);
      for (var i = 0; i < keys.length; i++) {
        if (looseEq(keys[i], names[idx])) {
          var hit = dfs(node[keys[i]], idx + 1);
          if (hit) return hit;
        }
      }
      for (var j = 0; j < keys.length; j++) {
        var skip = dfs(node[keys[j]], idx);
        if (skip) return skip;
      }
      return null;
    }
    return dfs(dict, 0);
  }

  function hideTowns() {
    townsEl.hidden = true;
  }

  function showTowns(countyName, autoPick) {
    var names = trail.slice(1).map(function (t) { return t.name; });
    names.push(countyName);
    loadPcas().then(function (tree) {
      var towns = findTowns(tree, names) || [];
      if (!towns.length) {
        hideTowns();
        toast("「" + countyName + "」的乡镇数据没找到，先看看别处吧～");
        return;
      }
      renderTowns(countyName, towns, autoPick);
    }).catch(function () {
      toast("乡镇数据加载失败了，稍后再试试～");
    });
  }

  function renderTowns(countyName, towns, autoPick) {
    townsEl.innerHTML = "";

    var h = document.createElement("h3");
    h.textContent = countyName + " 下辖的乡镇 / 街道（" + towns.length + " 个）";
    townsEl.appendChild(h);

    var row = document.createElement("div");
    row.className = "cm-town-row";
    var pickIdx = autoPick ? Math.floor(Math.random() * towns.length) : -1;

    towns.forEach(function (t, i) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "cm-town" + (i === pickIdx ? " active" : "");
      chip.title = "就选这儿了？";
      chip.textContent = typeof t === "string" ? t : (t && t.name) || "";
      chip.addEventListener("click", function () {
        var actives = townsEl.querySelectorAll(".cm-town.active");
        Array.prototype.forEach.call(actives, function (el) {
          el.classList.remove("active");
        });
        chip.classList.add("active");
      });
      row.appendChild(chip);
    });
    townsEl.appendChild(row);

    var note = document.createElement("p");
    note.className = "cm-towns-note";
    note.textContent = "村一级全国有 60 万+ 个，数据太庞大就先不做啦 · 点击可选中目的地";
    townsEl.appendChild(note);

    townsEl.hidden = false;
    if (pickIdx >= 0) row.children[pickIdx].scrollIntoView({
      block: "nearest", inline: "center", behavior: "smooth"
    });
  }

  /* ---------- 下钻 / 上钻 ---------- */

  function drill(code, name) {
    if (busy) return;
    hideTowns();
    showLoading(true);
    fetchGeo(code).then(function (geo) {
      var feats = filterFeatures(geo);
      if (!feats.length) {
        toast("「" + name + "」已经是最细一层咯，换个地方点点看～");
        showLoading(false);
        return;
      }
      trail.push({ code: code, name: name });
      hideResult();
      render(feats);
      renderCrumb();
      showLoading(false);
    }).catch(function () {
      toast("「" + name + "」的数据加载失败了，稍后再试试～");
      showLoading(false);
    });
  }

  function goUp() {
    if (trail.length < 2 || busy) return;
    gotoLevel(trail.length - 2);
  }

  /* ---------- 随机目的地 ---------- */

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* 尝试加载某区域的下一级：成功且有数据返回 {parent, feats}，否则 null */
  function tryDrill(feature, delay) {
    return wait(delay).then(function () {
      return fetchGeo(feature.properties.adcode);
    }).then(function (geo) {
      var feats = filterFeatures(geo);
      return feats.length
        ? { parent: { code: feature.properties.adcode, name: feature.properties.name }, feats: feats }
        : null;
    }).catch(function () {
      return null;
    });
  }

  function randomDestination() {
    if (busy) return;
    busy = true;
    randomBtn.disabled = true;
    randomBtn.textContent = "🎲 抽取中…";
    showLoading(true);
    hideResult();
    hideTowns();

    var place = [];

    fetchGeo(ROOT_CODE).then(function (geo) {
      var feats = filterFeatures(geo);
      var province = pick(feats);
      place.push(province.properties.name);
      trail = [{ code: ROOT_CODE, name: ROOT_NAME }];
      render(feats, province.properties.adcode);
      renderCrumb();
      return tryDrill(province, 800);
    }).then(function (r1) {
      if (!r1) return null;
      var city = pick(r1.feats);
      place.push(city.properties.name);
      trail.push(r1.parent);
      render(r1.feats, city.properties.adcode);
      renderCrumb();
      return tryDrill(city, 800);
    }).then(function (r2) {
      if (!r2) return;
      var district = pick(r2.feats);
      place.push(district.properties.name);
      trail.push(r2.parent);
      render(r2.feats, district.properties.adcode);
      renderCrumb();
      return wait(700);
    }).then(function () {
      showLoading(false);
      busy = false;
      randomBtn.disabled = false;
      randomBtn.textContent = "🎲 随机选个目的地";
      showResultCard(place);
    }).catch(function () {
      showLoading(false);
      busy = false;
      randomBtn.disabled = false;
      randomBtn.textContent = "🎲 随机选个目的地";
      toast("抽取失败啦，网络似乎不太给力，再试一次？");
    });
  }

  function showResultCard(place) {
    resultPlaceEl.textContent = place.join(" · ");
    resultMsgEl.textContent = "“" + pick(DEST_MSGS) + "”";
    resultEl.hidden = false;
    /* 抽到了县级，顺便拉出下辖乡镇并随机高亮一个 */
    if (place.length >= 3) showTowns(place[place.length - 1], true);
  }

  function hideResult() {
    resultEl.hidden = true;
  }

  /* ---------- 杂项 UI ---------- */

  function showLoading(show) {
    loadingEl.classList.toggle("show", !!show);
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById("cm-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "cm-toast";
      el.className = "cm-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  /* ---------- 事件绑定 ---------- */

  svg.addEventListener("click", function (e) {
    if (moved) { moved = false; return; } // 刚拖拽完，不算点击
    var t = e.target;
    if (t && t.classList && t.classList.contains("cm-region")) {
      /* 区县以下没有边界数据，改展示下辖乡镇/街道列表 */
      if (t.dataset.level === "district") {
        showTowns(t.dataset.name, false);
        return;
      }
      drill(t.dataset.adcode, t.dataset.name);
    }
  });

  svg.addEventListener("mousemove", function (e) {
    var t = e.target;
    if (t && t.classList && t.classList.contains("cm-region")) {
      tipEl.textContent = t.dataset.name;
      tipEl.style.left = (e.clientX + 14) + "px";
      tipEl.style.top = (e.clientY - 12) + "px";
      tipEl.style.display = "block";
    } else {
      tipEl.style.display = "none";
    }
  });

  svg.addEventListener("mouseleave", function () {
    tipEl.style.display = "none";
  });

  /* 拖拽平移：绑在 window 上，指针跑出地图也能继续拖 */
  svg.addEventListener("pointerdown", function (e) {
    dragging = true;
    moved = false;
    dragStart = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    e.preventDefault();
  });

  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var rect = svg.getBoundingClientRect();
    var dx = (e.clientX - dragStart.x) * view.w / rect.width;
    var dy = (e.clientY - dragStart.y) * view.h / rect.height;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    view.x = dragStart.vx - dx;
    view.y = dragStart.vy - dy;
    applyView();
  });

  window.addEventListener("pointerup", function () {
    dragging = false;
  });

  svg.addEventListener("wheel", function (e) {
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 1.25 : 0.8);
  }, { passive: false });

  document.getElementById("cm-zoom-in").addEventListener("click", function () {
    zoomCenter(0.8);
  });
  document.getElementById("cm-zoom-out").addEventListener("click", function () {
    zoomCenter(1.25);
  });
  document.getElementById("cm-reset").addEventListener("click", resetView);

  randomBtn.addEventListener("click", randomDestination);
  upBtn.addEventListener("click", goUp);
  document.getElementById("cm-again").addEventListener("click", function () {
    hideResult();
    randomDestination();
  });
  document.getElementById("cm-ok").addEventListener("click", hideResult);

  /* ---------- 启动 ---------- */

  fetchGeo(ROOT_CODE).then(function (geo) {
    trail = [{ code: ROOT_CODE, name: ROOT_NAME }];
    render(filterFeatures(geo));
    renderCrumb();
    showLoading(false);
  }).catch(function () {
    loadingEl.textContent = "地图数据加载失败了，请检查网络后刷新重试～";
    loadingEl.classList.add("show");
  });
})();
