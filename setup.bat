@echo off
chcp 65001 >nul
title OfferFlow 本地部署

echo ============================================
echo   OfferFlow - 求职全流程管理工具
echo   本地部署脚本
echo ============================================
echo.

:: 1. 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js！
    echo 请先下载安装 Node.js LTS：https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Node.js 版本：
node -v
echo.

:: 2. 安装依赖
echo [2/4] 安装项目依赖...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [提示] npm install 失败。如果网络超时，可尝试设置镜像源：
    echo        npm config set registry https://registry.npmmirror.com
    pause
    exit /b 1
)
echo.

:: 3. 切换到 SQLite 模式
echo [3/4] 切换到 SQLite 本地数据库...
copy /Y prisma\schema.sqlite.prisma prisma\schema.prisma >nul

echo 生成 Prisma 数据库客户端...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Prisma 生成失败
    pause
    exit /b 1
)
echo.

:: 4. 初始化 .env（如不存在）
echo [4/4] 检查环境配置文件...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo 已从 .env.example 生成 .env 文件。
        echo 请用记事本打开 .env 文件，修改 JWT_SECRET 为一个随机字符串。
        echo 然后在设置页面中填写你的 LLM API Key。
    ) else (
        echo [警告] 未找到 .env.example，请手动创建 .env 文件。
    )
) else (
    echo .env 已存在，跳过。
)

echo.
echo ============================================
echo   部署完成！
echo ============================================
echo.
echo   启动命令：npm run dev
echo   访问地址：http://localhost:3000
echo.
echo   首次使用：
echo     1. 浏览器打开 http://localhost:3000
echo     2. 注册一个账号
echo     3. 进入"设置"-"AI 模型配置"
echo     4. 填入你的 LLM API Key 即可使用 AI 面试分析
echo.
pause
