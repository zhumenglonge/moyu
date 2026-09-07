# 🐟 摸鱼大厅

上班摸鱼专用静态游戏站，纯 HTML/CSS/JS，零依赖、零构建。

**在线体验**：<https://zhumenglonge.github.io/moyu/>

## 内置游戏

| 游戏 | 玩法 |
| --- | --- |
| 🐍 贪吃蛇 | 方向键 / WASD，越吃越快 |
| 📦 推箱子 | 10 个关卡，Z 撤销、R 重开 |
| 🔢 2048 | 方向键合并，冲击 2048 |
| 🧱 俄罗斯方块 | 旋转/软降/硬降，消行得分 |

**老板键**：任意页面按 `ESC`（或点右下角按钮），瞬间伪装成 VS Code 写代码界面，游戏自动暂停；再按 `ESC` 恢复。

最高分与过关进度保存在浏览器 localStorage（`moyu.*`）。

## 本地预览

```bash
cd 本目录
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 部署说明

站点已配置 GitHub Actions 工作流（`.github/workflows/deploy.yml`），推送到 `main` 分支即自动发布到 GitHub Pages。

仓库地址：<https://github.com/zhumenglonge/moyu>

站点全部使用相对路径，放任何子路径下都能正常工作。

## 目录结构

```
├── index.html          # 游戏大厅
├── css/style.css       # 全站样式（含老板键伪装界面）
├── js/common.js        # 老板键 + localStorage 工具
└── games/
    ├── snake/          # 贪吃蛇
    ├── sokoban/        # 推箱子
    ├── 2048/           # 2048
    └── tetris/         # 俄罗斯方块
```

加新游戏：在 `games/` 下新建目录，写自己的 `index.html` + JS，然后在 `index.html` 大厅里加一张卡片即可。

> 友情提示：摸鱼有风险，玩耍需谨慎。
