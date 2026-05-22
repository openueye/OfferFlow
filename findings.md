# OfferFlow 研究发现

> 项目开发过程中的关键技术发现、决策背景和解决方案

---

## CSS 与主题系统

### oklch() 色彩空间

- **发现**：Tailwind CSS v4 和现代浏览器广泛支持 `oklch()` 色彩空间，比 `hsl()`/`rgb()` 更感知均匀
- **应用**：浅色模式 Sidebar 选中态使用 `oklch(0.21 0.04 278)` 紫色体系，确保跨屏颜色一致
- **注意**：oklch 的浏览器支持需 Chrome 111+ / Firefox 113+ / Safari 15.4+

### 暗色模式光效

- **GlowCard 实现**：通过 CSS 自定义属性 `--mouse-x`/`--mouse-y` 实时跟踪鼠标位置，`radial-gradient` 实现聚光灯效果
- **表单模式**：`handleFocusIn` 回调将光晕中心移至聚焦输入框，提升表单使用体验
- **多变体**：支持 Default / Danger / Success / Data-weak 四种光效强度变体

### ::before fill 渐变边框

- `.modal-panel` 使用 `::before` + `mask` 实现渐变边框，避免 `border-image` 导致的圆角/内容覆盖问题
- 关键在于 `padding: 1px` + `mask: composite` 方案

## 登录页面重新设计（2026-05-19）

### 设计目标

解决登录页面"偏左/视觉不平衡"问题，提升整体 SaaS 品质感。

### 改动要点

**auth/layout.jsx**：
- 移除 `light-ambient-container`（已移至页面级别的 `.light-ambient-bg`），改为 `bg-offer-dark` 基础暗色
- 新增 3 层环境光晕：
  - 左上紫色光晕 (`rgba(126,87,194,0.12)`)  
  - 右下青色光晕 (`rgba(34,200,230,0.08)`)
  - 中心微弱散射
- 3 层光晕使用 `fixed` 定位，不参与布局流

**auth/login/page.jsx**：
- GlowCard 包裹整个表单卡片，提供鼠标跟随聚光灯效果
- 浅色模式：`bg-white/80 backdrop-blur-xl border-slate-200/70` 玻璃拟态
- 暗色模式：`dark:bg-[rgba(20,20,25,0.65)]` 配合 GlowCard 光效
- `max-w-[420px]` 控制卡片宽度，`px-4 py-12` 响应式内边距
- 品牌 Logo：紫色渐变圆角方块 + shadow-lg
- Tab 切换器：滑动指示器动画 (`cubic-bezier(0.22,1,0.36,1)`)
- 输入框：focus ring 紫色 `#7E57C2`，hover 边框变化
- 注册页确认密码字段：`animate-fade-in` 入场动画
- 按钮 hover：`radial-gradient` 内发光
- 底部切换链接：紫色品牌色高亮
- 加载中状态：旋转 spinner + "处理中..."

### Center 方案

```
auth/layout.jsx:          flex + items-center + justify-center (全屏)
auth/login/page.jsx:      flex + min-h-screen + items-center + justify-center (独立)
GlowCard 卡片:             max-w-[420px] + mx-auto (通过 width 约束)
padding:                  px-4 移动端安全边距, py-12 垂直间距
```

### 双 centering 层的必要性

auth/layout 的 flex centering 保证 splash 和 auth 内容整体的居中。login/page 的 flex centering 为 GlowCard 卡片提供独立居中上下文。两层的 flex 中心点重合，确保内容在 `splashDone` 切换过程中视觉位置不变。

---

## Supabase IPv6 DNS 问题与 Neon 迁移（2026-05-19）

### 问题描述

Supabase 项目的数据库域名 `db.dxnepuixvkrwugbrxqqk.supabase.co` **仅返回 IPv6 地址**（AAAA 记录），无 IPv4 A 记录。从 Vercel（AWS 基础设施）和国内网络均无法建立 TCP 连接。

### 诊断过程

内置的 db-check 调试端点（`/api/debug/db-check`）确认：
- **DNS 解析**：仅返回 IPv6 地址 `2406:da1a:82a:9d00:b54:7021:72ac:8b4`
- **TCP 端口**：443、5432、6543 全部超时
- **HTTP** 和 **Prisma 直连**：均失败
- 使用 `nslookup` 本地验证确认 DNS 仅返回 IPv6

### 解决方案

| 方案 | 结果 |
|------|------|
| Supabase（IPv6 only） | ❌ Vercel 无法连接 |
| **Neon PostgreSQL** | ✅ 一次连接成功，IPv4 + IPv6 双栈支持 |

### Neon PostgreSQL 配置要点

- 连接池地址（pooler）：`ep-xxx-pooler.c-8.us-east-1.aws.neon.tech`（DATABASE_URL）
- 直连地址（migrations）：`ep-xxx.c-8.us-east-1.aws.neon.tech`（DIRECT_URL）
- 端口：5432（pooler 和直连均使用 5432）
- SSL：`sslmode=require`

### Prisma 连接池配置

当使用 Neon 连接池器（PgBouncer 模式）时，Prisma 需要：

```prisma
datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")    // pooler 地址
  directUrl    = env("DIRECT_URL")      // 直连地址（用于 migrations）
  relationMode = "prisma"              // 兼容连接池
}
```

- `directUrl` — Prisma CLI 使用直连地址执行 migration
- `DATABASE_URL` — 运行时使用 pooler 地址维持连接池
- `relationMode = "prisma"` — 避免外键约束依赖数据库级 FK（PgBouncer 不支持）

### 双数据库模式

```json
"db:sqlite": "cp prisma/schema.sqlite.prisma prisma/schema.prisma && cp .env.sqlite .env && prisma generate",
"db:pg": "cp prisma/schema.pg.prisma prisma/schema.prisma && cp .env.pg .env && prisma generate"
```

- 开发环境使用 SQLite（零配置）
- 生产环境使用 PostgreSQL（Neon）
- 通过 npm scripts 切换 schema 和 .env

### 经验教训

1. **Supabase 数据库 IPv6-only 问题**：Supabase 项目的数据库域名可能只有 IPv6 记录，在 IPv6 路由不完善的网络环境中完全不可用。这不是配置错误，而是网络架构问题。
2. **选择数据库时需验证 IPv4 兼容性**：对于需要从 Vercel（AWS）或中国网络访问的场景，必须确保数据库有 IPv4 地址。
3. **Neon PostgreSQL 作为 Supabase 替代**：Neon 提供完整的 IPv4 支持、连接池器、按需扩缩容，且兼容 Prisma 连接池配置。
4. **诊断端点价值**：内置的 `/api/debug/db-check` 端点在 Vercel 部署后快速定位了 DNS 和网络问题，比查看 Prisma 错误日志更高效。

---

## React 经验

### useRef 冻结动画类名

- **问题**：React StrictMode 和主题切换（`isDark` 变化）会导致 SplashScreen 退出动画重播
- **方案**：`exitClassRef = useRef()` 在首次进入时冻结退出类名，后续 `isDark` 变化不再更新 ref
- **教训**：条件渲染中的动画逻辑需要考虑 React 重渲染对动画类名的影响

### Context + useCallback 性能

- 使用 `useCallback` 包裹状态更新函数，减少不必要的子组件重渲染
- `setXxx((prev) => ...)` 函数式更新确保数据一致性
- localStorage 同步在 setter 内部完成，对组件透明

### crypto.randomUUID()

- 现代浏览器原生支持 `crypto.randomUUID()` 生成 UUID，无需 uuid 库依赖
- 适用于所有 CRUD 操作的 ID 生成

---

## 工具与库

### Recharts v3.8.1

- React-native 声明式图表 API，适合简单的数据可视化
- 组合模式：`<ResponsiveContainer> → <BarChart> → <Bar> / <XAxis> / <Tooltip>`
- 自定义颜色通过 `fill` prop 或 `<Cell fill={...}>` 实现

### Tailwind CSS v4 变化

- CSS-first 配置（`@import "tailwindcss"` 替代 `@tailwind` 指令）
- `@theme` 指令定义设计 Token
- `@tailwindcss/vite` 插件（PostCSS 插件可选）

---

## 项目当前状态

截至 2026-05-18，项目已完成全部 8 个页面的核心功能：
- 5101+ 行有效代码（30+ 个文件）
- 4 个数据实体（jobs/resumes/tasks/reviews）完整 CRUD
- 深色/浅色完整主题系统
- localStorage 持久化 + IndexedDB 文件存储
- Recharts 数据可视化
- GlowCard 暗色光效系统
- SplashScreen 入场/出场动画

**下一阶段**：Next.js App Router 全栈迁移

---

## 附件持久化与黑屏修复（2026-05-18）

### 黑屏崩溃根因

1. **非数组 `map()` 崩溃**：`liveReview.attachments || []` 仅捕获 `null/undefined`，遗留数据中 attachments 为字符串/非数组时 `attachments.map()` 抛出 `TypeError`。修复：`Array.isArray()` 全量防御
2. **prop 与 state 不同步**：`renderStars(review.rating)` 使用 prop 而非 `liveReview`，删除/编辑后评分区域可能异常
3. **复杂 Preview Overlay**：5 个状态变量 + 2 个 cleanup useEffect 管理内联预览，耦合度高、容易泄漏

### IndexedDB 连接管理

- **问题**：`openDB()` 每次调用都会打开新连接，`oncomplete` 中未 `db.close()` 导致连接泄漏。长期运行的连接可能导致后续操作竞争条件
- **修复**：所有 Promise 的 resolve 和 reject 路径都增加 `db.close()`

## SplashScreen 滚轮失效根因（2026-05-19）

### 问题描述

SplashScreen 页面显示正常，但鼠标滚轮向下滚动时无法进入主应用，用户只能点击按钮进入。

### Root Cause

**auth/layout.jsx 内联了 SplashScreen 的 UI 代码但遗漏了 wheel/touch 事件绑定**。

在会话 16（用户注册登录系统）中，SplashScreen 从 `main-layout-client.jsx` 移至 `auth/layout.jsx`。但 `auth/layout.jsx` 没有复用 `src/components/SplashScreen.jsx` 组件，而是**复制粘贴了其 JSX 结构**，直接内联渲染了 Splash 的 DOM 和按钮交互。关键问题是：

- 内联版本只有按钮 `onClick` 事件
- **缺少 `useEffect` 中的 `window.addEventListener('wheel', ...)` 和 touch 事件绑定**
- **缺少 `useEffect` cleanup 逻辑**
- 滚轮事件和触屏上滑从未被注册监听器，因此永远无法触发

同时，`SplashScreen.jsx` 组件已经实现了完整的交互逻辑：
- `useEffect` 在组件挂载时绑定 wheel/touch 事件
- `{ passive: true }` 兼容被动事件监听
- `deltaY > 10` 阈值过滤微小的滚轮抖动
- `enteredRef` 防重复触发
- 返回的 cleanup 函数在 `entered=true` 后移除所有监听器

### 修复方案

移除 auth/layout.jsx 中的内联 Splash 代码，直接使用 `SplashScreen` 组件：

```jsx
import SplashScreen from '@/components/SplashScreen'
// ...
<SplashScreen entered={splashDone} onEnter={handleEnter} />
```

### 经验教训

1. **不要复制粘贴组件代码** — 当两个地方需要相似的 UI 时，应该提取为共享组件而非复制粘贴。复制粘贴导致事件处理逻辑遗漏。
2. **组件内的事件绑定应始终包含 cleanup** — 确保 `useEffect` 返回 cleanup 函数正确移除事件监听器，防止内存泄漏和异常状态。
3. **SplashScreen 的设计本身就是独立的** — 它接收 `entered` 和 `onEnter` props，可以在任何父组件中使用。如果在迁移过程中直接复用，这个问题就不会出现。

### AppContext 数据安全

- **`updateReview` 覆盖陷阱**：`{ ...r, ...patch }` 中如果 `patch` 不包含 `attachments` 字段，不会覆盖（spread 只覆盖存在的 key）。但关键问题是在 `ReviewModal.handleSave` 中，`data` 始终包含 `attachments` 状态，即使是空数组。所以当编辑模式下没有附件时，`attachments: []` 会被写入，覆盖原有附件
- **修复策略**：`updateReview` 仅当 `Array.isArray(patch.attachments)` 时才替换 `attachments`，否则保留 `r.attachments || []`

---

## Next.js 全栈迁移研究（2026-05-18）

### 架构决策

#### 为什么选择 Next.js App Router

| 维度 | Vite SPA | Next.js App Router |
|------|----------|-------------------|
| 路由 | 条件渲染，非 URL 驱动 | 文件路由，URL 驱动 |
| SEO | 无（纯客户端渲染） | 支持 SSR/SSG |
| API | 需独立服务 | 内置 API Routes |
| 认证 | 无 | Auth.js 原生集成 |
| 文件上传 | IndexedDB 仅客户端 | API Route + S3/本地 |
| 扩展性 | 前端只有 | 全栈统一 |

#### 迁移原则

1. **零功能丢失**：保留全部现有 UI、交互、主题、数据
2. **增量迁移**：页面→组件→状态→API，逐步完成
3. **客户端优先**：先保持所有组件为 `'use client'`，后续优化 SSR 友好组件
4. **数据双轨**：localStorage/IndexedDB 过渡期保留，API + DB 逐步接入

### Tailwind CSS v4 + Next.js 集成要点

- **当前**：使用 `@tailwindcss/vite` 插件，Vite 内联处理
- **迁移**：需要 `postcss.config.mjs` + `@tailwindcss/postcss` 插件
- **注意事项**：
  - Next.js 15.2+ 内置 Turbopack 对 PostCSS 支持有限，可能需要 webpack fallback
  - Tailwind CSS v4 CSS-first 配置无需 `tailwind.config.js`
  - `@import "tailwindcss"` 在 `globals.css` 中正常工作
  - `@custom-variant dark` 保持原样

### Recharts SSR 处理

- Recharts 使用 `d3-scale` 等浏览器 API，SSR 会报错
- 解决方案：`next/dynamic` + `{ ssr: false }` 动态导入图表组件
- 将 Insights.jsx 中的图表抽离为 `ChartComponents.jsx` 客户端组件

### SplashScreen 迁移策略

- 当前：SPA 中 `entered` 状态控制展示/隐藏
- 迁移：使用 Cookie 或 sessionStorage 记录首次访问
- 方案 1：Server Component 检查 Cookie → 跳过 Splash
- 方案 2：Client Component 检查 sessionStorage（推荐，无需改动后端）
- 保留 `splash.html` 作为独立入口

### Sidebar 导航改造

- 当前：`onClick={() => setActivePage(item.key)}`
- 迁移：`onClick={() => router.push('/' + item.key)}`
- 选中态：`usePathname()` 获取当前路径名比较
- `import { usePathname, useRouter } from 'next/navigation'`

### 文件上传双轨策略

- **阶段 1（迁移期）**：保持 IndexedDB 客户端存储，API Routes 仅在需要时调用
- **阶段 2（SaaS）**：API Route 接收文件 → 写入 S3/本地磁盘 → 返回 URL → 元数据存 DB
- 兼容层：`fileStore.js` 统一接口，路由到 IndexedDB 或 API

### Prisma 数据模型

对应现有 4 实体 + 用户系统：

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  jobs      Job[]
  resumes   Resume[]
  tasks     Task[]
  reviews   Review[]
}

model Job { ... }     // 对应现有 Job interface
model Resume { ... }  // 对应现有 Resume interface
model Task { ... }    // 对应现有 Task interface
model Review { ... }  // 对应现有 Review interface（含附件的引用）
```

### 认证流程设计

1. Auth.js（NextAuth v5）集成 GitHub/Google OAuth + Credentials
2. 中间件保护所有 `/dashboard`, `/board` 等路由
3. 未认证用户重定向到 `/auth/login`
4. 认证后绑定 localStorage 数据到用户账户
5. Splash 在认证后首次展示

### 关键风险点

| 风险 | 影响 | 缓解 |
|------|------|------|
| Tailwind v4 + Next.js PostCSS 兼容性 | 样式失效 | 提前验证 `@tailwindcss/postcss` 兼容性 |
| Recharts SSR 报错 | 构建失败 | 使用 `next/dynamic` + `{ ssr: false }` |
| IndexedDB 在 SSR 中不可用 | 服务端渲染错误 | `typeof window` 守卫 + 动态导入 |
| localStorage 在 SSR 中不可用 | 状态初始化异常 | `useState(() => typeof window !== 'undefined' ? ... : fallback)` |
| Drag & Drop 在 SSR 中不可用 | 服务端包含拖拽逻辑 | 拖拽组件动态导入 |
| `'use client'` 传播过深 | 失去 SSR 优势 | 逐步拆分纯展示为服务端组件 |

---

## Next.js 全栈迁移执行记录（2026-05-18）

### 迁移关键发现

#### 1. Next.js 16 与 next-auth v4 的兼容性

**middleware 模式变更**：Next.js 16 弃用了 `export { default } from 'next-auth/middleware'` 的 re-export 模式，要求 middleware 文件显式导出一个函数。改用 `withAuth` 包装：

```js
import { withAuth } from "next-auth/middleware"
export default withAuth({ pages: { signIn: "/auth/login" } })
```

此前版本兼容的 `export { default } from 'next-auth/middleware'` 在 Next.js 16 中会报错："The file must export a function".

#### 2. NextAuth Configuration Error 解决方案

- **问题**：Dashboard 路由被 middleware 拦截后跳转到 `/api/auth/error?error=Configuration`
- **根因**：`NEXTAUTH_SECRET` 环境变量未设置，NextAuth JWT 加密缺少密钥
- **修复**：在 `.env.local` 中设置 `NEXTAUTH_SECRET`（openssl rand -base64 32）

#### 3. force-dynamic 的必要性

`'use client'` 页面在 Next.js 中默认会被尝试静态预渲染（SSG）。如果它在渲染过程中依赖客户端 Context（如 `useApp()`），静态生成阶段会因为找不到 Provider 而失败。

**解决方案**：在 layout 层添加 `export const dynamic = 'force-dynamic'`，阻止 Next.js 对路由组下的页面进行静态预渲染。

关键文件：
- `src/app/(main)/layout.jsx` — force-dynamic（主应用）
- `src/app/auth/layout.jsx` — force-dynamic（认证页面）

#### 4. SSR 中客户端存储不可用

即使组件标记了 `'use client'`，Next.js 仍然会在服务端执行一次组件代码以生成初始 HTML。以下情况会报错：

```js
// ❌ TypeError: localStorage is not defined
const [data] = useState(() => localStorage.getItem('key'))
```

**修复模式**：
```js
const [data] = useState(() => {
  if (typeof window === 'undefined') return fallback
  return localStorage.getItem('key')
})
```

已修复文件：
- `src/store/AppContext.jsx` — `loadFromStorage()` 函数
- `src/store/ThemeContext.jsx` — `getInitialTheme()` 函数

#### 5. Pages Router 与 App Router 冲突

Next.js 中 `src/pages/` 目录会被自动识别为 Pages Router 路由。当 `src/pages/Dashboard.jsx` 等文件存在时，Next.js 会尝试为 `/Dashboard` 等路径生成 Pages Router 路由，导致构建冲突。

**解决方案**：将 `src/pages/` 重命名为 `src/views/`，更新所有导入路径。

#### 6. Turbopack 冷启动性能

Next.js 16 Turbopack 冷启动时间：**~260ms**，比 Vite 冷启动（~800ms）快约 3 倍。HMR 响应速度也更快。

#### 7. 构建输出分析

```
Route (app)                              Size
┌ ○ /                                    5 kB
├ ○ /_not-found                          1 kB
├ ƒ /auth/login                          5.2 kB
├ ƒ /auth/register                       5.2 kB
├ ƒ /board                               5 kB
├ ƒ /dashboard                           5 kB
├ ƒ /insights                            5 kB
├ ƒ /interview                           5 kB
├ ƒ /positions                           5 kB
├ ƒ /resumes                             5 kB
├ ƒ /schedule                            5 kB
├ ƒ /settings                            5 kB
○ (Static)   prerendered as static content
ƒ (Dynamic)  server-rendered on demand
```

- 3 个静态路由（/、/_not-found、/api/auth/session）
- 9 个动态路由（用户认证 pages + 7 主页面）
- 页面初始体积约 5 kB（得益于 Turbopack 的 Tree Shaking）

#### 8. 客户端布局拆分模式

为了同时支持 SSR、客户端交互和 force-dynamic，采用了双文件模式：

- `(main)/layout.jsx` — 服务端组件，导出 `dynamic = 'force-dynamic'`
- `(main)/main-layout-client.jsx` — 客户端组件，包含 SplashScreen/Navbar/Sidebar/BottomNav

这样既阻止了静态预渲染，又保持了客户端交互性。服务端 layout 不包含 `'use client'`，因此 `metadata` 导出也能正常工作（metadata 不能在客户端组件中导出）。

#### 9. 路由规划验证

| 路由 | 预期 | 实测 |
|------|------|------|
| `/auth/login` | 200（登录页渲染） | ✅ 200 |
| `/auth/register` | 200（注册页渲染） | ✅ 200 |
| `/dashboard` | 307 → /auth/login | ✅ 307 |
| `/board` | 307 → /auth/login | ✅ 307 |
| `/positions` | 307 → /auth/login | ✅ 307 |
| `/resumes` | 307 → /auth/login | ✅ 307 |
| `/interview` | 307 → /auth/login | ✅ 307 |
| `/schedule` | 307 → /auth/login | ✅ 307 |
| `/insights` | 307 → /auth/login | ✅ 307 |
| `/settings` | 307 → /auth/login | ✅ 307 |
| `/api/auth/session` | 200 `{}` | ✅ 200 `{}` |
| `/api/jobs` | 200 stub | ✅ 200 |

#### 10. 删除的 Vite 项目文件

| 文件 | 原因 |
|------|------|
| `index.html` | Vite 入口 HTML，Next.js 不再使用 |
| `splash.html` | Splash 迁移至 Next.js 路由 |
| `vite.config.js` | Vite 配置，已被 next.config.mjs + postcss.config.mjs 替代 |
| `eslint.config.js` | Vite ESLint flat config，将被 next lint 替代 |
| `src/main.jsx` | Vite React 入口，Next.js 使用 App Router |
| `src/App.jsx` | Vite 根组件，路由逻辑已迁移 |
| `src/pages/*` | 移至 src/views/（避免 Pages Router 冲突） |
| `dist/` | Vite 构建产物 |
| `_screenshot2.cjs` | 截图辅助脚本，不再需要 |

---

## 用户注册登录系统（2026-05-18）

### 架构选型

| 方案 | 优点 | 缺点 | 选择理由 |
|------|------|------|----------|
| NextAuth.js v4/v5 | 多 Provider、内置中间件、Session 管理 | 重依赖、配置复杂、CredentialsProvider 有安全警告 | 替换理由：项目只需用户名+密码，无需 OAuth |
| **自定义 JWT (bcrypt + jose)** | **零运行时依赖、完全可控、轻量** | **需自行实现所有逻辑** | **✅ 最终选择** |
| Clerk / Auth0 | 开箱即用、多因素认证 | 第三方依赖、供应商锁定、付费 | 不适合自托管项目 |

### jose 库的选择

- **jsonwebtoken**：Node.js 内置 `crypto` 模块依赖，不支持 Edge Runtime
- **jose**：纯 JS 实现，支持 Edge Runtime（Next.js Middleware）、Web Crypto API、Deno、Bun
- 由于 Next.js Middleware 在 Edge Runtime 运行，必须使用 `jose`

### bcryptjs 的选择

- **bcrypt**：原生 C++ 实现，需要在安装时编译，Windows 上常遇到问题
- **bcryptjs**：纯 JS 实现，无需编译，API 兼容，性能足够（认证场景调用频率低）
- 选择 bcryptjs 避免 Windows 编译问题

### JWT 无状态认证流程

```
1. 注册/登录 → 服务端签发 JWT (HS256, 7天过期)
2. 设置 httpOnly Cookie (Secure, SameSite=Lax)
3. 页面请求 → Middleware 读取 Cookie → jwtVerify → 有效则放行
4. API 请求 → getAuthUser() 读取 Cookie → jwtVerify → 返回 user
5. 登出 → 设置 Cookie maxAge=0
```

### Cookie vs localStorage 存储 Token 的决策

| 方案 | 安全性 | 自动携带 | 适用场景 |
|------|--------|----------|----------|
| httpOnly Cookie | ✅ 防 XSS 窃取 | ✅ 自动附加到请求 | 生产环境认证 |
| localStorage + Authorization Header | ⚠️ 可被 XSS 读取 | ❌ 需手动处理 | SPA 无后端场景 |

**结论**：httpOnly Cookie 更安全，且 Middleware 可以自动读取，无需前端手动处理。

### useSearchParams Suspense 坑

Next.js 中，使用 `useSearchParams()` 的组件必须被 `<Suspense>` 包裹，否则构建时会报错：

```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/auth/login".
```

修复：将使用 `useSearchParams` 的 LoginForm 抽为子组件，页面组件用 `<Suspense>` 包裹。

### SQLite 开发数据库选择

| 数据库 | 开发环境 | 生产环境 |
|--------|----------|----------|
| SQLite | ✅ 零配置，文件存储 | ❌ 不适合并发 |
| PostgreSQL | ❌ 需要单独安装 | ✅ 适合生产 |

Prisma schema 支持在 SQLite 和 PostgreSQL 之间切换，只需修改 `provider` 和 `DATABASE_URL`。

### .env vs .env.local 优先级

- **Next.js**：`.env.local` > `.env.development` > `.env`
- **Prisma CLI**：仅读取 `.env`，不读 `.env.local`
- 解决方案：DATABASE_URL 放在 `.env` 中，Prisma 和 Next.js 都能读取

### 认证系统验证矩阵

| 测试用例 | 预期 | 实测 |
|----------|------|------|
| 注册 (username + password) | 201 + Cookie | ✅ |
| 重复注册 | 409 "用户名已被注册" | ✅ |
| 登录 (正确密码) | 200 + Cookie | ✅ |
| 登录 (错误密码) | 401 "用户名或密码错误" | ✅ |
| 短密码 (3位) | 400 "密码长度至少 6 位" | ✅ |
| 空字段 | 400 "用户名和密码不能为空" | ✅ |
| /me (有 Cookie) | 200 { user } | ✅ |
| /me (无 Cookie) | 200 { user: null } | ✅ |
| /dashboard (有 Cookie) | 200 | ✅ |
| /dashboard (无 Cookie) | 307 → /auth/login | ✅ |
| 登出 | 清除 Cookie | ✅ |
| 登出后 /me | 200 { user: null } | ✅|

---

## AI 面试复盘分析系统设计（2026-05-22）

### LLM 选择与抽象

- **DeepSeek / Xiaomi MiMo**：都兼容 OpenAI API 格式，可以统一通过 `fetch` + 环境变量切换
- 无需 SDK，直接调用 `/chat/completions` 端点
- `response_format: { type: 'json_object' }` 确保 LLM 返回结构化 JSON
- 环境变量驱动切换：改 `.env` 即可换模型，零代码变更

### .docx 解析方案

- **mammoth** 纯 JS 库，无需编译，`extractRawText` 直接转纯文本
- 与项目 "纯 JS 无原生编译依赖" 的技术哲学一致（如 `bcryptjs` 替代 `bcrypt`）

### 产品文档更新

**时间**：2026-05-22
**位置**：OfferFlow-产品需求与技术文档.md

- 6.8 面试复盘 — 补充 AI 分析功能描述
- 8.4 Review 数据模型 — 新增 `aiAnalysis` 字段
- 12. 现状与规划 — 已添加"AI 面试复盘分析"到待完成列表
- 目录结构 — 新增 `src/lib/llm/`、`src/lib/ai/`、`src/app/api/ai/` 路径
- 技术栈表 — 新增 `mammoth` / `@vercel/blob` 依赖项

### 问题描述

控制台报错：`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`。功能正常，但控制台存在红色错误。

### Root Cause

**中间件对所有未认证请求返回 HTML 重定向**，但前端 API 客户端 (`apiFetch`) 期望 JSON 响应。

具体链路：
1. 用户访问 `/auth/login` 登录页
2. 根布局 `providers.jsx` 挂载 `AppProvider`
3. `AppContext` 的 `useEffect` 立即调用 `loadAllData()`
4. `loadAllData()` fetch 受保护的 API 路由 `/api/jobs`、`/api/resumes` 等
5. 中间件检测到无 JWT Cookie，将请求 **307 重定向**到 `/auth/login?callbackUrl=...`
6. 重定向返回 HTML 页面
7. `apiFetch` 执行 `res.json()`，将 HTML 解析为 JSON → `SyntaxError`

同样的错误不会在已登录状态下出现，因为 JWT Cookie 存在，中间件放行 API 请求。

### 修复方案

在中间件中区分 **API 路由**和**页面路由**：

- **API 路由**（`/api/jobs`、`/api/resumes` 等）：未认证时返回 `{ error: 'Unauthorized' }` JSON 和 401 状态码
- **页面路由**（`/dashboard`、`/board` 等）：未认证时 307 重定向到登录页

这样 `apiFetch` 接收到 401 响应后进入 catch 分支，错误信息清晰，不会尝试解析 HTML。

### 经验教训

1. **API 请求永远不应该返回 HTML 页面** — 中间件在处理 API 路由和页面路由时应当返回不同格式的错误响应
2. **ApiFetch 在未登录页也会被调用** — 因为 `AppProvider` 在所有页面（包括登录页）挂载，其 `useEffect` 会在任何页面加载时触发数据获取
3. **后续改进方向**：可以让 `AppContext` 感知认证状态，仅在已登录时发起 API 请求，进一步减少不必要的网络请求

---

## localStorage → SQLite 数据迁移（2026-05-18）

### Prisma 空字符串 vs null FK 问题

**问题**：当 `Job.resumeId` 为 `String?`（可选）时，前端表单传递 `resumeId: ''`（空字符串），Prisma 将其作为有效值处理，尝试匹配 id 为 '' 的 Resume 记录，导致外键约束失败（500 错误）。

**根因**：JavaScript 中 `''` 和 `null` 不同。Prisma 将 `String?` 字段的 `''` 视为有效引用值，只有 `null` 表示无关联。

**修复**：
```js
// ❌ 空字符串被当做有效 FK 值
resumeId: resumeId || '',

// ✅ 空字符串转为 null，跳过 FK 约束
resumeId: resumeId || null,
```

同样需要在 PUT 路由中添加守卫：
```js
if (data.resumeId === '') data.resumeId = null
```

**教训**：所有可选外键字段在 API 层必须将空字符串显式转换为 null。

### API CRUD 一致性模式

所有 4 个实体 API 端点遵循相同模式：

| 操作 | 鉴权 | 数据过滤 | 返回值 |
|------|------|----------|--------|
| GET | getAuthUser() | where: { userId } | 数组 |
| POST | getAuthUser() | 绑定 userId | { job/resume/task/review } |
| PUT | getAuthUser() + 所有权验证 | findUnique + userId 比对 | { job/resume/task/review } |
| DELETE | getAuthUser() + 批量所有权验证 | findMany where { id: { in: ids }, userId } | { success, deletedIds } |

### Prisma Json 字段处理

`Job.interviewRounds`、`Job.timeline`、`Resume.tags`、`Review.scores`、`Review.questions` 等字段使用 Prisma `Json` 类型。SQLite 使用 `text` 列存储 JSON 字符串。传递时必须使用 JavaScript 数组/对象，Prisma 自动序列化/反序列化。

### AppContext 双轨架构

```
页面组件 → addXxx/updateXxx/deleteXxx (async)
                ↓
          API 请求 → 成功 → 更新 state → 写入 localStorage
                ↓
              失败 → 保持现有 state → addToast 错误通知
```

- 所有 CRUD 方法内部 try/catch，页面组件无需额外错误处理
- localStorage 作为缓存（每次 state 变更同步）和 API 失败的回退
- 启动时 `loadAllData()` 先尝试 API，失败则回退到 localStorage

---

## 用户数据隔离修复（2026-05-20）

### 根因分析

**核心发现：API 层数据隔离正确，问题出在 Seed 机制和客户端缓存管理。**

#### 第一层：数据"看起来"未隔离的根因

1. **Auto-Seed 机制**：`AppContext.jsx` 在 `loadAllData()` 中检测 API 返回空数据时自动调用 `POST /api/seed`。由于每个新用户注册后数据为空，每个用户都触发 seed 写入相同的 14 岗位/5 简历/11 任务/7 复盘数据。虽然每条记录都正确绑定了各自的 `userId`，但数值完全相同，用户感知为"不同账号看到同一份数据"。

2. **GET 返回 `[]` 而非 401**：GET 端点在未认证时返回空数组 `[]`，apiFetch 成功解析为空数组而非进入 catch 分支，导致 seed 路径被正常触发。

3. **localStorage 未清理**：退出登录时不清除 localStorage，如果下一个用户的 API 调用失败，AppContext 会回退到上一个用户的旧缓存。

#### 第二层：为什么本地 SQLite 正常但线上 PostgreSQL 异常

实际差异是因为**本地开发时每个环境有独立的 SQLite 文件**，不存在多用户数据共享场景。而 Neon PostgreSQL 是多租户共享数据库，seed 数据被多个用户写入的效应变得可见。

### 修复方案

#### 修复 1：Seed API 限制
```js
// src/app/api/seed/route.js
if (user.username !== 'user') {
  return NextResponse.json({ message: '非测试账户，跳过种子数据初始化' })
}
```
仅 `user` 账户可触发种子数据，其他用户空数据启动。

#### 修复 2：API GET 401
```js
// 所有 4 个业务 API
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

#### 修复 3：AppContext 认证感知
```js
// 监听认证状态变化，自动重载数据
useEffect(() => {
  if (authLoading) return
  loadAllData()
}, [user?.id, authLoading])

// 401 时不回退到 localStorage
if (err.message === 'Unauthorized') {
  setJobsRaw([]) // 直接显示空数据
}
```

#### 修复 4：退出登录清理
```js
// AuthContext.logout()
localStorage.removeItem('offerFlow_jobs')
localStorage.removeItem('offerFlow_resumes')
localStorage.removeItem('offerFlow_tasks')
localStorage.removeItem('offerFlow_reviews')
```

#### 修复 5：添加 userId 索引
```prisma
model Job {
  // ...
  @@index([userId])
}
```

### 安全边界验证

| 场景 | 预期 | 验证 |
|------|------|------|
| 未认证访问 API | 401 JSON | `{ error: 'Unauthorized' }` |
| 用户 A 只能看到自己的 jobs | A 的 userId 过滤 | GET `where: { userId }` |
| 用户 A 创建 job 写入正确 userId | POST 绑定 `userId: user.id` | 数据库验证 |
| 用户 B 无法修改 A 的 job | 403 "无权修改" | `existing.userId !== user.id` |
| 用户 B 无法删除 A 的 job | 403 "无权删除" | DELETE 所有权验证 |
| 退出登录后缓存隔离 | localStorage 清理 | logout 清除 4 个 key |
| 登录/登出切换自动重载 | useEffect 依赖 `user?.id` | 认证变化触发 loadAllData |

### 生产数据清理

部署后需在 Neon 中执行：

```sql
-- 清理非 test 账户的种子数据
DELETE FROM reviews  WHERE userId NOT IN (SELECT id FROM users WHERE username = 'user');
DELETE FROM tasks    WHERE userId NOT IN (SELECT id FROM users WHERE username = 'user');
DELETE FROM jobs     WHERE userId NOT IN (SELECT id FROM users WHERE username = 'user');
DELETE FROM resumes  WHERE userId NOT IN (SELECT id FROM users WHERE username = 'user');
```

注意：这会删除所有非 `user` 账户自行创建的数据。如果已有用户创建了真实数据，需要先备份。


---

## AI 面试分析系统（2026-05-22）

### 技术选型

**LLM Provider 抽象层**：
- OpenAI-compatible API 封装，环境变量驱动配置切换
- 默认 DeepSeek（`api.deepseek.com`），可切换 Xiaomi MiMo 等其他提供方
- 零代码变更：仅需修改 `.env` 中的 `LLM_BASE_URL` 和 `LLM_MODEL`

**文档解析**：
- `mammoth@1.x`（最新版本为 1.12.0，非 v2），纯 JS 无需编译
- `mammoth.extractRawText()` 仅提取纯文本，不保留格式/图片
- 限制 10MB 文件大小，避免超大文档导致 LLM Token 溢出

**文件存储**：
- 本地开发：`public/uploads/reviews/{reviewId}/` 目录
- 生产环境：通过 `@vercel/blob@2.x`（最新版本 v2.4.0，非 v8）
- 统一接口 `saveFile()` / `deleteFile()`，通过环境变量切换

**Prisma aiAnalysis 字段**：
- 类型 `Json?`，存储 AI 分析元数据（provider、model、timestamp 等）
- 前端 `aiMetaRef` useRef 穿透保存，不与表单 state 混合
- `userModified: true` 标记用户已确认/修改过 AI 结果

**Prompt 设计**：
- 中文 prompt，要求 JSON 格式输出（`response_format: { type: 'json_object' }`）
- 分析 prompt 包含 8 维评分、优势/不足、面试问题、改进建议
- 趋势 prompt 分析高频薄弱点、评分趋势、问题类型分布
- 极简 system prompt（`你是一位资深的<岗位>面试专家`），岗位由前端传入

### 包版本注意事项

- `@vercel/blob`：npm 最新版为 `2.4.0`（文档可能引用旧版 `^8`），需用 `npm view @vercel/blob versions --json` 确认
- `mammoth`：npm 最新版为 `1.12.0`（文档可能引用 `^2`），同上确认
- Prisma：当前使用 v6.19.3，schema 文件 3 份（sqlite/pg 双数据库）

### 前端 AI 集成模式

- **"Preview → modify → confirm"** 模式：AI 结果不自动保存到数据库
- AiResultPanel 独立组件，内部管理编辑状态（scores/strengths/weaknesses 等）
- ReviewModal 通过 `handleApplyAiResult` 将编辑后的结果填充到表单
- `aiMetaRef` useRef 持久化 AI 元数据，不影响表单渲染
- 保存时 `aiAnalysis` 字段包含 `metadata + userModified: true`

### 趋势报告数据流

- GET /api/ai/trends 从数据库读取当前用户所有 Review 记录
- 将数据传给 `buildTrendsPrompt()` 生成 prompt
- 前端 TrendReportModal 展示结构化结果（高频薄弱点、评分趋势、进步项、建议、常见问题、问题分布）
