# 🏭 Warehouse 3D Visualization System

> **Transform 2D CAD drawings into interactive 3D warehouse models automatically**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://react.dev)

## 📖 Overview

This system automatically converts 2D warehouse layout drawings (DXF format) into interactive 3D models, enabling customers to visualize warehouse spaces in three dimensions with realistic rendering and intuitive controls.

### ✨ Key Features

- 🎯 **One-Click Conversion** - Upload DXF files and instantly generate 3D models
- 🏗️ **Intelligent Parsing** - Automatically extracts walls, columns, and structural elements
- 📐 **Auto-Scaling** - Dynamically adjusts camera for models from 10m to 100m+
- 🎨 **Realistic Rendering** - Three.js powered 3D visualization with lighting and shadows
- 🖱️ **Interactive Controls** - Rotate, pan, zoom with mouse interactions
- 📊 **Multi-View Support** - Perspective, top, front, and side views
- ⚡ **High Performance** - Parses 50+ entities in < 1 second
- 🔧 **Extensible** - Modular architecture for easy feature additions

## 🎬 Demo

### Before & After

**2D DXF Drawing** → **Interactive 3D Model**

![Demo](docs/images/demo.gif)

### Supported DXF Elements

- ✅ LINE entities (walls)
- ✅ CIRCLE entities (columns)
- ✅ ARC entities (curved walls)
- ✅ LWPOLYLINE entities (complex shapes)
- ✅ Multiple layers
- ✅ Custom coordinates and scales

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/Bbbeenn/warehouse-3d-visualization.git
cd warehouse-3d-visualization

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Option 1: Start Both Services (Recommended)**

```bash
# From project root
npm run dev
```

**Option 2: Start Separately**

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## 📁 Project Structure

```
warehouse-3d-visualization/
├── backend/                      # Backend services
│   ├── services/
│   │   └── dxfTo3D.js           # Core DXF parsing and 3D generation
│   ├── routes/
│   │   └── model.js             # REST API endpoints
│   ├── uploads/                 # Temporary file storage
│   ├── test-complex-dxf.js      # Testing utilities
│   ├── package.json
│   └── server.js                # Express server entry point
│
├── frontend/                     # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Scene3D.jsx      # Main 3D scene with React Three Fiber
│   │   │   ├── WarehouseModel.jsx # 3D model renderer
│   │   │   └── UploadPanel.jsx  # File upload interface
│   │   ├── App.jsx              # Root component
│   │   └── main.jsx             # Application entry
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── samples/                      # Sample DXF files for testing
│   ├── simple-warehouse.dxf     # 10x8m simple warehouse
│   └── complex-factory-warehouse.dxf  # 40x30m complex factory
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md          # System architecture
│   ├── API.md                   # API documentation
│   └── TESTING.md               # Testing guide
│
├── .gitignore
├── README.md
├── TEST_REPORT.md               # Comprehensive test results
└── USAGE.md                     # User guide
```

## 🏗️ Architecture

### System Flow

```
User Uploads DXF → Backend Parses → Extracts Entities → Generates 3D → Frontend Displays
       ↓                ↓                  ↓                  ↓                  ↓
   UploadPanel    dxfTo3DService    LINE/CIRCLE      Geometry Creation    Scene3D.jsx
```

### Technology Stack

#### Backend
- **Node.js** (v18+) - Runtime environment
- **Express** (v4.18+) - Web server framework
- **dxf-parser** (v1.1.2) - DXF file parsing
- **Three.js** (v0.160+) - 3D geometry generation
- **Multer** (v2.0.2) - File upload handling
- **CORS** (v2.8.5) - Cross-origin requests
- **UUID** (v9.0+) - Unique identifier generation

#### Frontend
- **React** (v18+) - UI framework
- **Vite** (v5+) - Build tool and dev server
- **Three.js** (v0.160+) - 3D rendering engine
- **React Three Fiber** (v8+) - React renderer for Three.js
- **@react-three/drei** (v9+) - Helper components
- **Axios** (v1.6+) - HTTP client
- **Tailwind CSS** (v3+) - Styling

## 📖 Usage Guide

### Basic Usage

1. **Upload DXF File**
   - Click "选择文件" (Select File) or drag & drop
   - Select a DXF file from your computer
   - Click "上传并生成3D模型" (Upload and Generate 3D Model)

2. **View 3D Model**
   - Wait for processing (typically < 2 seconds)
   - Model automatically appears in the 3D viewer
   - Camera positions itself for optimal viewing

3. **Interact with Model**
   - **Rotate**: Left-click and drag
   - **Pan**: Right-click and drag
   - **Zoom**: Mouse scroll wheel
   - **Switch Views**: Use view buttons (Perspective, Top, Front, Side)

4. **Upload New File**
   - Click "上传新图纸" (Upload New Drawing) to reset

### DXF File Requirements

- **Format**: DXF (Drawing Exchange Format)
- **Version**: AutoCAD 2000 or later
- **Units**: Meters (recommended)
- **Coordinate System**: 2D平面 (X, Y coordinates)
- **Supported Entities**:
  - `LINE` - Walls and partitions
  - `CIRCLE` - Columns and pillars
  - `ARC` - Curved walls
  - `LWPOLYLINE` - Complex shapes

### Example DXF Structure

```
SECTION
ENTITIES
  0
  LINE
  8
  WALL-EXTERIOR
  10
  0.0          ; Start X
  20
  0.0          ; Start Y
  11
  10.0         ; End X
  21
  0.0          ; End Y
  0
  CIRCLE
  8
  COLUMN
  10
  5.0          ; Center X
  20
  5.0          ; Center Y
  40
  0.4          ; Radius
ENDSEC
```

## 🔧 API Reference

### POST /api/model/upload

Upload and convert DXF file to 3D model.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` - DXF file

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "scene": {
      "objects": [
        {
          "id": "uuid",
          "type": "wall|column|floor",
          "geometry": { ... },
          "position": { "x": 0, "y": 0, "z": 0 },
          "rotation": { "x": 0, "y": 0, "z": 0 },
          "material": { ... }
        }
      ],
      "metadata": {
        "totalWalls": 26,
        "totalArea": 1200
      }
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-16T00:00:00.000Z"
}
```

## 🧪 Testing

### Run Tests

```bash
# Test DXF parsing
cd backend
node test-complex-dxf.js

# Expected output:
# - Parses 52 entities
# - Generates 53 objects (26 walls + 26 columns + 1 floor)
# - Exports JSON to test-output-complex.json
```

### Test Files

- `samples/simple-warehouse.dxf` - Basic 10×8m warehouse (8 entities)
- `samples/complex-factory-warehouse.dxf` - Large 40×30m factory (52 entities)

### Performance Benchmarks

| Metric | Simple Warehouse | Complex Factory |
|--------|------------------|-----------------|
| DXF File Size | 1 KB | 5 KB |
| Entity Count | 8 | 52 |
| Parse Time | < 0.5s | < 1s |
| 3D Generation | < 0.5s | < 1s |
| JSON Output | 5 KB | 50 KB |
| 3D Objects | 9 | 53 |
| Frame Rate | 60 FPS | 60 FPS |

## 🐛 Troubleshooting

### Common Issues

**Issue: Blank page after upload**
- **Cause**: DXF file uses unsupported entities or coordinates
- **Solution**: Check DXF file contains LINE/CIRCLE entities, verify coordinate system

**Issue: Model too small or too large**
- **Cause**: Auto-scaling not detecting bounds correctly
- **Solution**: Ensure DXF units are in meters, check for extreme coordinates

**Issue: Walls not displaying**
- **Cause**: DXF LINE entities missing endpoint codes (11, 21)
- **Solution**: Use DXF R2000+ format or update parser

**Issue: CORS error**
- **Cause**: Frontend and backend on different ports
- **Solution**: Backend CORS configured for localhost:5173

### Debug Mode

Enable detailed logging:

```javascript
// backend/services/dxfTo3D.js
const parser = new DXFTo3DService({ debug: true });

// frontend/src/App.jsx
// Check browser console for logs
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described
- Ensure all tests pass before submitting

### Code Style

```javascript
// Use ES6+ syntax
const parseDXF = (dxfContent) => { ... }

// Prefer const over let
const wallHeight = 4;

// Use template literals
const message = `Parsed ${entities.length} entities`;

// Add JSDoc comments for functions
/**
 * Parses DXF file and extracts entities
 * @param {string} dxfContent - DXF file content
 * @returns {Array} Parsed entities
 */
```

## 📝 Development Roadmap

### Phase 1: Core Features ✅
- [x] DXF parsing (LINE, CIRCLE, ARC)
- [x] 3D model generation
- [x] Interactive 3D viewer
- [x] Auto-scaling camera
- [x] Multi-view support

### Phase 2: Enhanced Support (In Progress)
- [ ] LWPOLYLINE and POLYLINE entities
- [ ] Text and dimension rendering
- [ ] Multiple floor support
- [ ] Door and window detection
- [ ] Material library

### Phase 3: Advanced Features
- [ ] PDF/JPG image recognition
- [ ] AI-assisted layout analysis
- [ ] VR/AR export
- [ ] Real-time collaboration
- [ ] Cloud rendering

### Phase 4: Production
- [ ] User authentication
- [ ] Project management
- [ ] Version history
- [ ] Export to GLTF/OBJ/FBX
- [ ] Mobile app

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Bbben** - Initial development

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D rendering library
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - React renderer for Three.js
- [dxf-parser](https://github.com/gdsestimating/dxf-parser) - DXF parsing library

## 📞 Support

For questions, issues, or suggestions:

- 📧 Email: your-email@example.com
- 🐛 [Issues](https://github.com/Bbbeenn/warehouse-3d-visualization/issues)
- 💬 [Discussions](https://github.com/Bbbeenn/warehouse-3d-visualization/discussions)

## 🔗 Links

- [Live Demo](https://your-demo-url.com) (Coming soon)
- [Documentation](./docs/)
- [API Reference](./docs/API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Test Report](./TEST_REPORT.md)

---

**Made with ❤️ by Bbben**

*Transforming 2D drawings into 3D experiences*
