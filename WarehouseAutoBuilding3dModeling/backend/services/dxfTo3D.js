import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

/**
 * DXF解析和3D转换服务
 * 从2D DXF文件提取墙体数据并生成3D模型
 */

class DXFTo3DService {
  constructor(options = {}) {
    this.wallHeight = options.wallHeight || 4; // 墙高（米）
    this.wallThickness = options.wallThickness || 0.24; // 墙厚（米）
    this.floorThickness = options.floorThickness || 0.15; // 地板厚度
  }

  /**
   * 解析DXF文件并提取墙体数据
   */
  parseDXF(dxfContent) {
    const lines = dxfContent.split('\n');
    const entities = [];
    let currentEntity = null;
    let inEntitiesSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测实体段
      if (line === 'ENTITIES') {
        inEntitiesSection = true;
        continue;
      }

      if (line === 'ENDSEC' || line === 'EOF') {
        if (currentEntity) {
          entities.push(currentEntity);
          currentEntity = null;
        }
        inEntitiesSection = false;
        continue;
      }

      if (!inEntitiesSection) continue;

      // 解析实体类型
      if (line === 'LINE' || line === 'LWPOLYLINE' || line === 'POLYLINE') {
        if (currentEntity) {
          entities.push(currentEntity);
        }
        currentEntity = {
          type: line.toLowerCase(),
          points: [],
          layer: '0'
        };
      } else if (line === 'CIRCLE' || line === 'ARC') {
        if (currentEntity) {
          entities.push(currentEntity);
        }
        currentEntity = {
          type: line.toLowerCase(),
          center: { x: 0, y: 0 },
          radius: 0,
          layer: '0'
        };
      }

      // 解析实体数据
      if (currentEntity) {
        this.parseEntityData(lines, i, currentEntity);
      }
    }

    return entities;
  }

  /**
   * 解析实体坐标和数据
   */
  parseEntityData(lines, index, entity) {
    const code = lines[index]?.trim();
    const value = lines[index + 1]?.trim();

    if (!code || !value) return;

    const codeNum = parseInt(code);

    // X坐标 - 起点
    if (codeNum === 10) {
      if (entity.type === 'line' || entity.type === 'lwpolyline') {
        if (!entity.points.length) entity.points.push({});
        entity.points[entity.points.length - 1].x = parseFloat(value);
      } else if (entity.type === 'circle' || entity.type === 'arc') {
        entity.center.x = parseFloat(value);
      }
    }

    // Y坐标 - 起点
    if (codeNum === 20) {
      if (entity.type === 'line' || entity.type === 'lwpolyline') {
        if (!entity.points.length) entity.points.push({});
        entity.points[entity.points.length - 1].y = parseFloat(value);
      } else if (entity.type === 'circle' || entity.type === 'arc') {
        entity.center.y = parseFloat(value);
      }
    }

    // X坐标 - 终点（仅LINE实体）
    if (codeNum === 11) {
      if (entity.type === 'line') {
        // LINE实体有起点(10,20)和终点(11,21)
        // 确保有第二个点
        if (entity.points.length < 2) {
          entity.points.push({});
        }
        entity.points[1].x = parseFloat(value);
      }
    }

    // Y坐标 - 终点（仅LINE实体）
    if (codeNum === 21) {
      if (entity.type === 'line') {
        // 确保终点已创建
        if (entity.points.length < 2) {
          entity.points.push({});
        }
        entity.points[1].y = parseFloat(value);
      }
    }

    // 半径
    if (codeNum === 40) {
      entity.radius = parseFloat(value);
    }

    // 图层
    if (codeNum === 8) {
      entity.layer = value;
    }
  }

  /**
   * 从实体生成3D几何体
   */
  generate3DGeometry(entities) {
    const scene = {
      objects: [],
      metadata: {
        totalWalls: 0,
        totalArea: 0
      }
    };

    console.log(`\n🏗️  开始生成3D模型，实体数量: ${entities.length}`);

    entities.forEach((entity, index) => {
      console.log(`  📦 实体 ${index + 1}: type=${entity.type}, points=${entity.points?.length || 0}`);

      if (entity.type === 'line' || entity.type === 'lwpolyline') {
        const walls = this.createWallFromLine(entity);
        console.log(`    ✨ 生成 ${walls.length} 面墙`);
        scene.objects.push(...walls);
        scene.metadata.totalWalls++;
      } else if (entity.type === 'circle' || entity.type === 'arc') {
        const column = this.createColumnFromCircle(entity);
        if (column) {
          console.log(`    ✨ 生成柱子`);
          scene.objects.push(column);
        }
      } else {
        console.log(`    ⚠️  未知实体类型: ${entity.type}`);
      }
    });

    // 添加地板
    const floor = this.createFloor(entities);
    scene.objects.push(floor);
    console.log(`  ✨ 生成地板`);

    console.log(`\n✅ 3D模型生成完成:`);
    console.log(`   - 墙体: ${scene.metadata.totalWalls} 面`);
    console.log(`   - 对象总数: ${scene.objects.length}`);
    console.log(`   - 对象类型分布:`);

    const typeCount = {};
    scene.objects.forEach(obj => {
      typeCount[obj.type] = (typeCount[obj.type] || 0) + 1;
    });
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`     • ${type}: ${count}`);
    });

    return scene;
  }

  /**
   * 从线段创建墙体
   */
  createWallFromLine(entity) {
    const walls = [];

    for (let i = 0; i < entity.points.length - 1; i++) {
      const start = entity.points[i];
      const end = entity.points[i + 1];

      if (!start || !end || start.x === undefined || end.x === undefined) continue;

      // 计算墙体长度和方向
      const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );

      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const angle = Math.atan2(end.y - start.y, end.x - start.x);

      walls.push({
        id: uuidv4(),
        type: 'wall',
        geometry: {
          type: 'box',
          width: length,
          depth: this.wallThickness,
          height: this.wallHeight
        },
        position: {
          x: centerX,
          y: 0, // 地面高度
          z: centerY
        },
        rotation: {
          x: 0,
          y: angle,
          z: 0
        },
        material: {
          color: 0xcccccc,
          roughness: 0.8,
          metalness: 0.1
        }
      });
    }

    return walls;
  }

  /**
   * 从圆创建柱子
   */
  createColumnFromCircle(entity) {
    if (!entity.radius || !entity.center) return null;

    return {
      id: uuidv4(),
      type: 'column',
      geometry: {
        type: 'cylinder',
        radiusTop: entity.radius,
        radiusBottom: entity.radius,
        height: this.wallHeight
      },
      position: {
        x: entity.center.x,
        y: this.wallHeight / 2,
        z: entity.center.y
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      material: {
        color: 0x999999,
        roughness: 0.7,
        metalness: 0.2
      }
    };
  }

  /**
   * 创建地板
   */
  createFloor(entities) {
    // 计算所有点的边界
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    entities.forEach(entity => {
      if (entity.points) {
        entity.points.forEach(point => {
          if (point.x !== undefined) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
          }
          if (point.y !== undefined) {
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
          }
        });
      }
    });

    const width = maxX - minX;
    const depth = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return {
      id: uuidv4(),
      type: 'floor',
      geometry: {
        type: 'box',
        width: width || 10,
        depth: depth || 10,
        height: this.floorThickness
      },
      position: {
        x: centerX || 0,
        y: -this.floorThickness / 2,
        z: centerY || 0
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0
      },
      material: {
        color: 0xf0f0f0,
        roughness: 0.9,
        metalness: 0.0
      }
    };
  }

  /**
   * 将3D场景导出为JSON格式
   */
  exportToJSON(scene) {
    return JSON.stringify(scene, null, 2);
  }

  /**
   * 使用Three.js创建GLTF模型（可选的高级功能）
   */
  async exportToGLTF(scene) {
    const scene3D = new THREE.Scene();

    scene.objects.forEach(obj => {
      let geometry;

      switch (obj.geometry.type) {
        case 'box':
          geometry = new THREE.BoxGeometry(
            obj.geometry.width,
            obj.geometry.height,
            obj.geometry.depth
          );
          break;
        case 'cylinder':
          geometry = new THREE.CylinderGeometry(
            obj.geometry.radiusTop,
            obj.geometry.radiusBottom,
            obj.geometry.height,
            32
          );
          break;
      }

      const material = new THREE.MeshStandardMaterial({
        color: obj.material.color,
        roughness: obj.material.roughness,
        metalness: obj.material.metalness
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(obj.position.x, obj.position.y, obj.position.z);
      mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z);

      scene3D.add(mesh);
    });

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene3D.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene3D.add(directionalLight);

    return scene3D;
  }
}

export default DXFTo3DService;
