# Claude 对话上下文

## 快速恢复指令

**下次对话时复制这段话给 Claude**：

```
我正在开发一个 Windows 屏幕追踪系统。

项目位置：D:\Zhuobin Vide Coding\【review screen】

当前状态：
- 项目代码已经 100% 完成
- 遇到的问题：better-sqlite3 需要 Visual Studio Build Tools 才能编译
- 文件位置：查看 PROJECT_STATUS.md 了解完整状态

请继续帮我：
1. 解决依赖安装问题，或
2. 创建一个不需要编译的简化版本

项目需求：
- 每 5 分钟截屏一次
- 检测并模糊敏感内容（密码、邮箱等）
- 使用本地 Ollama AI 分析活动
- 生成每日总结和时间统计
- 提供 Web 仪表盘查看数据
```

---

## 当前会话重点

### 用户需求（原文）
> "设计一个每5分钟定时快照我的屏幕，并且每晚根据快照截图总结出我一天都干了什么，统计占用的时间占比；并且反推我应该做怎样的时间管理改进"

### 实现方案
1. **后端**：Node.js + TypeScript + Express
2. **前端**：Next.js + React + Tailwind CSS
3. **AI**：本地 Ollama (llava 模型)
4. **数据库**：SQLite (better-sqlite3)
5. **截图**：node-screenshots (Windows)

### 关键文件
- `backend/src/index.ts` - 后端入口
- `backend/src/core/scheduler.ts` - 定时截屏
- `backend/src/core/ollama.ts` - AI 分析
- `frontend/app/page.tsx` - 仪表盘界面
- `README.md` - 完整文档

---

## 重要提示

⚠️ **better-sqlite3 编译问题**
- Windows 上需要 Visual Studio Build Tools
- 如果用户不想安装，可以换成 lowdb（纯 JSON）

✅ **前端可以独立运行**
```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

🔧 **后端需要先解决编译问题**
- 安装 VS Build Tools，或
- 修改代码使用 lowdb

---

**创建时间**：2025-03-12 22:39
**会话 ID**：floofy-dancing-moore
