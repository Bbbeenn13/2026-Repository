import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Stats } from '@react-three/drei';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import WarehouseModel from './WarehouseModel';

/**
 * 相机控制器组件 - 根据选择的视角调整相机
 */
function CameraController({ selectedView, sceneBounds }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const positions = {
      perspective: sceneBounds
        ? [sceneBounds.centerX + sceneBounds.size, sceneBounds.centerY + sceneBounds.size * 0.8, sceneBounds.centerZ + sceneBounds.size]
        : [15, 12, 15],
      top: sceneBounds
        ? [sceneBounds.centerX, 50, sceneBounds.centerZ]
        : [0, 20, 0],
      front: sceneBounds
        ? [sceneBounds.centerX, sceneBounds.centerY, sceneBounds.centerZ + sceneBounds.size * 1.5]
        : [0, 5, 20],
      side: sceneBounds
        ? [sceneBounds.centerX + sceneBounds.size * 1.5, sceneBounds.centerY, sceneBounds.centerZ]
        : [20, 5, 0]
    };

    const targets = {
      perspective: sceneBounds ? [sceneBounds.centerX, 0, sceneBounds.centerZ] : [0, 0, 0],
      top: sceneBounds ? [sceneBounds.centerX, 0, sceneBounds.centerZ] : [0, 0, 0],
      front: sceneBounds ? [sceneBounds.centerX, 0, sceneBounds.centerZ] : [0, 0, 0],
      side: sceneBounds ? [sceneBounds.centerX, 0, sceneBounds.centerZ] : [0, 0, 0]
    };

    const newPos = positions[selectedView] || positions.perspective;
    const newTarget = targets[selectedView] || targets.perspective;

    // 设置相机位置
    camera.position.set(...newPos);
    camera.lookAt(...newTarget);

    // 设置OrbitControls
    setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.target.set(...newTarget);
        controlsRef.current.update();
        setInitialized(true);
      }
    }, 0);
  }, [selectedView, camera, sceneBounds]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={sceneBounds ? sceneBounds.size * 0.5 : 5}
      maxDistance={sceneBounds ? sceneBounds.size * 5 : 50}
    />
  );
}

/**
 * 计算场景边界框
 */
function calculateSceneBounds(sceneData) {
  if (!sceneData || !sceneData.objects || sceneData.objects.length === 0) {
    return null;
  }

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  sceneData.objects.forEach(obj => {
    const pos = obj.position;
    const geo = obj.geometry;

    let size = 0;
    if (geo.type === 'box') {
      size = Math.max(geo.width, geo.height, geo.depth);
    } else if (geo.type === 'cylinder') {
      size = Math.max(geo.radiusTop, geo.radiusBottom, geo.height);
    }

    minX = Math.min(minX, pos.x - size / 2);
    maxX = Math.max(maxX, pos.x + size / 2);
    minY = Math.min(minY, pos.y - size / 2);
    maxY = Math.max(maxY, pos.y + size / 2);
    minZ = Math.min(minZ, pos.z - size / 2);
    maxZ = Math.max(maxZ, pos.z + size / 2);
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);

  console.log('📏 场景边界:', { centerX, centerY, centerZ, size });
  console.log('📏 边界框:', { minX, maxX, minY, maxY, minZ, maxZ });

  return { centerX, centerY, centerZ, size };
}

/**
 * 3D场景容器组件
 * 包含相机、灯光、环境等基础设置
 */
export default function Scene3D({ sceneData, selectedView = 'perspective' }) {
  // 添加调试日志
  console.log('🎨 Scene3D 渲染，sceneData:', sceneData);
  console.log('📦 对象数量:', sceneData?.objects?.length);

  if (!sceneData) {
    console.warn('⚠️ sceneData 为空！');
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-gray-600">没有场景数据</p>
      </div>
    );
  }

  // 计算场景边界
  const sceneBounds = calculateSceneBounds(sceneData);

  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{
          position: [15, 12, 15],
          fov: 50,
          near: 0.1,
          far: 10000  // 增加远裁剪面
        }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* 环境设置 */}
        <color attach="background" args={['#f0f0f0']} />

        {/* 灯光 */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} />
        <hemisphereLight args={['#ffffff', '#444444', 0.4]} />

        {/* 相机控制器（包含OrbitControls） */}
        <CameraController selectedView={selectedView} sceneBounds={sceneBounds} />

        {/* 辅助网格 */}
        <Grid
          args={[100, 100]}
          cellSize={1}
          cellThickness={0.5}
          cellColor='#cccccc'
          sectionSize={10}
          sectionThickness={1}
          sectionColor='#999999'
          fadeDistance={100}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* 3D模型 */}
        <Suspense fallback={null}>
          {sceneData && <WarehouseModel sceneData={sceneData} />}
        </Suspense>

        {/* 环境贴图 */}
        <Environment preset="city" />
      </Canvas>

      {/* 操作提示 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-sm z-10 pointer-events-none">
        <h3 className="font-bold mb-2">操作说明</h3>
        <ul className="space-y-1 text-gray-600">
          <li>🖱️ 左键拖动：旋转视角</li>
          <li>🖱️ 右键拖动：平移</li>
          <li>🖱️ 滚轮：缩放</li>
        </ul>
        {sceneBounds && (
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p className="text-xs text-gray-500">
              模型尺寸: {sceneBounds.size.toFixed(1)}米
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
