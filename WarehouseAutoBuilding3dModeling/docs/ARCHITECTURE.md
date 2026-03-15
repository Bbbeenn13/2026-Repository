# 🏗️ System Architecture

## Overview

The Warehouse 3D Visualization System follows a **client-server architecture** with clear separation of concerns between the backend (DXF parsing and 3D generation) and frontend (3D rendering and user interaction).

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Frontend       │◄───────►│  Backend        │◄───────►│  DXF Files      │
│  (React +       │  API    │  (Node.js +     │  Parse  │                 │
│   Three.js)     │         │   dxf-parser)   │         │                 │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
      │                           │
      │                           │
      ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   Browser       │         │   Three.js      │
│   WebGL         │         │   Geometry      │
│   Rendering     │         │   Generation    │
└─────────────────┘         └─────────────────┘
```

---

## 📦 Technology Stack

### Backend Architecture

```
backend/
├── server.js                    # Express server entry point
│   ├── CORS middleware          # Cross-origin handling
│   ├── File upload middleware   # Multer configuration
│   └── API routes              # REST endpoints
│
├── routes/
│   └── model.js                # /api/model routes
│       ├── POST /upload        # Upload and parse DXF
│       └── GET /health         # Health check
│
└── services/
    └── dxfTo3D.js              # Core DXF processing
        ├── parseDXF()          # Extract DXF entities
        ├── generate3DGeometry() # Create 3D objects
        ├── createWallFromLine() # Generate wall geometry
        ├── createColumnFromCircle() # Generate column
        └── createFloor()       # Generate floor geometry
```

**Technology Details**:
- **Runtime**: Node.js 18+ (ES Modules)
- **Framework**: Express 4.18+
- **Parser**: dxf-parser 1.1.2
- **3D Library**: Three.js 0.160+
- **File Upload**: Multer 2.0.2
- **UUID**: v9.0+ for unique identifiers

### Frontend Architecture

```
frontend/src/
├── main.jsx                    # Application entry point
├── App.jsx                     # Root component
│   ├── UploadPanel            # File upload interface
│   └── ModelViewer            # 3D model viewer
│
└── components/
    ├── Scene3D.jsx            # Main 3D scene
    │   ├── Canvas            # React Three Fiber canvas
    │   ├── CameraController  # Camera positioning
    │   └── Lighting         # Scene lighting
    │
    ├── WarehouseModel.jsx     # Model renderer
    │   ├── Wall components   # Render walls
    │   ├── Column components # Render columns
    │   └── Floor component   # Render floor
    │
    └── UploadPanel.jsx        # Upload UI
        ├── File input        # Drag & drop zone
        ├── Upload button     # Submit handler
        └── Error display    # Error messages
```

**Technology Details**:
- **Framework**: React 18+
- **Build Tool**: Vite 5+
- **3D Rendering**: Three.js 0.160+
- **React Renderer**: React Three Fiber 8+
- **Helpers**: @react-three/drei 9+
- **HTTP Client**: Axios 1.6+
- **Styling**: Tailwind CSS 3+

---

## 🔄 Data Flow

### 1. DXF Upload Flow

```
User uploads DXF
       ↓
UploadPanel.jsx (Frontend)
       ↓
FormData + Axios POST
       ↓
POST /api/model/upload
       ↓
Multer middleware saves file
       ↓
dxfTo3DService.parseDXF()
       ↓
Extract entities (LINE, CIRCLE, etc.)
       ↓
dxfTo3DService.generate3DGeometry()
       ↓
Create 3D objects (walls, columns, floor)
       ↓
Return JSON scene data
       ↓
Scene3D.jsx receives data
       ↓
WarehouseModel renders 3D scene
       ↓
User views interactive 3D model
```

### 2. Data Processing Pipeline

**Stage 1: DXF Parsing**
```javascript
DXF File → parseDXF() → Entities Array
  ↓
  {
    type: 'line',
    points: [{x:0, y:0}, {x:10, y:0}],
    layer: 'WALL-EXTERIOR'
  }
```

**Stage 2: 3D Generation**
```javascript
Entities → generate3DGeometry() → Scene Objects
  ↓
  {
    id: 'uuid',
    type: 'wall',
    geometry: {
      type: 'box',
      width: 10,
      depth: 0.24,
      height: 4
    },
    position: {x: 5, y: 0, z: 0},
    rotation: {x: 0, y: 0, z: 0},
    material: {
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.1
    }
  }
```

**Stage 3: Rendering**
```javascript
Scene Objects → React Three Fiber → WebGL
  ↓
  - BoxGeometry for walls
  - CylinderGeometry for columns
  - MeshStandardMaterial for shading
  - OrbitControls for interaction
```

---

## 🎨 Component Architecture

### Backend Service: DXFTo3DService

```javascript
class DXFTo3DService {
  constructor(options = {}) {
    this.wallHeight = options.wallHeight || 4;
    this.wallThickness = options.wallThickness || 0.24;
    this.floorThickness = options.floorThickness || 0.15;
  }

  // Core methods
  parseDXF(dxfContent)          // Extract DXF entities
  parseEntityData()             // Parse entity coordinates
  generate3DGeometry(entities)  // Generate 3D scene
  createWallFromLine()          // Create wall geometry
  createColumnFromCircle()      // Create column geometry
  createFloor()                 // Create floor geometry
  exportToJSON()                // Export scene to JSON
}
```

### Frontend Components

**Scene3D Component**:
```javascript
function Scene3D({ sceneData, selectedView }) {
  // Scene setup
  - Canvas with Three.js renderer
  - Camera with auto-positioning
  - Lighting (ambient, directional, hemisphere)
  - OrbitControls for interaction
  - Environment mapping

  // Render
  return (
    <Canvas camera={{...}}>
      <CameraController />
      <Grid />
      <WarehouseModel sceneData={sceneData} />
      <Environment />
    </Canvas>
  );
}
```

**WarehouseModel Component**:
```javascript
function WarehouseModel({ sceneData }) {
  // Process scene objects
  return sceneData.objects.map(obj => {
    switch(obj.type) {
      case 'wall':
        return <Wall key={obj.id} data={obj} />;
      case 'column':
        return <Column key={obj.id} data={obj} />;
      case 'floor':
        return <Floor key={obj.id} data={obj} />;
    }
  });
}
```

---

## 🗂️ Database Schema (Future)

```
projects/
├── id: UUID
├── name: String
├── description: Text
├── dxf_file: String (S3 URL)
├── scene_data: JSON
├── created_at: Timestamp
├── updated_at: Timestamp
└── user_id: UUID (foreign key)

users/
├── id: UUID
├── email: String
├── username: String
├── created_at: Timestamp
└── projects: Array (relationship)
```

---

## 🔐 Security Architecture

### Input Validation
```javascript
// Backend validation
const allowedMimeTypes = ['application/dxf', 'text/plain'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

// File upload validation
if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

if (file.size > maxFileSize) {
  throw new Error('File too large');
}
```

### CORS Configuration
```javascript
// Frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://your-production-domain.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

---

## 📊 Performance Optimization

### Backend Optimizations

1. **Streaming Processing**:
   - Parse DXF line by line
   - Generate geometry on-the-fly

2. **Caching** (Planned):
   - Cache parsed entities
   - Cache generated 3D scenes

3. **Async Operations**:
   - Use Promises for I/O
   - Non-blocking file operations

### Frontend Optimizations

1. **Lazy Loading**:
   ```javascript
   const ModelViewer = lazy(() => import('./components/ModelViewer'));
   ```

2. **Memoization**:
   ```javascript
   const sceneBounds = useMemo(() => calculateSceneBounds(sceneData), [sceneData]);
   ```

3. **Geometry Instancing** (Planned):
   - Reuse geometries for similar objects
   - Reduce draw calls

---

## 🔧 Extension Points

### Adding New DXF Entities

```javascript
// 1. Add parser support
parseEntityData(lines, index, entity) {
  if (codeNum === 70) {
    entity.closed = value === 1; // LWPOLYLINE
  }
}

// 2. Add 3D generator
createPolylineFromLW(entity) {
  // Generate geometry from polyline
}

// 3. Update generate3DGeometry()
generate3DGeometry(entities) {
  // ...
  else if (entity.type === 'lwpolyline') {
    const walls = this.createPolylineFromLW(entity);
    scene.objects.push(...walls);
  }
}
```

### Adding New Export Formats

```javascript
// Add export method to DXFTo3DService
async exportToGLTF(scene) {
  const gltfExporter = new GLTFExporter();
  return gltfExporter.parse(scene3D);
}

async exportToOBJ(scene) {
  const objExporter = new OBJExporter();
  return objExporter.parse(scene3D);
}
```

---

## 📈 Scalability Considerations

### Current Limitations

- **File Size**: Max 10MB DXF files
- **Entity Count**: Tested up to 200 entities
- **Concurrent Users**: Not yet tested
- **Scene Size**: Tested up to 100m × 100m

### Future Scalability

1. **Horizontal Scaling**:
   - Load balancer + multiple backend instances
   - Redis session storage

2. **Database**:
   - PostgreSQL for project storage
   - S3 for file storage

3. **CDN**:
   - CloudFlare for static assets
   - CDN for generated 3D models

4. **Web Workers**:
   - Offload parsing to background threads
   - Improve UI responsiveness

---

## 🔍 Monitoring & Logging

### Backend Logging

```javascript
// Structured logging
console.log({
  level: 'info',
  message: 'DXF parsed successfully',
  entities: entities.length,
  duration: parsingTime
});
```

### Frontend Logging

```javascript
// Browser console
console.log('🏗️ Starting 3D model generation');
console.log(`📦 Entities: ${sceneData.objects.length}`);
console.log('📏 Scene bounds:', sceneBounds);
```

---

## 🎯 Future Architecture Enhancements

1. **Microservices**:
   - Separate DXF parsing service
   - 3D generation service
   - Export service

2. **Message Queue**:
   - RabbitMQ for job queue
   - Process large files asynchronously

3. **WebSocket**:
   - Real-time parsing progress
   - Live collaboration

4. **GraphQL**:
   - Replace REST API
   - More flexible data fetching

---

**Last Updated**: 2026-03-16

**Maintainer**: Bbben
