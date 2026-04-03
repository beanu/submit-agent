# Submit Agent

[English](README.md) | [中文](README_CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> 一个浏览器扩展，用 AI 自动填写产品提交表单。你填一次产品信息，它帮你填所有网站的表。

---

<video src="assets/submit_agent.mp4" controls="controls" style="max-width:100%;"></video>

## 要解决的问题

你做了一个 AI 产品，但没人知道。

Google 判断一个网站值不值得推荐，看的是有多少别的网站链接到你。新网站零链接——Google 压根不知道你存在。解法：把产品提交到各种目录站。每个收录页面都会生成一条外链，每条外链都在帮你攒信用。

但是手动打开每个站点、找表单、逐项填写，往往要耗费数天。

Submit Agent 能把这个时间压到 2 小时左右。

## 怎么运作

**Submit Agent** 在浏览器里运行：AI 读取当前页面的表单结构，把你的产品档案映射到各字段，并自动改写描述以避免重复内容。

1. 你填一次产品信息（名字、网址、描述、Logo、社交链接）。
2. 打开一个提交页面，比如 [Futurepedia](https://www.futurepedia.io/submit-tool) 或者 [G2](https://www.g2.com/products/new)。
3. 点击扩展。AI 读取页面结构，判断每个字段该填什么，然后自动填好。描述会自动改写，保证每个站点的提交内容不重复（Google 会惩罚重复内容）。
4. 你检查一遍填好的表单，自己点提交。

## 特性

| 方向 | 说明 |
|------|------|
| **385+ 健康检查站点** | [`sites.json`](sites.json) 收集了市面上的backlink, 去重并验证站点健康度 |
| **进度可视化** | 侧边栏仪表盘：总体进度条 DR 排序；单站提交流程中可看到 Agent 状态与活动日志。 |
| **可中断、可继续** | 提交记录与产品档案存本地（IndexedDB / `chrome.storage`） |
| **基于 PageAgent** | 核心引擎为 [@page-agent](https://github.com/alibaba/page-agent) 等包（阿里 PageAgent 生态），在页面上做 **结构化观测 + ReAct 循环**，按需决策点击、输入、读 DOM。 |
| **更省 Token** | **不依赖整页截图做视觉理解**，以 DOM / 页面状态为主，Prompt 与上下文更聚焦 |
| **描述去重** | 系统提示要求各站点改写文案，降低被判定为重复内容的风险。 |
| **自带模型可选** | 支持内置、OpenAI、DeepSeek、自定义 OpenAI 兼容接口；设置内可「测试连接」。 |

## 安装

### 下载安装（推荐）

1. 从 [Releases](https://github.com/beanu/submit-agent/releases) 下载最新的 `.zip`。
2. 解压。
3. 打开 Chrome → 地址栏输入 `chrome://extensions` → 右上角开启 **开发者模式**。
4. 点 **加载已解压的扩展程序** → 选刚才解压的文件夹。
5. 在工具栏的拼图图标里把扩展固定到工具栏。

### 从源码构建

```bash
cd extension
npm install
npm run build
```

构建产物在 `extension/.output/chrome-mv3/`，把这个文件夹作为"已解压的扩展程序"加载到 Chrome。

## 配置

### 1. 设置 AI 模型

点击扩展图标 → **设置**。

Submit Agent 兼容任何 OpenAI 格式的 API。

优先建议使用 “qwen3.5-flash”,“gemini-3-flash”或“claude-haiku-4.5”模型。因为填表这个事不需要智商不是第一位的。

### 2. 添加产品

第一次打开扩展，会让你输入产品网址。AI 自动访问你的网站，读取内容，生成一份产品档案：名字、标语、短描述、长描述、分类。你检查修改后保存。

也可以手动填——点"手动填写"打开完整表单。

要提交多个产品？侧边栏左上角的下拉菜单可以切换产品或添加新产品。

## 使用方式

### 方式一：从仪表盘选站点

打开侧边栏（点扩展图标）。你会看到一个仪表盘，列出了全部站点，按 DR（域名权重）排序。已提交的站点有标记。

点任意站点 → **开始自动填写**。扩展会打开提交页面，AI 自动填写表单。填完后你检查确认，自己提交。

### 方式二：直接填当前页面

已经在提交页面上了？页面右下角会出现一个悬浮按钮（可以在设置里关掉），点一下，AI 直接填当前页面的表单。


## 站点数据库

所有外链站点的完整数据在 [`sites.json`](sites.json)

六大分类：AI 导航站、创业产品目录、评测平台、开发者社区、Deal 平台、通用 SEO 目录站。

少了哪个站？数据过时了？欢迎提 PR。

## 开发

```bash
cd extension
npm install      # 同时运行 wxt prepare
npm run dev      # 启动带热更新的 Chrome 开发模式
npm run build    # 生产构建
npm run zip      # 打包为 .zip
```

### 技术栈

- **[WXT](https://wxt.dev/)** — 浏览器扩展框架（Manifest V3）
- **React 19** + **Tailwind CSS v4** — 侧边栏和选项页 UI
- **[page-agent](https://github.com/alibaba/page-agent)** — AI 引擎，负责 DOM 分析和表单填写（阿里 PageAgent）
- **IndexedDB** — 本地存储产品档案和提交记录
- **chrome.storage** — 存储 LLM 设置和偏好

### 项目结构

```
extension/
├── src/
│   ├── entrypoints/
│   │   ├── background.ts      # Service Worker：在各组件间路由消息
│   │   ├── content.ts          # 注入每个页面，提供远程 DOM 控制能力
│   │   ├── sidepanel/          # 主 UI（React）— 仪表盘、设置、提交流程
│   │   └── options/            # 完整的产品档案编辑页
│   ├── agent/
│   │   ├── SubmitAgent.ts      # 核心 agent：构建 prompt，运行 ReAct 循环
│   │   ├── RemotePageController.ts  # 将 agent 动作桥接到 content script
│   │   ├── TabsController.ts   # 开/切/关浏览器标签页
│   │   └── submit-prompt.md    # AI 的系统提示词
│   ├── components/             # React 组件（Dashboard、SubmitFlow、Settings…）
│   ├── hooks/                  # React hooks（useProduct、useSites、useSubmitAgent…）
│   └── lib/                    # 存储、国际化、类型定义、产品档案生成器
├── sites.json                  # 从仓库根目录软链接
└── wxt.config.ts               # WXT + Vite 配置
```

### 数据流

```
侧边栏
 → 创建 SubmitAgent（产品数据 + LLM 配置）
 → agent.execute(task)
 → ReAct 循环：读取页面 → LLM 决定动作 → 通过 content script 执行
 → 触发事件 → React 更新界面
 → 用户检查填好的表单 → 手动提交
```

## 提交技巧

- **先提交 DR 最高的站点。** G2（92）、Crunchbase（91）、Product Hunt（91）——一条外链顶小站十条。
- **描述会自动改写**，但提交前看一眼。AI 保留核心卖点的同时让每份描述都不重复。
- **提前备好素材。** Logo（方形 + 横版）、截图、一句话介绍、创始人简介、社交链接。东西齐了再开始，中途找素材会断节奏。
- **提交完验证外链。** 用 [Ahrefs Backlink Checker](https://ahrefs.com/backlink-checker)（免费版够用）确认哪些提交真的生成了 dofollow 外链。

## 许可证

[MIT](LICENSE)
