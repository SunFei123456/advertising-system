# NAES 控制台管理（Admin Console）

## Setup

Install the dependencies:

```bash
npm install
```

## Get started

Start the dev server, and the app will be available at [http://localhost:8080](http://localhost:8080).

```bash
npm run dev
```

Build the app for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Learn more

To learn more about Rspack, check out the following resources:

- [Rspack documentation](https://rspack.dev) - explore Rspack features and APIs.
- [Rspack GitHub repository](https://github.com/web-infra-dev/rspack) - your feedback and contributions are welcome!

---

# 项目简介
一个基于 React + Rspack + Tailwind CSS 的后台管理控制台，内置 Dashboard 概览、消息数据表格（DataTablePro）、多图表方案与国际化支持。

# 功能特性
- **Dashboard 概览**：KPI（总量、近7天新增、最新日期、公司数）、近30天趋势、Top Companies、最近消息表。
- **高性能表格 DataTablePro**：受控的服务端分页/排序、列宽拖拽、列可见性、密度切换、固定表头、加载骨架与空状态。
- **图表（组合A）**：
  - 近30天趋势：`uPlot`（极轻量、高性能）。
  - Top Companies：`@nivo/bar`（默认美观、主题友好）。
  - 可选保留：`ECharts` 通用封装（`src/components/EChart.jsx`），用于复杂图形。
- **国际化**：`i18next` + `react-i18next`。
- **样式体系**：Tailwind CSS，支持亮/暗主题。
- **状态管理**：Zustand。
- **路由**：React Router。

# 技术栈
- React 19、React Router 7、Zustand、@tanstack/react-table
- Tailwind CSS、Font Awesome Icons
- uPlot、@nivo/bar（可选 ECharts）
- Rspack 构建

# 环境要求
- Node.js ≥ 18（建议 LTS 版本）
- 包管理器：npm / pnpm / yarn 任一

# 安装与启动
```bash
# 安装依赖（任选其一）
npm install
# pnpm install
# yarn install

# 开发（默认 http://localhost:8080）
npm run dev

# 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

# NPM 脚本
- **dev**：启动开发服务器（Rspack）

# 目录结构（节选）
```
naes-console1/
├─ src/
│  ├─ components/
│  │  ├─ DataTablePro.jsx
│  │  ├─ EChart.jsx           # 可选：ECharts 通用容器
│  │  ├─ Icon.jsx
│  │  ├─ NivoBar.jsx          # Nivo 条形图（Top Companies）
│  │  └─ UPlotChart.jsx       # uPlot 趋势图（近30天）
│  ├─ pages/
│  │  └─ Dashboard.jsx        # 仪表盘
│  ├─ mocks/messages.js       # 本地示例数据
│  ├─ layouts/MainLayout.jsx
│  ├─ router/index.jsx
│  └─ index.css
├─ index.html
├─ package.json
└─ README.md
```

# 模块说明
- **Dashboard**：
  - KPI：总量、近7天新增、最新消息日期、公司数。
  - 趋势图（uPlot）：近 30 天每日新增数量。
  - Top Companies（Nivo）：消息量最多的前 5 家公司。
  - 最近消息表（DataTablePro）：最近 10 条消息。
- **表格 DataTablePro**：支持服务端分页/排序、密度切换、列可见性、列拖拽、固定表头、加载/空状态等。

# 主题与国际化
- 主题：建议将图表轴线/网格与 Tailwind 色板映射，以适配暗色模式；Nivo 通过 `theme` 自定义，uPlot 通过 `options.axes/grid/stroke` 控制。
- 国际化：基于 `i18next`，建议统一将新增文案接入 `src/i18n/` 的资源文件。

# 构建与发布
```bash
npm run build
# 产物位于 dist/ 目录，可部署到任意静态资源服务（如 GitHub Pages、Vercel、Netlify、Nginx 等）
```

# 贡献
欢迎提交 Issue / PR。建议：
- 保持 Tailwind 原子化风格与组件划分一致。
- 代码注释与文档使用中文，技术术语保留英文原文。
- 新组件优先抽象为通用组件，复用性优先。

# 许可证
默认未声明开源协议。如需开源，请新增许可证（如 MIT）并在本文件注明。
