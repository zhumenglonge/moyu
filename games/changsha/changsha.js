/* 长沙路线生成器：今天去哪玩、吃什么 */
(function () {
  "use strict";

  /* 每站：emoji + 标题 + 一句话推荐 + 可选标签 */
  var SPOTS = {
    morning: [
      { icon: "🍃", name: "烈士公园", desc: "晨练遛弯看大爷下棋，湖边长椅发呆首选。", tags: ["免费", "好停车"] },
      { icon: "🖼️", name: "湖南博物院", desc: "看辛追娭毑和千年湘绣，记得提前几天预约。", tags: ["免费", "要预约"] },
      { icon: "📚", name: "后湖艺术区", desc: "湖边咖啡馆配美术馆，出片率极高。", tags: ["文艺", "好出片"] },
      { icon: "🏮", name: "开福寺", desc: "市中心古寺，烧香拜佛顺便求个「今天不加班」。", tags: ["免费", "香火旺"] },
      { icon: "🌿", name: "岳麓山", desc: "东门上山南门下山，爱晚亭打卡，就当免费健身。", tags: ["免费", "费腿"] },
      { icon: "🥬", name: "碧湘街早市", desc: "南门口百年菜市场街，糖油粑粑、捆鸡、葱油粑粑边走边吃，剁辣椒当伴手礼；早上八九点最热闹，还能顺路扫荡长郡中学美食街。", tags: ["免费", "烟火气"] }
    ],
    lunch: [
      { icon: "🍜", name: "甘长顺 · 鸡丝火粉", desc: "百年老号，一碗鸡丝粉汤头清亮，长沙人的早餐胃也认它当午饭。", tags: ["老字号", "人均 20"] },
      { icon: "🍲", name: "公交新村粉店", desc: "社区苍蝇馆子，肉丝粉加酸辣，本地人排队那种。", tags: ["苍蝇馆子", "人均 15"] },
      { icon: "🍚", name: "大碗先生", desc: "湖南家常菜连锁，肉炒肉配钵子菜，便宜大碗。", tags: ["连锁", "人均 40"] },
      { icon: "🥘", name: "玉楼东", desc: "湘菜老字号，组庵豆腐和麻辣子鸡一次吃明白。", tags: ["老字号", "人均 80"] },
      { icon: "🦆", name: "杨裕兴 · 旁边随便吃", desc: "解放西路老街溜达，看哪家本地人多进哪家。", tags: ["随缘", "看运气"] }
    ],
    afternoon: [
      { icon: "🏫", name: "岳麓书院", desc: "千年学府，「惟楚有材」牌匾下感受文化人的快乐。", tags: ["门票 40", "顺路爱晚亭"] },
      { icon: "🚢", name: "橘子洲头", desc: "看青年毛主席雕像，江风一吹什么烦恼都吹跑了。", tags: ["免费", "小火车 20"] },
      { icon: "☕", name: "西园北里 / 白沙路咖啡", desc: "老巷子咖啡店连成片，坐一下午也不腻。", tags: ["文艺", "适合发呆"] },
      { icon: "🛍️", name: "IFS 国金中心", desc: "楼顶 KAWS 雕塑打卡，顺便吹空调逛商场。", tags: ["免费", "吹空调"] },
      { icon: "🎨", name: "谢子龙影像艺术馆", desc: "白色清水混凝土建筑，展览和出片都在线。", tags: ["要预约", "好出片"] },
      { icon: "🚌", name: "湘江双层观光巴士", desc: "全景天窗双层巴士，碧沙湖出发串起潮宗街、文和友、杜甫江阁，一圈 30-50 分钟；每日 10:00-22:00 约 15 分钟一班，周日 14:00-16:00 车上有小剧目彩蛋，也可从地铁 3 号线「第一师范东」附近上车。", tags: ["单次 10", "日票 25"] }
    ],
    dinner: [
      { icon: "🔥", name: "笨萝卜浏阳菜馆", desc: "蒸菜小碗摆一桌，人均 40 吃出满汉全席的气势。", tags: ["蒸菜", "人均 40"] },
      { icon: "🌶️", name: "费大厨辣椒炒肉", desc: "一碗辣椒炒肉配五碗米饭不是传说，排队要趁早。", tags: ["排队", "人均 70"] },
      { icon: "🦐", name: "文和友（海信广场）", desc: "80 年代老长沙场景还原，吃小龙虾顺便穿越。", tags: ["网红", "人均 120"] },
      { icon: "🍲", name: "壹盏灯", desc: "长沙土著认可的下饭菜，鸭掌筋是隐藏王牌。", tags: ["本地推", "人均 60"] },
      { icon: "🍢", name: "冬瓜山夜宵街", desc: "肉肠、紫苏桃子姜、小龙虾，一条街解决战斗。", tags: ["夜宵", "人均 50"] }
    ],
    night: [
      { icon: "🌃", name: "杜甫江阁 · 江边散步", desc: "湘江边吹风看夜景，周末还有焰火（记得查时间）。", tags: ["免费", "看焰火"] },
      { icon: "🎤", name: "解放西 · 酒吧街", desc: "年轻人的快乐老家，能闹到凌晨的长沙不夜街。", tags: ["夜猫子", "费钱包"] },
      { icon: "🍵", name: "都正街 / 白果园", desc: "老巷子夜里灯笼亮起，安安静静逛一逛。", tags: ["免费", "安静"] },
      { icon: "🎡", name: "世界之窗 or 湘江游轮", desc: "夜景换个角度看，江上吹风别有味道。", tags: ["要门票", "看江景"] },
      { icon: "📽️", name: "回酒店点茶颜外卖", desc: "玩累了？幽兰拿铁外卖到房间，完美的收尾。", tags: ["躺平", "人间清醒"] }
    ],
    dessert: [
      { icon: "🍵", name: "茶颜悦色 · 幽兰拿铁", desc: "来长沙不喝茶颜等于白来，碧根果碎是灵魂。", tags: ["人均 18", "遍地都是"] },
      { icon: "🖤", name: "黑色经典臭豆腐", desc: "外酥里嫩浇蒜水，闻着争议吃着真香。", tags: ["人均 10", "路边摊"] },
      { icon: "🍑", name: "紫苏桃子姜", desc: "酸甜咸辣一口闷，长沙限定怪好吃。", tags: ["人均 8", "解辣神器"] },
      { icon: "🥭", name: "果呀呀 · 水果茶", desc: "本地水果茶之光，芒果系列闭眼点。", tags: ["人均 22", "水果自由"] },
      { icon: "🍡", name: "糖油粑粑", desc: "糯叽叽炸糖团子，刚出锅的最香，小心烫嘴。", tags: ["人均 5", "趁热吃"] }
    ]
  };

  var THEMES = [
    { name: "文化暴走一日游", theme: "博物馆 + 老字号", focus: ["morning", "lunch", "afternoon", "dinner", "night"] },
    { name: "山水治愈路线", theme: "岳麓山 + 湘江", focus: ["morning", "lunch", "afternoon", "dinner", "night"] },
    { name: "干饭人主场", theme: "一天五顿不带怕", focus: ["lunch", "dessert", "afternoon", "dinner", "dessert"] },
    { name: "文艺出片路线", theme: "美术馆 + 咖啡巷", focus: ["morning", "dessert", "afternoon", "dinner", "night"] },
    { name: "躺平散步路线", theme: "不赶时间，走到哪算哪", focus: ["morning", "lunch", "dessert", "afternoon", "night"] }
  ];

  var SLOT_LABEL = {
    morning: "上午",
    lunch: "午饭",
    afternoon: "下午",
    dinner: "晚饭",
    night: "夜里",
    dessert: "加餐"
  };

  var routeEl = document.getElementById("route");
  var nameEl = document.getElementById("plan-name");
  var themeEl = document.getElementById("plan-theme");
  var rerollBtn = document.getElementById("reroll");
  var copyBtn = document.getElementById("copy");

  var seedState = 1;

  function rnd(n) {
    seedState = (seedState * 1664525 + 1013904223) >>> 0;
    return seedState % n;
  }

  function pick(arr) {
    return arr[rnd(arr.length)];
  }

  var current = { theme: null, stops: [] };

  function render() {
    seedState = (Date.now() ^ 0x9e3779b9) >>> 0;
    if (seedState === 0) seedState = 1;

    var t = pick(THEMES);
    var used = {};
    current.theme = t;

    /* 主题 focus 里可能出现两个 dessert，去重后逐槽抽 */
    current.stops = [];
    t.focus.forEach(function (slot) {
      if (used[slot]) return;
      used[slot] = true;
      var pool = SPOTS[slot];
      var s = pool[rnd(pool.length)];
      /* 同一地点尽量不连着两天出现，这里简单接受重复 */
      current.stops.push({ slot: slot, spot: s });
    });

    nameEl.textContent = t.name;
    themeEl.textContent = t.theme;

    routeEl.innerHTML = current.stops.map(function (stop) {
      var s = stop.spot;
      var tags = (s.tags || []).map(function (tag) {
        return '<span class="cs-tag">' + tag + "</span>";
      }).join("");
      return (
        '<li class="cs-stop">' +
        '<div class="cs-dot"><span>' + s.icon + "</span></div>" +
        '<div class="cs-body">' +
        '<div class="cs-slot">' + SLOT_LABEL[stop.slot] + "</div>" +
        '<div class="cs-name">' + s.name + "</div>" +
        '<p class="cs-desc">' + s.desc + "</p>" +
        '<div class="cs-tags">' + tags + "</div>" +
        "</div></li>"
      );
    }).join("");
  }

  function routeText() {
    var lines = ["【" + current.theme.name + "】" + current.theme.theme];
    current.stops.forEach(function (stop) {
      lines.push(SLOT_LABEL[stop.slot] + "：" + stop.spot.name + " —— " + stop.spot.desc);
    });
    lines.push("（由摸鱼大厅 🌶️ 长沙路线生成器摇出）");
    return lines.join("\n");
  }

  rerollBtn.addEventListener("click", render);

  copyBtn.addEventListener("click", function () {
    var self = this;
    navigator.clipboard.writeText(routeText()).then(function () {
      self.textContent = "✅ 已复制";
      setTimeout(function () { self.textContent = "📋 复制路线"; }, 1600);
    }).catch(function () {
      self.textContent = "❌ 复制失败";
      setTimeout(function () { self.textContent = "📋 复制路线"; }, 1600);
    });
  });

  render();
})();
