import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 仓库模型渲染组件
 * 根据后端返回的场景数据渲染3D对象
 */
export default function WarehouseModel({ sceneData }) {
  const groupRef = useRef();

  // 添加调试日志
  console.log('🏭 WarehouseModel 渲染');
  console.log('📊 场景对象:', sceneData?.objects);

  if (!sceneData || !sceneData.objects) {
    console.warn('⚠️ sceneData 或 objects 为空');
    return null;
  }

  console.log(`✅ 准备渲染 ${sceneData.objects.length} 个对象`);

  return (
    <group ref={groupRef}>
      {sceneData.objects.map((obj) => {
        console.log(`🔷 渲染对象: ${obj.type}`, obj);
        switch (obj.type) {
          case 'wall':
            return <Wall key={obj.id} data={obj} />;
          case 'floor':
            return <Floor key={obj.id} data={obj} />;
          case 'column':
            return <Column key={obj.id} data={obj} />;
          default:
            console.warn(`❓ 未知对象类型: ${obj.type}`);
            return null;
        }
      })}
    </group>
  );
}

/**
 * 墙体组件
 */
function Wall({ data }) {
  const { width, height, depth } = data.geometry;

  return (
    <mesh
      position={[data.position.x, data.position.y + height / 2, data.position.z]}
      rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={data.material.color}
        roughness={data.material.roughness}
        metalness={data.material.metalness}
      />
    </mesh>
  );
}

/**
 * 地板组件
 */
function Floor({ data }) {
  const { width, depth, height } = data.geometry;

  return (
    <mesh
      position={[data.position.x, data.position.y, data.position.z]}
      rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
      receiveShadow
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={data.material.color}
        roughness={data.material.roughness}
        metalness={data.material.metalness}
      />
    </mesh>
  );
}

/**
 * 柱子组件
 */
function Column({ data }) {
  const { radiusTop, radiusBottom, height } = data.geometry;

  return (
    <mesh
      position={[data.position.x, data.position.y, data.position.z]}
      rotation={[data.rotation.x, data.rotation.y, data.rotation.z]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[radiusTop, radiusBottom, height, 32]} />
      <meshStandardMaterial
        color={data.material.color}
        roughness={data.material.roughness}
        metalness={data.material.metalness}
      />
    </mesh>
  );
}
