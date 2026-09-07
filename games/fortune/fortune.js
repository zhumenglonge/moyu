/* 今日运势：每日一卦 + 谐音梗，可无限续抽 */
(function () {
  "use strict";

  /* 周易卦象：上卦 / 下卦 + 卦名 + 卦辞（原文或白话） */
  var HEXAGRAMS = [
    { up: "☰", down: "☰", name: "乾为天", line: "天行健，君子以自强不息。" },
    { up: "☷", down: "☷", name: "坤为地", line: "地势坤，君子以厚德载物。" },
    { up: "☵", down: "☲", name: "水火既济", line: "水火相济，大事已成——记得收尾。" },
    { up: "☲", down: "☵", name: "火水未济", line: "火在水上，事情未成——再摸一会儿。" },
    { up: "☷", down: "☰", name: "地天泰", line: "天地交而万物通，小往大来，吉。" },
    { up: "☰", down: "☷", name: "天地否", line: "否极泰来，坏运气到头了。" },
    { up: "☶", down: "☵", name: "山水蒙", line: "山下出泉，君子以果行育德。" },
    { up: "☴", down: "☳", name: "风雷益", line: "风雷相助，损上益下，利有攸往。" },
    { up: "☳", down: "☰", name: "雷天大壮", line: "雷在天上，气势正盛，宜乘胜追击。" },
    { up: "☲", down: "☰", name: "火天大有", line: "火在天上，大有——丰收在望。" },
    { up: "☰", down: "☱", name: "天泽履", line: "履道坦坦，幽人贞吉。" },
    { up: "☱", down: "☶", name: "泽山咸", line: "山上有泽，咸——心有灵犀。" },
    { up: "☳", down: "☵", name: "雷水解", line: "雷雨作，解——今天困难解封。" },
    { up: "☴", down: "☷", name: "风地观", line: "风行地上，观——多看少说。" },
    { up: "☵", down: "☶", name: "水山蹇", line: "山上有水，蹇——行路难，宜宅。" },
    { up: "☲", down: "☳", name: "火雷噬嗑", line: "雷电合而章，该咬合的总会咬合。" },
    { up: "☶", down: "☰", name: "山天大畜", line: "天在山中，大畜——攒了一身本事。" },
    { up: "☱", down: "☲", name: "泽火革", line: "泽中有火，革——今天适合改变发型。" },
    { up: "☷", down: "☳", name: "地雷复", line: "雷在地中，复——好运回归。" },
    { up: "☴", down: "☰", name: "风天小畜", line: "风行天上，小畜——小有积蓄，宜苟。" }
  ];

  /* 每条 zh + en，中英都要好笑 */
  var FORTUNES = [
    {
      zh: "大吉！今天上班摸鱼如鱼得水，记得把「摸鱼」写进 OKR。",
      en: "Great luck! You'll slack off like a fish in water today. Remember to put \"goofing off\" into your OKRs."
    },
    {
      zh: "宜喝奶茶。三分糖是留给老板的，你的人生要全糖去冰。",
      en: "A good day for bubble tea. 30% sugar is for your boss; your life deserves full sugar, no ice."
    },
    {
      zh: "今天代码如有神助——报错都懒得找你。",
      en: "The gods are on your side: even the bugs can't be bothered to find you today."
    },
    {
      zh: "柿柿如意！吃个柿子，万事顺柿，好运连连柿。",
      en: "Everything goes \"persimmon-ficently\"! (In Chinese, persimmon sounds like \"everything goes well\")"
    },
    {
      zh: "有薪人！今天努力工作，因为工资是「薪」甘情愿的事。",
      en: "You're a \"salary-man\" with heart: work hard, get paid, stay \"salary-sfied\"."
    },
    {
      zh: "宜早退。走的时候脚步轻一点，别惊动了运气。",
      en: "Good day to leave early. Tiptoe out so you don't wake your good luck."
    },
    {
      zh: "大凶预警：今天开会可能超过一小时，请提前带好干粮。",
      en: "Bad omen: today's meeting may run over an hour. Pack snacks in advance."
    },
    {
      zh: "「蕉」个朋友！今天带根香蕉上班，好运会主动来「找」你。",
      en: "Make a \"bana-friend\"! Bring a banana to work — good luck will come \"a-peel-ing\" to you."
    },
    {
      zh: "今天水逆，但你是水手。逆流而上，摸鱼照旧。",
      en: "Mercury is in retrograde, but you're a sailor. Swim upstream — and slack off as usual."
    },
    {
      zh: "宜开会走神。神游太虚时灵感最活跃，记得带笔回魂。",
      en: "Good day to zone out in meetings. Inspiration strikes while daydreaming — bring a pen for the trip back."
    },
    {
      zh: "无鱼！今天什么都别做，光坐着就能「坐」享其成。",
      en: "No-fish day! (\"Nothing to do\") Do nothing at all — just sit back and \"sea-tle\" in."
    },
    {
      zh: "宜辞职（仅限想想）。想想就好，「辞」要冷静，饭碗要端牢。",
      en: "A good day to quit — in your head only. Think it, don't ink it. Keep the rice bowl steady."
    }
  ];

  /* 第十签彩蛋 */
  var TENTH = {
    zh: "命里有时终须有，命里无时莫强求。第十签已出，天机到此为止。",
    en: "What's yours will find its way to you; what's not, no use chasing. The tenth draw is in — heaven's script ends here."
  };

  var el = {
    date: document.getElementById("date"),
    count: document.getElementById("count"),
    triUp: document.getElementById("tri-up"),
    triDown: document.getElementById("tri-down"),
    guaName: document.getElementById("gua-name"),
    guaLine: document.getElementById("gua-line"),
    zh: document.getElementById("zh"),
    en: document.getElementById("en")
  };

  var redrawBtn = document.getElementById("redraw");
  var drawNo = 1;

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  /* 伪随机：同一天同一签结果一致，续抽才换 */
  var seedState = 1;

  function seed() {
    var s = 0;
    var str = today() + "-" + drawNo;
    for (var i = 0; i < str.length; i++) {
      s = (s * 31 + str.charCodeAt(i)) >>> 0;
    }
    seedState = s || 1;
  }

  /* LCG：同一个种子里连续取值，互相独立 */
  function rnd(n) {
    seedState = (seedState * 1664525 + 1013904223) >>> 0;
    return seedState % n;
  }

  function render() {
    seed();
    var gua = HEXAGRAMS[rnd(HEXAGRAMS.length)];
    var f = FORTUNES[rnd(FORTUNES.length)];

    /* 第十签：天机已泄，其余照常 */
    if (drawNo === 10) f = TENTH;

    var d = new Date();
    var week = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
    el.date.textContent =
      d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 · 星期" + week;

    el.count.textContent = "第 " + drawNo + " 签";
    el.triUp.textContent = gua.up;
    el.triDown.textContent = gua.down;
    el.guaName.textContent = gua.name;
    el.guaLine.textContent = gua.line;
    el.zh.textContent = f.zh;
    el.en.textContent = f.en;

    redrawBtn.textContent = drawNo >= 10 ? "🎲 命里有时终须有，继续抽" : "🎲 再抽一签";
  }

  redrawBtn.addEventListener("click", function () {
    drawNo++;
    render();
  });

  render();
})();
