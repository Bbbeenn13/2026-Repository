import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import modelRouter from './routes/model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// API路由
app.use('/api/model', modelRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '仓库3D可视化系统后端服务',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔═════════════════════════════════════════════════════════╗
║                                                           ║
║   🏭 仓库3D可视化系统 - 后端服务                          ║
║                                                           ║
║   ✅ 服务已启动                                           ║
║   📍 地址: http://localhost:${PORT}                        ║
║   📐 DXF解析: /api/model/upload                          ║
║   ❤️  健康检查: /api/health                              ║
║                                                           ║
╚═════════════════════════════════════════════════════════╝
  `);
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
});

export default app;
