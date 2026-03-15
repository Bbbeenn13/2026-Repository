# 📡 API Documentation

## Base URL

```
Development: http://localhost:3001
Production: https://your-api-domain.com
```

## Content Type

All API requests and responses use `application/json` unless specified otherwise.

---

## 🔌 Endpoints

### Health Check

#### GET /api/health

Check if the API server is running.

**Request**:
```http
GET /api/health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2026-03-16T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

### Upload and Convert DXF

#### POST /api/model/upload

Upload a DXF file and convert it to 3D scene data.

**Request**:
```http
POST /api/model/upload
Content-Type: multipart/form-data
```

**Form Data**:
- `file` (required): DXF file
  - Type: File
  - Max Size: 10MB
  - Allowed Types: `.dxf`, text/plain

**Example using cURL**:
```bash
curl -X POST \
  -F "file=@samples/complex-factory-warehouse.dxf" \
  http://localhost:3001/api/model/upload
```

**Example using JavaScript**:
```javascript
const formData = new FormData();
formData.append('file', dxfFile);

const response = await fetch('http://localhost:3001/api/model/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "scene": {
      "objects": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "type": "wall",
          "geometry": {
            "type": "box",
            "width": 10.0,
            "depth": 0.24,
            "height": 4.0
          },
          "position": {
            "x": 5.0,
            "y": 0.0,
            "z": 0.0
          },
          "rotation": {
            "x": 0.0,
            "y": 0.0,
            "z": 0.0
          },
          "material": {
            "color": 13421772,
            "roughness": 0.8,
            "metalness": 0.1
          }
        }
      ],
      "metadata": {
        "totalWalls": 26,
        "totalArea": 1200.0,
        "sceneBounds": {
          "minX": 0.0,
          "maxX": 40.0,
          "minY": 0.0,
          "maxY": 4.0,
          "minZ": 0.0,
          "maxZ": 30.0
        }
      }
    }
  }
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

**Response** (413 Payload Too Large):
```json
{
  "success": false,
  "error": "File size exceeds 10MB limit"
}
```

**Response** (415 Unsupported Media Type):
```json
{
  "success": false,
  "error": "Invalid file type. Only DXF files are supported"
}
```

**Response** (500 Internal Server Error):
```json
{
  "success": false,
  "error": "Failed to parse DXF file: Invalid DXF format"
}
```

---

### Parse DXF Only (Planned)

#### POST /api/model/parse

Parse a DXF file without generating 3D geometry.

**Request**:
```http
POST /api/model/parse
Content-Type: multipart/form-data
```

**Form Data**:
- `file` (required): DXF file

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "entities": [
      {
        "type": "line",
        "points": [
          {"x": 0.0, "y": 0.0},
          {"x": 10.0, "y": 0.0}
        ],
        "layer": "WALL-EXTERIOR"
      }
    ],
    "metadata": {
      "totalEntities": 52,
      "layers": ["WALL-EXTERIOR", "WALL-INTERIOR", "COLUMN"]
    }
  }
}
```

---

### Export 3D Model (Planned)

#### POST /api/model/export

Export 3D model in various formats.

**Request**:
```http
POST /api/model/export
Content-Type: application/json
```

**Body**:
```json
{
  "sceneData": {...},
  "format": "gltf|obj|fbx"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://cdn.example.com/models/abc123.gltf",
    "expiresIn": 3600
  }
}
```

---

### List Projects (Planned)

#### GET /api/projects

Get list of all projects for authenticated user.

**Request**:
```http
GET /api/projects?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Sort by `createdAt|updatedAt|name`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Warehouse A",
        "description": "Main warehouse layout",
        "createdAt": "2026-03-16T00:00:00.000Z",
        "updatedAt": "2026-03-16T01:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

### Get Project (Planned)

#### GET /api/projects/:id

Get details of a specific project.

**Request**:
```http
GET /api/projects/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Warehouse A",
      "description": "Main warehouse layout",
      "dxfFile": "https://cdn.example.com/dxf/warehouse-a.dxf",
      "sceneData": {...},
      "createdAt": "2026-03-16T00:00:00.000Z",
      "updatedAt": "2026-03-16T01:00:00.000Z"
    }
  }
}
```

---

## 📊 Data Models

### Scene Object

```typescript
interface SceneObject {
  id: string;                    // UUID v4
  type: 'wall' | 'column' | 'floor';
  geometry: Geometry;
  position: Position;
  rotation: Rotation;
  material: Material;
}

interface Geometry {
  type: 'box' | 'cylinder';
  width?: number;                // For box
  depth?: number;                // For box
  height?: number;               // For box and cylinder
  radiusTop?: number;            // For cylinder
  radiusBottom?: number;         // For cylinder
}

interface Position {
  x: number;                     // X coordinate in meters
  y: number;                     // Y coordinate (height) in meters
  z: number;                     // Z coordinate in meters
}

interface Rotation {
  x: number;                     // Rotation around X axis (radians)
  y: number;                     // Rotation around Y axis (radians)
  z: number;                     // Rotation around Z axis (radians)
}

interface Material {
  color: number;                 // Hex color value (e.g., 0xcccccc)
  roughness: number;             // 0.0 - 1.0
  metalness: number;             // 0.0 - 1.0
}
```

### Scene Metadata

```typescript
interface SceneMetadata {
  totalWalls: number;
  totalArea: number;             // Square meters
  sceneBounds: SceneBounds;
}

interface SceneBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}
```

### DXF Entity

```typescript
interface DXFEntity {
  type: 'line' | 'circle' | 'arc' | 'lwpolyline';
  points?: Point[];
  center?: Point;
  radius?: number;
  layer: string;
}

interface Point {
  x: number;
  y: number;
}
```

---

## ⚠️ Error Codes

| Status Code | Error Type | Description |
|------------|-----------|-------------|
| 400 | `BAD_REQUEST` | Invalid request parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 413 | `PAYLOAD_TOO_LARGE` | File exceeds size limit |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Invalid file type |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

---

## 🔒 Authentication (Planned)

### JWT Token Authentication

**Request**:
```http
GET /api/projects
Authorization: Bearer YOUR_JWT_TOKEN
```

**Token Structure**:
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "iat": 1678900000,
    "exp": 1678986400
  }
}
```

---

## 📈 Rate Limiting (Planned)

**Limits**:
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678900000
```

**Exceeded Response** (429):
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Upload DXF
curl -X POST \
  -F "file=@samples/complex-factory-warehouse.dxf" \
  http://localhost:3001/api/model/upload
```

### Using Postman

1. Import the API collection (TODO: provide collection)
2. Set base URL to `http://localhost:3001`
3. Test endpoints

### Using JavaScript

```javascript
// Test health endpoint
fetch('http://localhost:3001/api/health')
  .then(res => res.json())
  .then(data => console.log(data));

// Upload file
const formData = new FormData();
formData.append('file', dxfFile);

fetch('http://localhost:3001/api/model/upload', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📝 Changelog

### Version 1.0.0 (2026-03-16)

- ✅ Initial API release
- ✅ POST /api/model/upload
- ✅ GET /api/health
- ✅ Support for LINE and CIRCLE entities
- ✅ Auto-scaling 3D generation

---

**Last Updated**: 2026-03-16

**API Version**: 1.0.0
