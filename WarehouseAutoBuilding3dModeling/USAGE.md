# 使用说明

## 快速开始

### 1. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 2. 启动服务

**终端1 - 启动后端：**
```bash
cd backend
npm run dev
```

你会看到：
```
╔═════════════════════════════════════════════════════════╗
║                                                           ║
║   🏭 仓库3D可视化系统 - 后端服务                          ║
║                                                           ║
║   ✅ 服务已启动                                           ║
║   📍 地址: http://localhost:3001                        ║
║   📐 DXF解析: /api/model/upload                          ║
║   ❤️  健康检查: /api/health                              ║
║                                                           ║
╚═════════════════════════════════════════════════════════╝
```

**终端2 - 启动前端：**
```bash
cd frontend
npm run dev
```

### 3. 访问应用

浏览器打开：`http://localhost:5173`

## 测试示例

项目包含一个示例DXF文件：`samples/simple-warehouse.dxf`

这个文件包含：
- 一个10x8米的矩形仓库
- 内部隔断墙
- 一个圆形柱子

## DXF文件格式要求

### 支持的实体类型

1. **LINE** - 直线段（墙体）
   ```
   0
   LINE
   10
   起点X坐标
   20
   起点Y坐标
   11
   终点X坐标
   21
   终点Y坐标
   ```

2. **LWPOLYLINE** - 多段线（连续墙体）
3. **CIRCLE** - 圆（柱子）
4. **ARC** - 圆弧（曲面墙）

### 坐标系统

- 使用**毫米(mm)**或**米(m)**为单位
- Y轴方向：向上为正
- 原点(0,0)通常在左下角

### 图层规范

建议按图层区分：
- `WALL` - 墙体
- `COLUMN` - 柱子
- `WINDOW` - 窗户（未来支持）
- `DOOR` - 门（未来支持）

## API接口

### POST /api/model/upload

上传DXF文件并生成3D模型

**请求：**
```javascript
const formData = new FormData();
formData.append('file', dxfFile);

const response = await fetch('/api/model/upload', {
  method: 'POST',
  body: formData
});
```

**响应：**
```json
{
  "success": true,
  "data": {
    "scene": {
      "objects": [
        {
          "id": "uuid",
          "type": "wall",
          "geometry": { "type": "box", "width": 10, "height": 4, "depth": 0.24 },
          "position": { "x": 5, "y": 0, "z": 4 },
          "rotation": { "x": 0, "y": 0, "z": 0 },
          "material": { "color": 0xcccccc, "roughness": 0.8 }
        }
      ],
      "metadata": {
        "totalWalls": 4,
        "totalArea": 80
      }
    }
  }
}
```

## 常见问题

### 1. DXF文件无法解析

**原因：**
- 文件格式不正确
- 缺少必需的实体数据

**解决：**
- 确保文件包含ENTITIES段
- 检查坐标数据是否完整

### 2. 3D模型显示不正确

**原因：**
- 坐标单位不一致
- 图纸比例问题

**解决：**
- 统一使用米或毫米
- 调整 `dxfTo3D.js` 中的墙高、墙厚参数

### 3. 前端连接后端失败

**原因：**
- 端口冲突
- CORS配置问题

**解决：**
- 检查后端是否在3001端口运行
- 确认 `vite.config.js` 中的代理配置

## 下一步开发

### 短期目标
- [ ] 添加门窗识别
- [ ] 支持多层建筑
- [ ] 材质库管理
- [ ] 导出GLTF/OBJ文件

### 长期目标
- [ ] AI辅助识别
- [ ] VR/AR支持
- [ ] 实时协作
- [ ] 云端存储

## 技术支持

遇到问题？请检查：
1. 后端控制台日志
2. 浏览器开发者工具（F12）
3. 网络请求是否成功

## 许可证

MIT License - 自由使用和修改
