/* 国庆去哪玩：★武汉已定 → A~D 核心档守高铁 3h 圈 → E~H 遐想档（给群里留念想） */
(function () {
  "use strict";

  /* 七字段统一键序：花几天 / 怎么去 / 花费 / 每日安排 / 坑 / 吃什么（拥挤度单独渲染星级） */
  var ROUTES = [
    {
      id: "wuhan",
      icon: "🌊",
      name: "★ · 武汉",
      tagline: "过早吃到扶墙，江滩看到天黑",
      label: "已定目的地",
      mod: "gq-mod-river",
      crowd: 4,
      crowdNote: "黄鹤楼国庆人从众，但武汉三镇够你散开",
      fields: {
        duration: "2 天 1 晚（宿武昌，两天覆盖武汉三镇精华）",
        getThere: "自驾：长沙→武汉约 350km，许广/京港澳高速约 4h；国庆 7 座以下小客车高速免费；市内地铁+停车结合，跨江走长江大桥（客车免费）",
        budget: "人均 ¥400~600：油费往返 ~400 + 高速免费（国庆）车内均摊 + 过早/正餐 80~120/天 + 景点（东湖免费 + 省博免费 + 黄鹤楼只外观）+ 停车费 + 住宿 1 晚 200~350",
        itinerary: [
          { day: "Day1", plan: "清早 6 点前出发避首日车流，中午前后到武汉直接停粮道街/水塔附近吃午过（热干面+豆皮+糊汤粉一套连击），下午湖北省博物馆（曾侯乙编钟+越王勾践剑，免费需预约），傍晚东湖绿道散步或听涛片区发呆，晚上楚河汉街逛吃，宿武昌" },
          { day: "Day2", plan: "上午车停黄鹤楼停车场，阅马场红墙远观拍照（不上楼）→步行桥头堡看长江大桥，开车过桥到汉口（桥面客车免费，江景一遍带走），黎黄陂路老租界+江汉路过个消食午饭后 15 点前出发返长，避开尾日车流晚饭前到家" }
        ],
        pitfalls: "国庆首日尾日京港澳长沙—武汉段车流大，去程赶早、返程 15 点前走或晚 8 点后走；汉口老租界片区巷子窄停车难，统一停商场地下库再步行；武汉长江隧道收费过桥免费，导航别被带去交隧道费；户部巷全是外地游客本地人不去——过早认准粮道街、水塔；黄鹤楼 70 块门票不值得，阅马场外观更美还免费；省博国庆预约秒没，提前 3 天 0 点蹲公众号放票；10 月正热且干，防晒+补水别大意",
        food: "热干面（蔡林记连锁即可，街边小摊更香）、三鲜豆皮、糊汤粉配油条、排骨藕汤（靓王汤煲）、周黑鸭/精武鸭脖（带回长沙当零食）、面窝、蛋酒、梁子湖大闸蟹（10 月正肥）"
      }
    },
    {
      id: "hengshan",
      icon: "🏔",
      name: "A · 南岳衡山",
      tagline: "拜寿岳看日出，成熟景区不虐腿",
      label: "文化线",
      mod: "gq-mod-warn",
      crowd: 4,
      crowdNote: "人多，但大山装得下",
      fields: {
        duration: "3 天 2 晚（山顶 1 晚 + 衡阳市区 1 晚）",
        getThere: "长沙南→衡山西高铁约 40 分钟，出站打车/大巴 20 分钟到山脚；自驾约 2h",
        budget: "人均 ¥600~900：门票 120 + 上行索道/环保车约 45 + 高铁往返 ~140 + 山顶住宿 150~300",
        itinerary: [
          { day: "Day1", plan: "中午到山脚，转运车上山，半山亭→祝融峰慢走上山，宿山顶等星星" },
          { day: "Day2", plan: "祝融峰日出→索道下山→南岳大庙踩点「寿」字，傍晚转场衡阳市区，晚上湘江边夜宵" },
          { day: "Day3", plan: "石鼓书院或衡阳工业博物馆晃一圈，午饭后高铁回长沙" }
        ],
        pitfalls: "国庆索道排队 1~2 小时起步，赶日出建议步行下行动线倒着走；山顶夜里 5℃ 上下，冲锋衣别嫌土；大庙门口「免费领香」的都是套路",
        food: "衡阳鱼粉（清早一碗魂都醒了）、钵子菜、荷叶粑"
      }
    },
    {
      id: "mangshan",
      icon: "🌄",
      name: "B · 莽山 + 东江湖",
      tagline: "清早雾漫小东江，山顶蹲老秃顶云海",
      label: "湖景云海线",
      mod: "gq-mod-accent",
      crowd: 3,
      crowdNote: "粤北湘南两头客，假期头三天后变多",
      fields: {
        duration: "3 天 2 晚（资兴 1 晚 + 山顶 1 晚）",
        getThere: "长沙南→郴州西高铁约 1.5h，出站租车：先往资兴东江湖约 1h，再南下宜章莽山约 1.5h；自驾全程约 3.5h",
        budget: "人均 ¥600~900：东江湖门票约 60 + 莽山门票约 80 + 景区观光车/索道另计 + 高铁往返 ~260 + 租车油费住宿均摊",
        itinerary: [
          { day: "Day1", plan: "高铁到郴州西租车北上资兴，下午东江湖畔大坝/江湾湿地走走，宿资兴湖畔" },
          { day: "Day2", plan: "清早 6:30 起蹲雾漫小东江撒网（4~10 月清晨几率高），上午租车南下莽山：主峰线鸡心石、台渡石方塔群，下午金鞭大峡谷，宿山顶" },
          { day: "Day3", plan: "老秃顶日出云海，下山顺路猛坑晃一圈，还车回郴州西高铁回长沙" }
        ],
        pitfalls: "山顶房少，国庆必须提前两周订；小东江雾要清早抢 6:30~8:00 的窗口，错过就是白水面；自驾盘山路 400 多个弯，晕车党备药+后排坐好",
        food: "东江鱼游合水（鱼宴）、宜章莽山黑豚、临武鸭、郴州烧鸡公（辣得清醒）"
      }
    },
    {
      id: "langshan",
      icon: "🌶",
      name: "C · 邵阳崀山",
      tagline: "世界遗产丹霞，人少到不像话",
      label: "风景线",
      mod: "gq-mod-bad",
      crowd: 2,
      crowdNote: "世遗里最冷门的，放心",
      fields: {
        duration: "4 天 3 晚（只有 3 天就砍 Day4 竹筏日，骆驼峰环线压缩到半天）",
        getThere: "长沙南→邵阳北高铁 1h，租车 1.5h 到新宁；或长沙汽车南站直达新宁大巴约 4h",
        budget: "人均 ¥900~1300：崀山联票（3 日）约 136 + 高铁往返 ~180 + 租车均摊 250 + 住宿 3 晚 300",
        itinerary: [
          { day: "Day1", plan: "上午出发，下午到崀山镇，起凤山或将军石江边看日落，夜宿县城" },
          { day: "Day2", plan: "八角寨缆车上观「中国最美丹霞」龙脊，上午云海概率最高；下午天生桥→骆驼峰环线约 4h" },
          { day: "Day3", plan: "辣椒峰全天：鞋尖顶、马头岭崖壁线（恐高党绕行），下午老虎扬石" },
          { day: "Day4", plan: "夫夷江竹筏顺流看八角寨正面，中午返程（压缩方案：直接跳过此天）" }
        ],
        pitfalls: "县域班次极少，强烈建议邵阳北站租车；骆驼峰/马头岭段偶有养护封闭，行前查崀山官方公众号；自驾山路弯多，新手慎租车",
        food: "新宁血浆鸭、蕨菜粑粑、三色糯米饭"
      }
    },
    {
      id: "meijiang",
      icon: "⛺",
      name: "D · 娄底湄江",
      tagline: "喀斯特峡谷+湖，几乎没有旅行团",
      label: "避世线",
      mod: "gq-mod-good",
      crowd: 1,
      crowdNote: "小众中的小众，随便玩",
      fields: {
        duration: "3 天 2 晚（可加紫鹊界梯田 1 天凑 4 天）",
        getThere: "纯自驾：长沙→湄江约 2h（龙紫塘高速直接到，最省心的线）；高铁长沙南→娄底南 40 分钟出站再开车 40 分钟",
        budget: "人均 ¥400~600：景区门票很低塞海湖环湖免费 + 油费过路费均摊 + 露营免费 / 客栈 120 上下",
        itinerary: [
          { day: "Day1", plan: "上午自驾到湄江，下午观音崖水帘洞 + 十里测峡看夕阳，夜宿景区或湖边扎营" },
          { day: "Day2", plan: "一天环线核心：石门冲、海上梅山石柱群、香炉山草甸轻度徒步 2~3h" },
          { day: "Day3", plan: "塞海湖环湖发呆补觉，午后来一回紫鹊界梯田（车程 1h）再回长沙，或直接回程" }
        ],
        pitfalls: "部分峡谷段手机没信号，导航提前下离线包；景区内餐饮选择少，出发前把冰箱塞满；公共交通只到镇口，不自驾基本玩不转",
        food: "娄底钵子菜、青树坪米粉、紫鹊界梯田大米饭"
      }
    },
    {
      id: "guilin",
      icon: "🎋",
      name: "E · 桂林（阳朔 + 龙脊）",
      tagline: "遇龙河竹筏顺水，龙脊梯田正金黄",
      label: "山水田园线",
      tier: "dream",
      mod: "gq-mod-teal",
      crowd: 3,
      crowdNote: "桂林市区人多，阳朔龙脊把人分流",
      fields: {
        duration: "4 天 3 晚（3 天就砍龙脊，只玩阳朔段）",
        getThere: "长沙南→桂林西高铁约 3~3.5h；到桂林后高铁/大巴去阳朔约 1h，龙脊另包车上山约 2h",
        budget: "人均 ¥1000~1500：高铁往返 ~360 + 遇龙河竹筏约 200/筏 + 龙脊门票 100 + 住宿 3 晚 400 上下",
        itinerary: [
          { day: "Day1", plan: "高铁到桂林，下午象鼻山/东西巷打个卡，晚上两江四湖夜骑或滨江湖吃啤酒鱼，宿市区" },
          { day: "Day2", plan: "车往阳朔，下午遇龙河竹筏（清水段→工农桥）顺水看倒影，晚上西街喀斯特酒吧闹一闹，宿阳朔" },
          { day: "Day3", plan: "早起兴坪相框山打卡 20 元人民币背景，下午包车上龙脊：金坑大寨看层田日落，宿吊脚楼" },
          { day: "Day4", plan: "平安堡清晨看层田晨雾，盘山路回桂林还车，赶下午高铁回长沙（压缩方案：跳过 Day3~4，Day3 上午兴坪后直接回）" }
        ],
        pitfalls: "国庆竹筏必须提前网上约场次，现场排队 2h 起；龙脊盘山路弯多易晕车，备药；桂林站在市区外 20km，买票看清是桂林西还是桂林站",
        food: "桂林米粉（巷子里 6 块一碗那种）、阳朔啤酒鱼、龙脊竹筒饭、恭城油茶"
      }
    },
    {
      id: "yunnan",
      icon: "🍄",
      name: "F · 云南（昆明 + 建水）",
      tagline: "古城坐小火车，红土地调色盘正上漆",
      label: "高原古城线",
      tier: "dream",
      mod: "gq-mod-accent2",
      crowd: 3,
      crowdNote: "大理丽江才是人从众，建水冷门得多",
      fields: {
        duration: "4 天 3 晚（飞行 1.5h 往返，不占赶路额度）",
        getThere: "长沙黄花→昆明长水飞机约 1.5h；昆明南→建水高铁约 1.5h 或包车 3h；东川红土地距昆明包车约 3h",
        budget: "人均 ¥1500~2200：国庆机票往返 800~1200 + 高铁/包车 300 + 朱家花园等门票 100 + 住宿 3 晚",
        itinerary: [
          { day: "Day1", plan: "飞抵昆明，翠湖→陆军讲武堂→南屏街吃汽锅鸡，晚上昆明老街卤味摊，宿市区" },
          { day: "Day2", plan: "高铁/包车到建水，下午朱家花园 + 建水文庙，傍晚坐米轨小火车看双龙桥日落，宿古城" },
          { day: "Day3", plan: "清早逛建水井市场吃烧豆腐早点，上午团山古民居，下午回昆明，顺路甸中镇吃卤牛肉，宿昆明" },
          { day: "Day4", plan: "包车半天扫东川红土地：落霞沟打转，红土 + 绿荞 + 黄花色块最分明时，傍晚赶机回长沙（压缩方案：砍东川，Day4 市区斗南花市买便宜花带回去）" }
        ],
        pitfalls: "国庆机票越等越贵要早买；高原紫外线狠、早晚温差大，薄外套必带；建水古城商业化重，住新城走进去更清净",
        food: "汽锅鸡、过桥米线、建水烧豆腐（满街炉子坐着吃）、烧鸡米线、野菌火锅（尾季碰碰运气）"
      }
    },
    {
      id: "guizhou",
      icon: "🏮",
      name: "G · 贵州（西江千户苗寨 + 镇远）",
      tagline: "苗寨吊脚楼亮灯，舞阳河绕古城",
      label: "苗侗文化线",
      tier: "dream",
      mod: "gq-mod-brown",
      crowd: 3,
      crowdNote: "千户寨国庆人多，但寨子大撑得住",
      fields: {
        duration: "3 天 2 晚（寨子 1 晚 + 镇远 1 晚）",
        getThere: "长沙南→凯里南高铁约 2~2.5h（沪昆线直达）；凯里→西江苗寨大巴约 1h；凯里→镇远火车 1h / 大巴 2h",
        budget: "人均 ¥600~900：高铁往返 ~280 + 苗寨门票含观光车约 90 + 寨内住宿 200 上下 + 镇远免费",
        itinerary: [
          { day: "Day1", plan: "高铁到凯里转大巴进寨，下午嘎歌古巷看银饰锻制/蜡染，晚上走一号观景台看千户灯火，宿吊脚楼" },
          { day: "Day2", plan: "清早薄雾中沿河逛寨脚，上午踩鼓场看歌舞表演，下午车往镇远，晚上舞阳河灯光 + 歪门巷夜市，宿古城客栈" },
          { day: "Day3", plan: "上午石屏山俯瞰 S 形舞阳河绕古城，中午古城午饭，下午火车回凯里赶高铁回长沙（进阶方案：加 Day4 去施秉云台山或郎德上寨，人更少原生态）" }
        ],
        pitfalls: "国庆千户寨观光电梯是地狱，宁可走 20 分钟山路去一号观景台；寨内住宿隔音差且潮，对睡眠苛刻的住凯里市区每天往返；酸汤接受不了提前说，很多店可点鸳鸯锅",
        food: "酸汤鱼（凯里老凯侬）、苗家腊肉、米豆腐、镇远道菜、社饭"
      }
    },
    {
      id: "chongqing",
      icon: "🍲",
      name: "H · 重庆（山城城区）",
      tagline: "不爬山不赶景点，就是一座火锅馆子主题乐园",
      label: "山城美食线",
      tier: "dream",
      mod: "gq-mod-fog",
      crowd: 5,
      crowdNote: "洪崖洞国庆人从众，但重庆大到容得下",
      fields: {
        duration: "3 天 2 晚（纯城区，零赶路）",
        getThere: "长沙黄花→重庆江北飞机约 1.5h；直达高铁约 4.5~5h（赶时间选飞机，不赶时间选高铁省钱）",
        budget: "人均 ¥1100~1800：机票往返 600~1000 + 轻轨/索道/过江轮渡交通 50 + 火锅三次 300 + 住宿 2 晚",
        itinerary: [
          { day: "Day1", plan: "落地地铁到解放碑，下午八一路好吃街边走边吃，傍晚千厮门大桥看洪崖洞亮灯（对岸拍全景，不进去挤），宿江景民宿" },
          { day: "Day2", plan: "上午李子坝轨道穿楼打卡→鹅岭公园俯瞰两江，下午长江索道（提前约票）→下浩里老街，晚上观音桥本地人火锅局" },
          { day: "Day3", plan: "上午磁器口古镇（比市区人少，赶早去赶早回），中午吃碗豌杂面，下午南山一棵树或老君洞喝茶看城景，傍晚航班回长沙" }
        ],
        pitfalls: "重庆导航是玄学，你以为在一楼其实在十一楼，问路比看地图靠谱；洪崖洞白天没灯不值得挤，晚上远观即可；国庆机票酒店双贵，至少提前两周订；不吃辣者慎点老店九宫格，微辣是重庆最后的温柔",
        food: "九宫格老火锅（观音桥本地馆子随便进）、豌杂小面、豆花饭、陈麻花、万州烤鱼"
      }
    }
  ];

  var FIELD_ORDER = [
    ["duration", "花几天"],
    ["getThere", "怎么去"],
    ["budget", "花费"],
    ["itinerary", "每日安排"],
    ["pitfalls", "坑"],
    ["food", "吃什么"]
  ];

  var gridEl = document.getElementById("routes");
  var countdownEl = document.getElementById("countdown");

  function stars(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += i <= n ? "★" : "☆";
    return s;
  }

  /* ---------- 情报卡渲染 ---------- */

  function renderCards() {
    gridEl.innerHTML = ROUTES.map(function (r) {
      var rows = FIELD_ORDER.map(function (pair) {
        var key = pair[0], label = pair[1];
        if (key === "itinerary") {
          return '<div class="gq-days">' +
            '<div class="gq-days-label">每日安排</div>' +
            r.fields.itinerary.map(function (d) {
              return '<div class="gq-day"><span class="gq-dot"></span>' +
                '<b>' + d.day + '</b><span class="gq-plan">' + d.plan + '</span></div>';
            }).join("") + "</div>";
        }
        return '<div class="gq-row"><span class="gq-label">' + label + "</span>" +
          '<span class="gq-val">' + r.fields[key] + "</span></div>";
      }).join("");

      return '<article class="gq-card ' + r.mod + '">' +
        '<header class="gq-head">' +
        '<span class="gq-icon">' + r.icon + "</span>" +
        '<div class="gq-title"><h2>' + r.name + "</h2>" +
        '<p>' + r.tagline + "</p></div>" +
        (r.tier === "dream" ? '<span class="gq-dream">遐想档</span>' : "") +
        '<span class="gq-badge">' + r.label + "</span>" +
        "</header>" +
        '<div class="gq-row gq-crowd"><span class="gq-label">拥挤度</span>' +
        '<span class="gq-stars">' + stars(r.crowd) + "</span>" +
        '<span class="gq-note">' + r.crowdNote + "</span></div>" +
        rows +
        '<button class="btn primary gq-copy" type="button" data-id="' + r.id + '">📋 复制这条路线发群</button>' +
        '<p class="gq-foot">ℹ 信息为 2026 年国庆前整理，出行前核实</p>' +
        "</article>";
    }).join("");
  }

  /* ---------- 国庆倒计时 ---------- */

  function dayDiff(a, b) {
    return Math.round((b.getTime() - a.getTime()) / 86400000);
  }

  function localDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function countdownText(now) {
    var d = localDay(now);
    var oct1 = new Date(d.getFullYear(), 9, 1);
    var oct8 = new Date(d.getFullYear(), 9, 8);
    if (d < oct1) {
      return { text: "距离国庆还有 " + dayDiff(d, oct1) + " 天", state: "gq-accent", sub: "票可以现在就开始抢了。" };
    }
    if (d < oct8) {
      return { text: "🎉 假期进行时", state: "gq-good", sub: "别摸鱼了，快出门。" };
    }
    return {
      text: "距下次国庆还有 " + dayDiff(d, new Date(d.getFullYear() + 1, 9, 1)) + " 天",
      state: "gq-dim",
      sub: "班是上不完的，假是会再有的。"
    };
  }

  function renderCountdown() {
    var c = countdownText(new Date());
    countdownEl.className = "gq-countdown " + c.state;
    countdownEl.innerHTML = "<b>" + c.text + "</b><span>" + c.sub + "</span>";
  }

  /* ---------- 复制发群 ---------- */

  function routeText(r) {
    var lines = ["【" + r.name.replace(/^[\w★]+\s·\s/, "") + " · " + r.label + "】" + r.tagline];
    FIELD_ORDER.forEach(function (pair) {
      var key = pair[0];
      if (key === "itinerary") {
        lines.push("每日安排：");
        r.fields.itinerary.forEach(function (d) { lines.push("　" + d.day + "：" + d.plan); });
      } else {
        lines.push(pair[1] + "：" + r.fields[key]);
      }
    });
    lines.push("拥挤度：" + stars(r.crowd));
    lines.push("（来自摸鱼大厅 🇨🇳 国庆去哪玩）");
    return lines.join("\n");
  }

  gridEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".gq-copy");
    if (!btn) return;
    var route = ROUTES.filter(function (r) { return r.id === btn.dataset.id; })[0];
    var self = btn;
    navigator.clipboard.writeText(routeText(route)).then(function () {
      self.textContent = "✅ 已复制，发群里吧";
    }).catch(function () {
      self.textContent = "❌ 复制失败，长按手动选吧";
    }).then(function () {
      setTimeout(function () { self.textContent = "📋 复制这条路线发群"; }, 1600);
    });
  });

  renderCards();
  renderCountdown();
})();
