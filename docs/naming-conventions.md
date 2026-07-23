# 文件与目录命名规范

| 类型                      | 规则                                        | 示例                                             |
| ------------------------- | ------------------------------------------- | ------------------------------------------------ |
| React 组件、Context、视图 | `PascalCase`                                | `JobModal.jsx`、`AuthContext.jsx`                |
| 普通 JavaScript 模块      | `camelCase`                                 | `jobImport.js`、`resumeFileStore.js`             |
| 脚本、文档、公开静态资源  | `kebab-case`                                | `switch-db.mjs`、`progressive-job-import.md`     |
| 测试                      | 放在 `tests/`，文件名为 `<subject>.test.js` | `job-import.test.js`                             |
| Next.js 路由段            | 小写 `kebab-case`                           | `api/ai/job-import/`                             |
| Next.js 约定文件          | 使用框架规定名称                            | `page.jsx`、`layout.jsx`、`route.js`、`proxy.js` |
| Prisma schema             | `schema.<provider>.prisma`                  | `schema.sqlite.prisma`、`schema.pg.prisma`       |
| 环境模板                  | `.env.<profile>.example`                    | `.env.pg.example`                                |

目录名默认使用小写；仅 Next.js 路由组和动态段使用框架语法，如 `(main)`、`[id]`。新增名称应使用完整业务词，避免引入新的、不明确的缩写。
