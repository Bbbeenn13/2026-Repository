# 项目状态文档

## 📋 项目概述
**项目名称**：Screen Tracker - Windows 屏幕追踪系统
**创建日期**：2025-03-12
**状态**：开发中 - 代码已完成，依赖安装中

## ✅ 已完成的工作

### 1. 项目结构创建
- ✅ 根目录 package.json（monorepo 配置）
- ✅ 后端 TypeScript 配置
- ✅ 前端 Next.js 配置
- ✅ .gitignore 配置
- ✅ 环境变量配置文件

### 2. 后端代码（100% 完成）
**位置**：`backend/src/`

核心模块：
- ✅ `core/screenshot.ts` - 截屏捕获模块
- ✅ `core/privacy.ts` - 隐私检测和模糊处理
- ✅ `core/ollama.ts` - Ollama AI 集成
- ✅ `core/scheduler.ts` - 定时调度（5分钟间隔）

存储层：
- ✅ `storage/models.ts` - 数据模型和数据库 schema
- ✅ `storage/database.ts` - SQLite 数据库操作

分析引擎：
- ✅ `analysis/summarizer.ts` - 每日总结生成
- ✅ `analysis/timeTracker.ts` - 时间统计分析

API 层：
- ✅ `api/routes.ts` - Express API 路由

配置和工具：
- ✅ `config/settings.ts` - 应用配置
- ✅ `config/constants.ts` - 常量定义
- ✅ `utils/logger.ts` - 日志系统
- ✅ `index.ts` - 后端入口文件

### 3. 前端代码（100% 完成）
**位置**：`frontend/app/`

- ✅ `layout.tsx` - 根布局
- ✅ `page.tsx` - 主仪表盘页面
- ✅ `globals.css` - 全局样式（Tailwind CSS）
- ✅ `tailwind.config.ts` - Tailwind 配置
- ✅ `next.config.ts` - Next.js 配置

### 4. 文档
- ✅ `README.md` - 完整的项目文档
- ✅ `backend/.env` - 环境变量配置

### 5. 目录结构
- ✅ `data/screenshots/` - 截图存储目录
- ✅ `logs/` - 日志目录
- ✅ `backend/database/` - 数据库目录

## ⚠️ 当前问题

### 依赖安装问题
**问题**：`better-sqlite3` 需要 Visual Studio Build Tools 编译
**影响**：后端依赖无法安装

**解决方案选项**：
1. 安装 Visual Studio Build Tools（推荐）
2. 替换为 `lowdb`（纯 JSON 数据库，不需要编译）

### 文件锁定问题
**问题**：node_modules 目录中的某些文件被锁定
**临时解决**：重启电脑或关闭相关进程

## 🔧 技术栈

### 后端
- Node.js + TypeScript
- Express.js（API 服务器）
- node-screenshots（Windows 截屏）
- active-win（活动窗口检测）
- node-cron（定时任务）
- better-sqlite3（SQLite 数据库）*需要编译*
- sharp（图像处理）*需要编译*
- Tesseract.js（OCR 文字识别）
- ollama（本地 AI）
- winston（日志系统）

### 前端
- Next.js 15（App Router）
- React 19
- Tailwind CSS
- Lucide React（图标）
- date-fns（日期处理）

## 📝 待办事项

### 高优先级
1. **解决依赖安装问题**
   - [ ] 安装 Visual Studio Build Tools
   - [ ] 或者替换 better-sqlite3 为 lowdb
   - [ ] 完成后端依赖安装

2. **测试基本功能**
   - [ ] 启动后端服务器
   - [ ] 启动前端仪表盘
   - [ ] 测试截屏功能
   - [ ] 测试 AI 分析

### 中优先级
3. **完善功能**
   - [ ] 添加图表库（Recharts）
   - [ ] 完善错误处理
   - [ ] 添加单元测试

4. **部署**
   - [ ] Windows 服务集成
   - [ ] 系统托盘图标
   - [ ] 自动启动配置

## 🚀 启动命令

### 安装依赖
```bash
# 方法 1：安装所有依赖
npm run install:all

# 方法 2：分别安装
cd backend && npm install
cd frontend && npm install
```

### 开发模式
```bash
# 启动所有服务
npm run dev

# 或分别启动
npm run dev:backend  # 端口 3001
npm run dev:frontend # 端口 3000
```

### 生产模式
```bash
npm run build
npm start
```

## 🔗 重要链接

- Ollama: https://ollama.ai
- 需要安装的模型：`ollama pull llava`

## 📌 下次继续的关键点

### 如果需要解决依赖问题
1. 询问用户是否已安装 Visual Studio Build Tools
2. 如果没有，提供安装链接
3. 或者创建不需要编译的简化版本

### 如果依赖已安装
1. 运行 `npm run install:all`
2. 启动开发服务器 `npm run dev`
3. 测试功能

### 如果需要修改代码
1. 主要修改文件：
   - `backend/src/storage/database.ts`（如果换数据库）
   - `backend/src/core/screenshot.ts`（如果换截图库）
   - `backend/package.json`（依赖配置）

## 💡 重要提示

- **所有数据存储在本地**，不会上传云端
- **Ollama 需要单独启动**：`ollama serve`
- **默认配置**已经写在 `backend/.env` 文件中
- **端口分配**：后端 3001，前端 3000

## 📞 需要帮助时

告诉 Claude：
1. "继续安装依赖"
2. "创建不需要编译的简化版本"
3. "测试截图功能"
4. 或者描述遇到的具体问题

---

**最后更新**：2025-03-12 22:39
**对话摘要**：项目代码已全部完成，正在解决 Windows 环境下的依赖编译问题。
