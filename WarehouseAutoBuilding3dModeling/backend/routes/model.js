import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import DXFTo3DService from '../services/dxfTo3D.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const dxfService = new DXFTo3DService({
  wallHeight: 4,
  wallThickness: 0.24
});

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.dxf') {
      cb(null, true);
    } else {
      cb(new Error('只支持.dxf格式文件'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * POST /api/model/upload
 * 上传DXF文件并生成3D模型
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '请上传DXF文件'
      });
    }

    console.log('📐 收到DXF文件:', req.file.filename);

    // 读取DXF文件内容
    const dxfPath = req.file.path;
    const dxfContent = await fs.readFile(dxfPath, 'utf-8');

    // 解析DXF
    console.log('🔍 正在解析DXF文件...');
    const entities = dxfService.parseDXF(dxfContent);
    console.log(`✅ 解析完成，找到 ${entities.length} 个实体`);

    // 生成3D场景
    console.log('🏗️ 正在生成3D模型...');
    const scene3D = dxfService.generate3DGeometry(entities);
    console.log(`✅ 3D模型生成完成，包含 ${scene3D.objects.length} 个对象`);

    // 清理上传的文件
    await fs.unlink(dxfPath);

    // 返回3D场景数据
    res.json({
      success: true,
      data: {
        scene: scene3D,
        filename: req.file.filename,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('❌ 处理DXF文件时出错:', error);

    // 清理文件（如果存在）
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('清理文件失败:', err);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/model/health
 * 健康检查
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DXF解析服务运行正常',
    timestamp: Date.now()
  });
});

export default router;
