# 极客密码机 (Geek Code Breaker)

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg?logo=supabase&logoColor=white)

[English Documentation (英文文档)](README.md)

---

## 🚀 项目介绍 (Introduction)

**极客密码机** 是一款现代化、高保真的逻辑解谜 Web 应用，灵感源自经典桌游《珠玑妙算 (Mastermind)》，并在此基础上融入了深度的“赛博朋克”美学风格。

玩家将扮演一名潜入系统内部的黑客，任务是突破 100 层安全防火墙。你需要在有限的尝试次数内，仅凭纯粹的逻辑推理、演绎法和模式识别能力，破解系统生成的颜色加密序列。

本项目不仅是一个游戏，更是**现代前端工程化**的实战展示，演示了如何构建一个具有复杂状态管理、实时云端同步、AI 智能辅助分析以及高性能渲染的生产级应用。

## ✨ 核心特性 (Key Features)

### 🎮 沉浸式游戏体验
*   **百层关卡进阶系统**：精心设计的 100 个关卡战役模式。
*   **动态难度调节**：
    *   **新手区 (1-10关)**：3个密码槽位，帮助玩家熟悉规则。
    *   **黑客区 (11-40关)**：4个密码槽位，标准难度挑战。
    *   **专家区 (41关+)**：5个密码槽位，需要极强的逻辑演绎能力。
*   **里程碑挑战**：每 10 关设有一个“安全核心”里程碑，拥有独特的视觉提示，是检验玩家实力的试金石。

### 🧠 智能 AI 助手
*   **实时熵值分析**：内置的 AI 引擎 (`AIAnalytics.tsx`) 会实时计算当前棋盘状态的**信息熵 (Information Entropy)**，可视化系统中剩余的“混乱度”。
*   **智能演绎引擎**：
    *   分析玩家所有的历史猜测记录。
    *   识别 **“强候选 (Strong Candidates)”**：数学上极有可能属于答案的颜色。
    *   标记 **“排除色 (Dead Colors)”**：逻辑上已被证明不可能存在的颜色。
*   **情感化 AI 人格**：AI 助手会根据你的表现展现出不同的情绪（思考、开心、失望、中立），为孤独的黑客之旅增添一份陪伴感。

### ☁️ 云端同步与身份系统
*   **混合存储架构**：
    *   **本地优先 (Local First)**：游戏进度即时保存至 `localStorage`，实现零延迟更新。
    *   **云端备份**：异步将进度同步至 **Supabase PostgreSQL** 数据库。
*   **无缝会话漫游**：
    *   支持在新设备上匿名游玩。
    *   随时注册/登录账户。
    *   **智能合并**：系统会自动检测并在登录时将你的匿名进度合并到云端账户中，确保数据永不丢失。

### 🎨 赛博朋克设计系统
*   **Tailwind CSS 驱动**：定制的深色模式设计系统 (`designSystem.ts`)，包含：
    *   深邃的靛蓝/板岩色渐变背景 (`bg-slate-950`)。
    *   卡片与面板的玻璃拟态效果 (Glassmorphism)。
    *   交互元素的霓虹光效。
*   **响应式与无障碍**：针对桌面端、平板和移动端视口进行了全方位优化，提供触控友好的操作目标。

### 🔊 实时音频合成
*   **Web Audio API**：游戏不再加载静态的 MP3 文件，而是利用浏览器原生的 `AudioContext` 实时合成音效（振荡器、增益节点）。这带来了：
    *   音频零网络延迟。
    *   极低的内存占用。
    *   基于游戏事件的动态音高调制。

## 🛠️ 技术栈 (Tech Stack)

| 类别 | 技术 | 用途 |
| :--- | :--- | :--- |
| **核心框架** | **React 18** | UI 库 (Hooks, Functional Components) |
| **编程语言** | **TypeScript 5** | 为复杂的逻辑提供严格的类型安全保障 |
| **构建工具** | **Vite 6** | 下一代前端工具链，毫秒级热更新 (HMR) |
| **样式方案** | **Tailwind CSS 3.4** | 原子化 CSS，配合 `clsx` & `tailwind-merge` |
| **后端服务** | **Supabase** | 身份认证、数据库及行级安全策略 (RLS) |
| **图标库** | **Lucide React** | 统一、轻量的 SVG 图标集 |
| **路由管理** | **React Router 7** | 客户端路由管理 |

## 🕹️ 游戏指南 (Gameplay Guide)

1.  **目标**：推导出安全主机生成的隐藏颜色代码。
2.  **进行猜测**：
    *   点击控制面板底部的彩色球体，填满空缺的槽位。
    *   在提交前，你可以随意更改选择。
3.  **解读反馈**：
    *   提交后，你将收到“数据位”反馈（反馈钉）：
    *   ⚫ **黑点**：你选的一个颜色是**正确的**，并且位置也是**正确的**。
    *   ⚪ **白点**：你选的一个颜色是**正确的**，但是位置是**错误的**。
    *   **无点**：该位置的颜色根本不存在于代码中。
4.  **策略**：利用反馈来缩小可能性的范围。如果你得到 2 个黑点和 2 个白点，你就知道这 4 个颜色都是对的，但其中 2 个需要交换位置。

## 📂 项目结构 (Project Structure)

```bash
src/
├── assets/          # 静态资源 (图片, 全局 svg)
├── components/      # 可复用的 React 组件
│   ├── AIAnalytics.tsx  # AI 助手的大脑核心
│   ├── GameLevel.tsx    # 游戏核心循环与棋盘渲染
│   ├── LevelSelector.tsx # 关卡选择网格视图
│   └── ...
├── data/            # 游戏配置与静态数据
│   ├── gameData.ts      # 颜色定义, 难度常量
│   └── levels.ts        # 过程化关卡生成逻辑
├── hooks/           # 自定义 React Hooks
│   └── useTheme.ts      # 主题切换逻辑
├── lib/             # 基础设施代码
│   ├── supabaseClient.ts # 单例 Supabase 客户端
│   └── utils.ts         # CN/Tailwind 辅助函数
├── pages/           # 路由级页面组件
├── theme/           # 设计系统 Token
│   └── designSystem.ts  # 集中式主题配置
├── App.tsx          # 主应用逻辑与 Auth 状态管理
└── main.tsx         # React DOM 入口点
```

## ⚡ 快速开始 (Getting Started)

### 前置要求
*   Node.js (建议 v18 或更高版本)
*   npm 或 yarn

### 安装步骤

1.  **克隆仓库**
    ```bash
    git clone https://github.com/yourusername/geek-code-breaker.git
    cd web
    ```

2.  **安装依赖**
    ```bash
    npm install
    # 推荐使用淘宝镜像源以加速下载
    npm install --registry=https://registry.npmmirror.com
    ```

3.  **环境配置**
    在根目录下创建一个 `.env` 文件（如果有 `.env.example` 可直接复制）：
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *注意：你需要一个配置好 `game_users` 和 `level_progress` 表的 Supabase 项目。*

4.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    在浏览器中打开 `http://localhost:5173`。

## 🤝 贡献指南 (Contributing)

欢迎贡献代码！请随意提交 Pull Request。

1.  Fork 本项目
2.  创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  开启一个 Pull Request

## 📄 许可证 (License)

基于 MIT 许可证分发。详情请参阅 `LICENSE` 文件。
