# OfferFlow 开发计划

> 项目：求职全流程管理工具
> 技术栈：Next.js 16 + React 19 + Tailwind CSS v4 + Prisma + PostgreSQL
> 状态：核心功能已完成，进入 Next.js 全栈迁移阶段

---

## 目标

为求职者提供一个端到端的求职管理平台，覆盖岗位收集→投递→面试→复盘→决策全链路。
**当前里程碑**：从 React+Vite SPA 升级为 Next.js 全栈 SaaS 架构。

---

## 阶段总览

| 阶段 | 名称 | 状态 | 完成日期 |
|------|------|------|----------|
| 1 | 项目脚手架与基础架构 | ✅ 完成 | 2026-05-10 |
| 2 | 导航系统与布局 | ✅ 完成 | 2026-05-11 |
| 3 | 核心页面与模拟数据 | ✅ 完成 | 2026-05-11 |
| 4 | 弹窗系统与 Toast 通知 | ✅ 完成 | 2026-05-11 |
| 5 | CSS 主题系统与暗色光效 | ✅ 完成 | 2026-05-12 |
| 6 | SplashScreen 增强与 GlowCard | ✅ 完成 | 2026-05-12 |
| 7 | Sidebar B 端 SaaS 风格迭代 | ✅ 完成 | 2026-05-13 ~ 2026-05-17 |
| 8 | 弹窗系统全模块覆盖 | ✅ 完成 | 2026-05-14 ~ 2026-05-15 |
| 9 | 后续迭代与优化 | ✅ 已完成 | 2026-05-18 |
| **10** | **Next.js 全栈迁移** | ✅ **已完成** | 2026-05-18 |
| 10.1 | Next.js 项目初始化与配置 | ✅ 完成 | 2026-05-18 |
| 10.2 | CSS 与组件迁移 | ✅ 完成 | 2026-05-18 |
| 10.3 | App Router 路由搭建 | ✅ 完成 | 2026-05-18 |
| 10.4 | 布局系统迁移（Layout/Navbar/Sidebar/BottomNav） | ✅ 完成 | 2026-05-18 |
| 10.5 | 页面迁移（8 页面） | ✅ 完成 | 2026-05-18 |
| 10.6 | 状态管理适配 | ✅ 完成 | 2026-05-18 |
| 10.7 | API Routes 基建与文件上传 | ✅ 完成 | 2026-05-18 |
| 10.8 | 认证系统搭建 | ✅ 完成 | 2026-05-18 |
| 10.9 | 集成测试与构建验证 | ✅ 完成 | 2026-05-18 |
| **11** | **用户注册登录系统** | ✅ **已完成** | 2026-05-18 |
| **12** | **SaaS 功能开发（数据云端迁移）** | ✅ **已完成** | 2026-05-18 |

---

## 阶段 1：项目脚手架与基础架构 ✅

**目标**：Vite + React 19 + Tailwind CSS v4 项目初始化，全局状态管理

- [x] Vite 项目初始化 (React + SWC)
- [x] Tailwind CSS v4 + `@tailwindcss/vite` 插件
- [x] `AppContext.jsx` — 全局数据层（jobs/resumes/tasks/reviews 四实体）
- [x] `ThemeContext.jsx` — 深色/浅色主题切换
- [x] localStorage 自动持久化
- [x] ESLint flat config

**创建的文件**：
- `package.json`, `vite.config.js`, `eslint.config.js`, `index.html`
- `src/main.jsx`, `src/App.jsx`, `src/index.css`
- `src/store/AppContext.jsx`, `src/store/ThemeContext.jsx`, `src/store/mockData.js`

---

## 阶段 2：导航系统与布局 ✅

**目标**：Navbar / Sidebar / BottomNav 三端适配导航布局

- [x] Navbar（顶部导航：标题、搜索、主题切换、头像）
- [x] Sidebar（桌面侧边栏，8 个菜单项，紫色选中态）
- [x] BottomNav（移动端底部导航，5 项核心入口）
- [x] App.jsx 主容器（SplashScreen + entered 入场动画）

**创建的文件**：
- `src/components/Navbar.jsx`, `src/components/Sidebar.jsx`, `src/components/BottomNav.jsx`
- `src/components/SplashScreen.jsx`

---

## 阶段 3：核心页面与模拟数据 ✅

**目标**：全部 8 个页面的基础功能与模拟数据

- [x] Dashboard — 概览指标面板（统计卡片 + 时间线 + 任务）
- [x] Board — 10 列 Kanban 看板（HTML5 Drag & Drop 拖拽）
- [x] Positions — 表格列表 + 筛选/搜索
- [x] Resumes — 简历卡片 + 版本管理 + 效果统计
- [x] Schedule — 6 类任务日程（分组 + 完成标记）
- [x] Interview — 8 维度面试复盘 + 评分系统
- [x] Insights — Recharts 图表面板 + 漏斗分析 + 时间筛选
- [x] Settings — 用户设置页
- [x] mockData 模拟数据（14 岗位、5 简历、11 任务、7 复盘）

**创建的文件**：
- `src/pages/Dashboard.jsx`, `src/pages/Board.jsx`, `src/pages/Positions.jsx`
- `src/pages/Resumes.jsx`, `src/pages/Schedule.jsx`, `src/pages/Interview.jsx`
- `src/pages/Insights.jsx`, `src/pages/Settings.jsx`

---

## 阶段 4：弹窗系统与 Toast 通知 ✅

**目标**：岗位/任务/复盘的 CRUD 弹窗与全局消息反馈

- [x] JobModal — 岗位编辑表单
- [x] JobDetailModal — 岗位详情（含时间线）
- [x] TaskModal — 任务编辑
- [x] ReviewModal — 复盘编辑（最长表单：8 维度评分 + 题目 + 改进计划）
- [x] ReviewDetailModal — 复盘详情 + 附件预览
- [x] ResumeModal — 简历编辑
- [x] ResumePreviewModal — 简历预览
- [x] ConfirmDialog — 确认删除弹窗
- [x] Toast — 自动消失的消息通知

**创建的文件**：
- `src/components/JobModal.jsx`, `src/components/JobDetailModal.jsx`
- `src/components/TaskModal.jsx`, `src/components/ReviewModal.jsx`
- `src/components/ReviewDetailModal.jsx`
- `src/components/ResumeModal.jsx`, `src/components/ResumePreviewModal.jsx`
- `src/components/ConfirmDialog.jsx`, `src/components/Toast.jsx`

---

## 阶段 5：CSS 主题系统与暗色光效 ✅

**目标**：建立完整主题系统，提升暗色模式视觉品质

- [x] 30+ 语义化 CSS 自定义属性（`:root` + `.dark` 双体系）
- [x] `.modal-panel` 渐变边框（`::before` fill 方案）
- [x] `.app-glow-tl` / `.app-glow-br` 环境光晕
- [x] 暗色模式 scrollbar、focus-ring、card-glow
- [x] `.light-ambient-container` 浅色渐变纹理

**修改的文件**：
- `src/index.css` — 全面重写主题系统

---

## 阶段 6：SplashScreen 增强与 GlowCard ✅

**目标**：优化 Splash 视觉体验，增加 GlowCard 光效组件

- [x] Playfair Display 字体、背景图、渐变遮罩
- [x] staggered 入场动效（3 阶段 fade-in）
- [x] Splash 主题切换闪退 Bug 修复（`exitClassRef`）
- [x] GlowCard 鼠标跟随光效（`--mouse-x`/`--mouse-y`）
- [x] 独立引导页 `splash.html`

**创建/修改的文件**：
- `src/components/SplashScreen.jsx` — 重构
- `src/components/GlowCard.jsx` — 新建
- `splash.html`, `public/images/offerflow-bg.jpg` — 新建

---

## 阶段 7：Sidebar B 端 SaaS 风格迭代 ✅

**目标**：侧边导航栏 B 端 SaaS 风格改造 + 尺寸放大

- [x] 第一轮重构：宽度、图标、文字全量放大
- [x] 第二轮重构：再次放大（300px）
- [x] 深色/浅色模式 UI/UX 验收修复
- [x] 浅色模式玻璃态面板修复（`oklch()` 色彩空间）

**修改的文件**：
- `src/components/Sidebar.jsx` — 多次迭代

---

## 阶段 8：弹窗系统全模块覆盖 ✅

**目标**：GlowCard 覆盖全部弹窗，ModalHeader 组件提取

- [x] ModalHeader 组件提取与全模块应用
- [x] GlowCard 覆盖 ResumeModal / ResumePreviewModal / TaskModal / ReviewModal / ReviewDetailModal
- [x] GlowCard `handleFocusIn` 表单模式
- [x] Insights InterviewDetailModal 弱光效变体

**创建/修改的文件**：
- `src/components/ModalHeader.jsx` — 新建
- 所有弹窗文件 — GlowCard 包裹

---

## 阶段 9：后续迭代与优化 ✅

**目标**：Bug 修复、体验优化（已完成）

- [x] 简历文件 IndexedDB 持久化（修复上传刷新丢失、编辑覆盖问题）
- [x] ReviewDetailModal 黑屏崩溃修复（防御性渲染 + 附件预览重构）
- [x] 面试复盘附件持久化全链路修复
- [x] 卡片操作菜单 Stacking Context 修复（Portal 方案）
- [x] Tailwind v4 @layer utilities 边距类全局失效修复
- [x] 面试复盘模块修复：弹窗滚动 + 弱项标签云

---

## 阶段 10：Next.js 全栈迁移 ⏳

**目标**：将当前 React+Vite SPA 迁移至 Next.js App Router 全栈架构，保留全部 UI 与功能。

### 10.1 Next.js 项目初始化与配置 ✅
- [x] 创建 Next.js 项目（`create-next-app`），复制现有 `src/` 代码
- [x] 配置 `next.config.mjs`（图片、文件上传、CORS、turbo）
- [x] 配置 `postcss.config.mjs`（Tailwind CSS v4 `@tailwindcss/postcss`）
- [x] `package.json` 依赖迁移：移除 Vite 相关，添加 next 相关
- [x] Tailwind CSS v4 适配 Next.js（`@tailwindcss/vite` → `@tailwindcss/postcss`）
- [x] `jsconfig.json` 路径别名 `@/` → `./src/*`

### 10.2 CSS 与组件迁移 ✅
- [x] `src/index.css` → `src/app/globals.css`（内容不变）
- [x] 所有交互性组件添加 `'use client'` 指令
- [x] 更新 Tailwind CSS v4 导入路径（`@import "tailwindcss"`）
- [x] 暗色主题 CSS 变量在 Next.js 下正常工作

### 10.3 App Router 路由搭建 ✅
- [x] `src/app/layout.jsx` — 根布局（html/body + Providers）
- [x] `src/app/page.jsx` — 根路由（redirect 到 /dashboard）
- [x] 全部 8 个主页面路由（dashboard/board/positions/resumes/schedule/interview/insights/settings）
- [x] `src/app/auth/login/page.jsx` — 登录页
- [x] `src/app/auth/register/page.jsx` — 注册页
- [x] `src/app/auth/layout.jsx` — 认证页独立布局（无 Sidebar/Navbar）
- [x] 路由组 `(main)/` 和 `auth/` 结构

### 10.4 布局系统迁移 ✅
- [x] `src/app/(main)/layout.jsx` — 主应用布局（force-dynamic 防静态预渲染）
- [x] `src/app/(main)/main-layout-client.jsx` — 客户端布局（SplashScreen + Navbar + Sidebar + BottomNav）
- [x] 移除 `App.jsx`（已删除），路由由 `usePathname()` 接管
- [x] Sidebar.jsx 使用 `usePathname()` + `useRouter()` 替代 `activePage`
- [x] BottomNav.jsx 同步迁移
- [x] SplashScreen 改为 sessionStorage 控制（首次访问展示）

### 10.5 页面迁移 ✅
- [x] 页面组件迁移至 `src/views/`（避免 Pages Router 冲突）
- [x] 页面内所有导入路径更新（`../components/` → `@/components/`）
- [x] 路由页面薄封装：`<PageName />` 代理到 views
- [x] Recharts 图表在 SSR 下正常（`'use client'` 客户端渲染）
- [x] Drag & Drop 在客户端渲染下正常
- [x] 所有弹窗在路由页面中正常工作

### 10.6 状态管理适配 ✅
- [x] `AppContext.jsx` 移除 `activePage`/`setActivePage`（由路由接管）
- [x] `AppContext.jsx` 添加 `'use client'`
- [x] `ThemeContext.jsx` 添加 `'use client'`
- [x] localStorage 适配 SSR：`typeof window === 'undefined'` 守卫
- [x] `AuthContext.jsx` 新建（基于 next-auth session 的认证状态）
- [x] Context Provider 聚合至 `src/app/providers.jsx`

### 10.7 API Routes 基建与文件上传 ✅
- [x] `src/app/api/jobs/route.js` — 岗位数据 API 桩
- [x] `src/app/api/resumes/route.js` — 简历数据 API 桩
- [x] `src/app/api/tasks/route.js` — 任务数据 API 桩
- [x] `src/app/api/reviews/route.js` — 复盘数据 API 桩
- [x] `src/app/api/upload/route.js` — 文件上传 API 桩
- [x] `src/lib/prisma.js` — Prisma 客户端单例
- [x] `prisma/schema.prisma` — 5 模型（User/Job/Resume/Task/Review）

### 10.8 认证系统搭建 ✅
- [x] `src/app/api/auth/[...nextauth]/route.js` — NextAuth v4（CredentialsProvider + JWT）
- [x] `src/middleware.js` — 路由保护中间件（`withAuth`）
- [x] `src/store/AuthContext.jsx` — 客户端认证状态
- [x] 登录/注册页面 UI（含完整表单）
- [x] 登录状态与 SessionProvider 打通

### 10.9 集成测试与构建验证 ✅
- [x] `npm run build` 通过（12 routes, 3 static + 9 dynamic）
- [x] `npm run dev` 启动正常（Turbopack <300ms 冷启动）
- [x] 登录页渲染正确（200, 完整 HTML + 深色主题）
- [x] 所有 8 个页面正确重定向到 /auth/login（307）
- [x] Auth.js Session API 正常返回（`{}` 未认证）
- [x] API 桩正常响应（"not yet implemented"）
- [x] 环境变量 `.env.local` 配置（NEXTAUTH_SECRET）
- [x] 旧文件清理（dist/、_screenshot2.cjs 删除）

---

## 阶段 11：用户注册登录系统 ✅

**目标**：构建完整的用户名+密码注册登录系统，支持 SplashScreen → 登录/注册 → Dashboard 用户旅程。

### 实施内容
- [x] 移除 next-auth，安装 bcryptjs + jose
- [x] Prisma User 模型更新（username + passwordHash, SQLite dev db）
- [x] JWT 工具函数（signToken / verifyToken / cookieOptions）
- [x] 服务端认证辅助（getAuthUser / requireAuth）
- [x] POST /api/auth/register — 注册 API（验证→bcrypt→创建→签发Cookie）
- [x] POST /api/auth/login — 登录 API（查询→bcrypt→签发Cookie）
- [x] POST /api/auth/logout — 登出 API（清除Cookie）
- [x] GET /api/auth/me — 当前用户 API（Cookie→JWT验证→查询用户）
- [x] Middleware 自定义 JWT 验证（替代 next-auth withAuth）
- [x] AuthContext 重写（login/register/logout/fetchUser 替代 useSession）
- [x] 认证页 SplashScreen 整合（先 Splash 后登录表单）
- [x] 登录/注册双 Tab 页面（username + password）
- [x] httpOnly Cookie 会话管理（JWT 7天过期）
- [x] 输入验证（username 2-20字、password 6位+）
- [x] 错误处理（重复注册409、错误密码401、短密码400、空字段400）
- [x] 构建验证通过（19 routes, 3 static + 16 dynamic）
- [x] API 全流程测试通过

---

## 阶段 12：SaaS 功能开发 ✅ 已完成

**目标**：基于 Next.js 全栈架构开发云端 SaaS 功能

### 12.1 数据本地存储 → 云端迁移
- [x] Prisma + SQLite 数据库搭建（5 模型：User/Job/Resume/Task/Review）
- [x] JWT 认证 API（register/login/logout/me）— 已完成
- [x] Jobs API 全量 CRUD（GET/POST/PUT/DELETE）— 已完成
- [x] Resumes API 全量 CRUD（GET/POST/PUT/DELETE）— 已完成
- [x] Tasks API 全量 CRUD（GET/POST/PUT/DELETE）— 已完成
- [x] Reviews API 全量 CRUD（GET/POST/PUT/DELETE）— 已完成
- [x] Seed API 新用户数据初始化（4 实体交叉关联数据）
- [x] AppContext 重写：同步 setState → 异步 API CRUD + localStorage 缓存/回退
- [x] 所有 View/Component 更新为新 CRUD 方法
- [x] 用户数据隔离（每条记录绑定 userId，API 按 userId 过滤）
- [x] 构建通过 + API 全链路 curl 验收

| **13** | **SplashScreen 滚轮修复** | ✅ **已完成** | 2026-05-19 |

### 阶段 13：SplashScreen 滚轮下滑进入修复 ✅

**目标**：修复 SplashScreen 无法通过鼠标滚轮下滑进入的问题

- [x] 诊断根因：auth/layout.jsx 内联 SpashScreen 代码但遗漏 wheel/touch 事件绑定
- [x] 复用 SplashScreen 组件替代内联代码
- [x] 验证 wheel 事件（`deltaY > 10`）正常触发
- [x] 验证 touch 上滑（`diff > 40`）正常触发
- [x] 验证按钮点击正常触发
- [x] 验证 `enteredRef` 防重复触发
- [x] 验证 `{ passive: true }` 兼容性
- [x] 验证 cleanup 正确移除监听器
- [x] 更新 findings.md / progress.md / 产品文档

**修改的文件**：
- `src/app/auth/layout.jsx` — 移除 ~60 行内联 Splash 代码，使用 `SplashScreen` 组件

---

| **14** | **Console JSON 解析错误修复** | ✅ **已完成** | 2026-05-19 |
| **15** | **登录页面重新设计** | ✅ **已完成** | 2026-05-19 |
| **16** | **退出登录功能** | ✅ **已完成** | 2026-05-19 |

### 阶段 16：退出登录功能 ✅

**目标**：Navbar 用户菜单 + 退出登录功能

- [x] Navbar 右上角用户头像下拉菜单
- [x] 显示用户名 + 已登录状态
- [x] "退出登录"按钮（红色样式 + 退出图标）
- [x] 点击退出 → addToast → logout API → 清除 Cookie → 跳转 /auth/login
- [x] 点击外部 / Escape 关闭菜单
- [x] animate-fade-in 下拉动画
- [x] 深色/浅色模式适配
- [x] AuthContext.logout 移除 router 依赖（交由调用方控制跳转时机）
- [x] 构建验证通过

**修改的文件**：
- `src/components/Navbar.jsx` — 新增用户下拉菜单 + 退出登录
- `src/store/AuthContext.jsx` — 清理 router 依赖，logout 不直接跳转

---

### 阶段 15：登录页面重新设计 ✅

**目标**：解决登录页面偏左、视觉不平衡问题，提升 SaaS 品质感

- [x] auth/layout.jsx 添加 3 层环境光晕（紫/青/中心散射）
- [x] login/page.jsx 使用 GlowCard 包裹表单卡片
- [x] 浅色模式玻璃拟态（bg-white/80 backdrop-blur-xl）
- [x] 暗色模式半透明卡片 + GlowCard 聚光灯
- [x] 最大宽度 420px，水平垂直居中
- [x] 品牌 Logo 紫色渐变圆角方块
- [x] Tab 滑动指示器动画
- [x] 输入框 focus ring + hover 边框
- [x] 注册确认密码字段 fade-in 动画
- [x] 按钮 hover 内发光 + 加载 spinner
- [x] 底部切换链接
- [x] 构建验证通过

**修改的文件**：
- `src/app/auth/layout.jsx` — 环境光晕背景
- `src/app/auth/login/page.jsx` — GlowCard + 玻璃拟态 + 居中

---

### 阶段 14：Console JSON 解析错误修复 ✅

**目标**：修复控制台 `"<!DOCTYPE" is not valid JSON` 错误

- [x] 诊断根因：中间件对 API 路由返回 HTML 重定向，`apiFetch` 解析 HTML 为 JSON 失败
- [x] 修改中间件：API 路由未认证返回 JSON 401，页面路由保持 307 重定向
- [x] 提取 `getTokenPayload()` 避免重复读取 Cookie 和验证
- [x] 构建验证通过
- [x] API 验证：`curl /api/jobs` → `{"error":"Unauthorized"}` (401)
- [x] 页面验证：`curl /dashboard` → 307 redirect to login
- [x] 更新 findings.md / progress.md / 产品文档

**修改的文件**：
- `src/middleware.js` — 区分 API/页面路由的错误处理

---

| **17** | **Vercel 部署 + Neon PostgreSQL 迁移** | ✅ **已完成** | 2026-05-19 |
| **18** | **用户数据隔离修复** | ✅ **已完成** | 2026-05-20 |
| **19** | **演示账号 Seed 机制** | ✅ **已完成** | 2026-05-20 |
| **20** | **退出登录 SplashScreen 重置** | ✅ **已完成** | 2026-05-20 |

### 阶段 17：Vercel 部署 + Neon PostgreSQL 迁移 ✅

**目标**：将应用部署到 Vercel，使用 Neon PostgreSQL 替代 Supabase

- [x] Prisma schema 切换 PostgreSQL provider
- [x] 双数据库模式配置（SQLite 本地 / PostgreSQL 生产）
- [x] GitHub → Vercel 自动部署绑定
- [x] 解决 Supabase 数据库仅 IPv6 导致 Vercel 无法连接的问题
- [x] 迁移至 Neon PostgreSQL（有 IPv4，完美兼容 Vercel）
- [x] Prisma db push 建表成功

**部署平台**：Vercel (Production)
**生产数据库**：Neon PostgreSQL (us-east-1)
**开发数据库**：SQLite (本地)

**遇到的问题**：
- Supabase 项目 DNS 仅返回 IPv6 地址，从 Vercel AWS 和美国网络均无法连接（443/5432/6543 全部端口不通）
- 解决方案：改用 Neon PostgreSQL，完整 IPv4 支持，连接一次成功

---

### 阶段 19：演示账号 Seed 机制 ✅

**目标**：系统内置演示账号 `user` / `000000`，首次登录时自动创建账号并写入测试数据。

- [x] `src/lib/seedDemoData.js` — 新建：`ensureDemoUser()` 自动创建 demo 用户、`seedDemoDataForUser()` 写入 14 岗位/5 简历/11 任务/7 复盘
- [x] `login/route.js` — 检测 `username === 'user'` → 自动创建账号（如不存在）→ seed 数据（如为空）
- [x] `register/route.js` — 阻止注册保留用户名 `user`
- [x] `seed/route.js` — 简化为委托 `seedDemoDataForUser()`
- [x] 幂等性：重复登录 `user` 不会重复插入数据
- [x] 数据隔离：普通用户不看到演示数据
- [x] 构建验证通过（22 路由全部通过）

**创建的文件**：
- `src/lib/seedDemoData.js` — 账号创建 + 种子数据写入，含幂等判断

**修改的文件**：
- `src/app/api/auth/login/route.js` — 登录时自动创建 + seed
- `src/app/api/auth/register/route.js` — 阻止注册 `user`
- `src/app/api/seed/route.js` — 简化为委托调用

---

### 阶段 20：退出登录 SplashScreen 重置 ✅

**目标**：退出登录后重新进入 `/auth/login` 时正常展示 SplashScreen，而非一闪而过。

- [x] `AuthContext.logout()` 清除 `sessionStorage` 中的 `offerflow_splash_shown` 标记
- [x] `auth/layout.jsx` 改用 `useState` 同步初始值替代 `useEffect` 异步读取，消除闪屏
- [x] 移除 `useEffect` 导入（不再使用）
- [x] 验证：退出登录 → 重定向到 `/auth/login` → SplashScreen 正常展示
- [x] 验证：已进入登录页后刷新不会反复显示 SplashScreen（sessionStorage 标记保留）
- [x] 验证：滚轮下滑/触屏上滑/点击按钮三种方式仍正常工作

**修改的文件**：
- `src/store/AuthContext.jsx` — logout 中添加 `sessionStorage.removeItem('offerflow_splash_shown')`
- `src/app/auth/layout.jsx` — 同步初始化 `splashDone` 状态，移除 `useEffect`

---

### 已修复问题 ✅

#### 问题 1：Seed 数据仅应为 user 账户初始化（已修复）

**修复内容**：
- `src/app/api/seed/route.js` — 添加 `user.username !== 'user'` 检查，仅测试账户 `user` 可触发种子数据
- `src/store/AppContext.jsx` — 移除自动调用 `/api/seed` 的逻辑（loadAllData 不再触发种子数据写入）
- 新注册的非 `user` 账户默认空数据启动

#### 问题 2：数据隔离加固（已修复）

**修复内容**：
- 所有 4 个业务 API GET 端点：未认证时返回 `{ error: 'Unauthorized' }` + 401，而非空数组 `[]`
- `AppContext.jsx`：401 时不回退到 localStorage，直接显示空数据（防止跨用户缓存污染）
- `AuthContext.jsx`：退出登录时清除所有 localStorage 缓存
- `AppContext.jsx`：监听认证状态变化，登录/登出后自动重新加载数据
- 所有 Prisma schema（pg + sqlite）：Job/Resume/Task/Review 添加 `@@index([userId])`

**影响范围**：
- `src/app/api/jobs/route.js`
- `src/app/api/resumes/route.js`
- `src/app/api/tasks/route.js`
- `src/app/api/reviews/route.js`
- `src/app/api/seed/route.js`
- `src/store/AppContext.jsx`
- `src/store/AuthContext.jsx`
- `prisma/schema.prisma`
- `prisma/schema.pg.prisma`
- `prisma/schema.sqlite.prisma`

---

| **21** | **AI 面试复盘分析系统** | ✅ **已完成** | 2026-05-22 |

### 阶段 21：AI 面试复盘分析系统 ✅

**目标**：接入 LLM（DeepSeek/Xiaomi MiMo）对面试复盘 Word 文档进行智能分析，自动生成评分、优势/不足、问题列表和改进建议；支持岗位角色适配；跨面试趋势总结。

- [x] 安装依赖（mammoth, @vercel/blob）
- [x] LLM 客户端抽象层（config/client/prompts）
- [x] .docx 解析模块 + 文件存储模块
- [x] Prisma Review 模型新增 aiAnalysis 字段
- [x] POST /api/ai/analyze — Word 分析 API
- [x] GET /api/ai/trends — 趋势总结 API
- [x] POST /api/ai/review/:id/reanalyze — 重新分析 API
- [x] AiResultPanel 前端组件
- [x] ReviewModal AI 分析集成
- [x] AI 分析加载动画（呼吸脉冲 + 动画省略号）
- [x] TrendReportModal 前端组件
- [x] 标签正负分类改革（positiveTags/negativeTags 拆分）
- [x] Interview.jsx 趋势分析入口
- [x] 构建验证 + 环境变量配置

**创建的文件**：
- `src/lib/llm/config.js` — LLM 环境变量配置读取
- `src/lib/llm/client.js` — OpenAI-compatible API 调用封装（含重试、超时）
- `src/lib/llm/prompts.js` — 分析/趋势 prompt 模板
- `src/lib/ai/docParser.js` — mammoth .docx → 纯文本解析
- `src/lib/ai/fileStore.js` — 文件存储抽象（本地磁盘 / Vercel Blob）
- `src/app/api/ai/analyze/route.js` — POST Word 文件分析 API
- `src/app/api/ai/trends/route.js` — GET 历史趋势总结 API
- `src/app/api/ai/review/[id]/reanalyze/route.js` — POST 重新分析 API
- `src/components/AiResultPanel.jsx` — AI 分析结果预览/编辑面板
- `src/components/TrendReportModal.jsx` — 趋势报告展示弹窗

**修改的文件**：
- `prisma/schema.prisma` — Review 添加 aiAnalysis 字段
- `prisma/schema.pg.prisma` — 同上
- `prisma/schema.sqlite.prisma` — 同上
- `src/components/ReviewModal.jsx` — 添加 AI 分析按钮 + AiResultPanel 集成
- `src/views/Interview.jsx` — 添加"生成趋势报告"按钮 + TrendReportModal
- `.env` — 添加 LLM 环境变量

**涉及的依赖**：mammoth @vercel/blob

### 待规划
- [ ] 多设备数据同步
- [ ] 数据导出（JSON / CSV / PDF）
- [ ] 求职漏斗图优化
- [ ] 岗位详情页增强（含面试轮次进度条）
- [ ] AI 面试模拟
- [ ] 求职报告生成（PDF）
- [ ] 多语言支持（中/英切换）
- [ ] 移动端适配增强

### 已修复 Bug
- [x] 数据洞察总面试次数未计入「已结束」流程 — `hasInterviewExperience()` 和 `getFallbackInterviewRounds()` 增加 `已结束` 状态处理
- [x] positiveTags/negativeTags 数据库持久化 — Prisma schema 缺少字段 + API 路由未保存 + ReviewDetailModal 未显示

---

| **22** | **positiveTags/negativeTags 数据库持久化修复** | ✅ **已完成** | 2026-05-22 |

### 阶段 22：positiveTags/negativeTags 数据库持久化修复 ✅

**目标**：修复 AI 标签正负分类改革后，positiveTags/negativeTags 无法持久化到数据库的问题。

- [x] Prisma schema（3 文件）Review 模型添加 `positiveTags Json?` + `negativeTags Json?`
- [x] POST /api/reviews — create data 中加入 positiveTags/negativeTags
- [x] PUT /api/reviews — 不再解构丢弃 positiveTags/negativeTags
- [x] ReviewDetailModal — 优势标签（绿色）+ 问题标签（红色，优先 negativeTags）双区域显示
- [x] `prisma db push` 成功（SQLite + Neon PostgreSQL）

**修改的文件**：
- `prisma/schema.prisma` — 添加 positiveTags/negativeTags 字段
- `prisma/schema.pg.prisma` — 同上
- `prisma/schema.sqlite.prisma` — 同上
- `src/app/api/reviews/route.js` — POST/PUT 路由修复
- `src/components/ReviewDetailModal.jsx` — 正负标签双区显示

---

## Next.js 迁移架构设计

### 目标目录结构

```
offerflow/
├── package.json
├── next.config.mjs
├── postcss.config.mjs
│
├── src/
│   ├── app/
│   │   ├── globals.css              # ← 原 index.css（内容不变）
│   │   ├── layout.jsx               # 根布局（html/body + Providers）
│   │   ├── page.jsx                 # 根路由 → redirect /dashboard
│   │   ├── providers.jsx            # ThemeProvider + AppProvider 聚合
│   │   ├── (main)/                  # 主应用路由组（含 Sidebar/Navbar）
│   │   │   ├── layout.jsx           # 主布局（Navbar + Sidebar + BottomNav）
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── board/page.jsx
│   │   │   ├── positions/page.jsx
│   │   │   ├── resumes/page.jsx
│   │   │   ├── schedule/page.jsx
│   │   │   ├── interview/page.jsx
│   │   │   ├── insights/page.jsx
│   │   │   └── settings/page.jsx
│   │   ├── auth/                    # 认证路由组（独立布局）
│   │   │   ├── layout.jsx
│   │   │   ├── login/page.jsx
│   │   │   └── register/page.jsx
│   │   └── api/                     # API Routes
│   │       ├── auth/[...nextauth]/route.js
│   │       ├── jobs/route.js
│   │       ├── resumes/route.js
│   │       ├── tasks/route.js
│   │       ├── reviews/route.js
│   │       └── upload/route.js
│   │
│   ├── components/                  # 组件（原封不动 + 'use client'）
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx              # 修改：usePathname() 替代 activePage
│   │   ├── BottomNav.jsx            # 同上
│   │   ├── SplashScreen.jsx
│   │   ├── GlowCard.jsx
│   │   ├── Toast.jsx
│   │   ├── ModalHeader.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── ActionMenuPortal.jsx
│   │   ├── JobModal.jsx
│   │   ├── JobDetailModal.jsx
│   │   ├── ResumeModal.jsx
│   │   ├── ResumePreviewModal.jsx
│   │   ├── TaskModal.jsx
│   │   ├── ReviewModal.jsx
│   │   └── ReviewDetailModal.jsx
│   │
│   ├── store/
│   │   ├── AppContext.jsx           # 修改：移除 activePage
│   │   ├── ThemeContext.jsx
│   │   ├── AuthContext.jsx          # 新建
│   │   └── mockData.js
│   │
│   ├── utils/
│   │   ├── resumeFileStore.js
│   │   └── reviewAttachmentStore.js
│   │
│   └── lib/
│       └── prisma.js                # 新建（数据库客户端）
```

### 路由设计

| 当前（SPA） | 迁移后（Next.js） | 说明 |
|---|---|---|
| `activePage='dashboard'` | `/dashboard` | 仪表盘 |
| `activePage='board'` | `/board` | 投递看板 |
| `activePage='positions'` | `/positions` | 岗位库 |
| `activePage='resumes'` | `/resumes` | 简历舱 |
| `activePage='schedule'` | `/schedule` | 日程待办 |
| `activePage='interview'` | `/interview` | 面试复盘 |
| `activePage='insights'` | `/insights` | 数据洞察 |
| `activePage='settings'` | `/settings` | 设置 |
| — | `/auth/login` | 登录（新建） |
| — | `/auth/register` | 注册（新建） |
| `/`（Splash） | `/` → redirect `/dashboard` | 根路由 |

### 关键架构变更

| 项目 | 当前（Vite SPA） | 迁移后（Next.js） | 理由 |
|------|------------------|-------------------|------|
| 路由 | 条件渲染 `activePage` | App Router 文件路由 | 标准 URL、SEO、SSR 基础 |
| 构建 | Vite 8 + SWC | Next.js + Turbopack/Webpack | 全栈框架、SSR/SSG |
| 布局 | `App.jsx` 内联布局 | `(main)/layout.jsx` 路由组布局 | 路由级布局隔离 |
| 认证 | 无 | Auth.js + AuthContext + API Routes | SaaS 多用户基础 |
| 状态 | `activePage` in AppContext | `usePathname()` from next/navigation | URL 是单⼀事实来源 |
| 客户端组件 | 全部隐含客户端 | 显式 `'use client'` | Next.js 服务端组件默认 |
| 样式 | `src/index.css` + Tailwind v4 | `src/app/globals.css` + Tailwind v4 | App Router 约定 |
| 持久化 | 仅 localStorage/IndexedDB | localStorage + API + DB（3 层） | 渐进式云端同步 |
| 文件上传 | 仅 IndexedDB | IndexedDB（客户端）+ API（服务端） | 双轨存储过渡 |

### 迁移策略

**增量迁移，非重写**：
1. 创建 Next.js 项目 → 复制现有 `src/` → 逐步适配
2. 页面迁移按 "页面→组件→状态→API" 顺序
3. 每次迁移一个页面并验证功能
4. 最后搭建 API Routes 和认证系统
5. Vite 项目保留为回退，直至迁移完成

---

## 遇到的错误

| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| Light→Dark 切换时 SplashScreen 闪现 | 1 | `exitClassRef` useRef 冻结动画类名 |
| 浅色模式 Splash 退出不够丝滑 | 1 | transition 从条件分支内移出到容器层 |
| Sidebar 浅色模式颜色被整体改为深色 | 1 | 使用 oklch() 色彩空间 + 玻璃态面板 |
| 浅色模式 Sidebar 选中态颜色偏差 | 1 | 统一使用 `oklch(0.21 0.04 278)` 紫色体系 |
| Tailwind v4 @layer margin/padding 全局失效 | 1 | 删除无层叠的 `* { margin:0;padding:0 }`（与 preflight 冲突） |
| Board 卡片菜单被父容器 overflow 裁切 | 1 | ActionMenuPortal：createPortal 渲染到 document.body |
| ReviewDetailModal 黑屏崩溃 | 1 | `Array.isArray()` 防御 + 移除复杂 Preview Overlay |
| 复盘附件持久化失败 | 2 | IndexedDB + db.close() + 显式 attachments 字段保留 |

## 关键决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| CSS 方案 | Tailwind CSS v4 | 零运行时、CSS-first 配置、`@theme` 指令原生支持设计 Token |
| 状态管理 | Context + useCallback | 仅有 4 个实体（jobs/resumes/tasks/reviews），Context 足够 |
| 构建工具（当前） | Vite | 原生 ESM 支持、Rollup-based 构建 |
| **构建工具（迁移后）** | **Next.js (Turbopack)** | **全栈框架、SSR/SSG、API Routes** |
| 路由方案（当前） | 条件渲染（activePage） | SPA 单页应用，8 个页面通过 state 切换 |
| **路由方案（迁移后）** | **Next.js App Router** | **文件路由、URL 导航、SEO、SSR** |
| 持久化（当前） | localStorage + IndexedDB | 前端本地存储，零服务端依赖 |
| **持久化（迁移后）** | **localStorage + IndexedDB + API + DB** | **渐进式云端同步** |
| **认证（迁移后）** | **Auth.js (NextAuth)** | **Next.js 原生集成、多 Provider** |
| **数据库（迁移后）** | **PostgreSQL + Prisma** | **类型安全、迁移管理、关系查询** |
