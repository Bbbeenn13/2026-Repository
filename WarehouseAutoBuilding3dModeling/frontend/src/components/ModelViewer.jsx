import { useState, Suspense } from 'react';
import Scene3D from './Scene3D';

/**
 * 3D模型查看器容器
 * 包含场景和UI控制面板
 */
export default function ModelViewer({ sceneData, onNewUpload }) {
  const [showInfo, setShowInfo] = useState(true);
  const [selectedView, setSelectedView] = useState('perspective');

  if (!sceneData) {
    return null;
  }

  const metadata = sceneData.metadata || {};

  return (
    <div className="relative w-full h-full">
      {/* 顶部工具栏 */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow hover:bg-white transition-colors"
        >
          {showInfo ? '📊 隐藏信息' : '📊 显示信息'}
        </button>
        <button
          onClick={onNewUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          📤 上传新图纸
        </button>
      </div>

      {/* 信息面板 */}
      {showInfo && (
        <div className="absolute top-20 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-4 max-w-xs">
          <h3 className="font-bold text-lg mb-3">📊 模型信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">墙体数量:</span>
              <span className="font-bold">{metadata.totalWalls || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">对象总数:</span>
              <span className="font-bold">{sceneData.objects?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">生成时间:</span>
              <span className="text-xs">
                {new Date(sceneData.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* 视图切换 */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-bold mb-2">🎯 快速视角</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedView('perspective')}
                className={`text-xs px-3 py-2 rounded ${
                  selectedView === 'perspective'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                透视视角
              </button>
              <button
                onClick={() => setSelectedView('top')}
                className={`text-xs px-3 py-2 rounded ${
                  selectedView === 'top'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                顶视图
              </button>
              <button
                onClick={() => setSelectedView('front')}
                className={`text-xs px-3 py-2 rounded ${
                  selectedView === 'front'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                前视图
              </button>
              <button
                onClick={() => setSelectedView('side')}
                className={`text-xs px-3 py-2 rounded ${
                  selectedView === 'side'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                侧视图
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D场景由Scene3D组件渲染 */}
      <div className="w-full h-full">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin text-6xl mb-4">⚙️</div>
                <p className="text-gray-600">加载3D场景中...</p>
              </div>
            </div>
          }
        >
          <Scene3D sceneData={sceneData} selectedView={selectedView} />
        </Suspense>
      </div>
    </div>
  );
}
