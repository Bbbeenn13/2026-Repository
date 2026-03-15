import { useState, lazy, Suspense } from 'react';
import UploadPanel from './components/UploadPanel';
import axios from 'axios';

const Scene3D = lazy(() => import('./components/Scene3D'));

/**
 * 主应用组件
 */
function App() {
  const [sceneData, setSceneData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/model/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30秒超时
      });

      if (response.data.success) {
        setSceneData(response.data.data.scene);
        console.log('✅ 3D模型生成成功:', response.data.data);
        console.log('📊 场景数据:', response.data.data.scene);
        console.log('🔍 对象数量:', response.data.data.scene?.objects?.length);
      } else {
        throw new Error(response.data.error || '生成失败');
      }
    } catch (err) {
      console.error('❌ 上传失败:', err);
      setError(err.response?.data?.error || err.message || '上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleNewUpload = () => {
    setSceneData(null);
    setError(null);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* 头部 */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🏭</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  仓库3D可视化系统
                </h1>
                <p className="text-sm text-gray-600">
                  Warehouse 3D Visualization System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                ● 服务正常
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="pt-20 h-full">
        {!sceneData ? (
          /* 上传界面 */
          <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-6">
            <div className="max-w-2xl w-full">
              {/* 欢迎信息 */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">
                  将2D图纸转换为3D模型
                </h2>
                <p className="text-lg text-gray-600">
                  上传仓库布局图（DXF格式），自动生成3D可视化效果
                </p>
              </div>

              {/* 上传面板 */}
              <UploadPanel
                onUploadSuccess={handleUpload}
                loading={loading}
              />

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <strong>❌ 错误：</strong> {error}
                </div>
              )}

              {/* 功能说明 */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="text-3xl mb-3">📐</div>
                  <h3 className="font-bold mb-2">1. 上传图纸</h3>
                  <p className="text-sm text-gray-600">
                    支持DXF格式的CAD文件，包含墙体线条和柱子信息
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="text-3xl mb-3">🔧</div>
                  <h3 className="font-bold mb-2">2. 自动解析</h3>
                  <p className="text-sm text-gray-600">
                    后端自动解析图纸数据，提取墙体、门窗等信息
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="text-3xl mb-3">🏗️</div>
                  <h3 className="font-bold mb-2">3. 3D展示</h3>
                  <p className="text-sm text-gray-600">
                    实时生成3D模型，支持交互式查看和操作
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 3D查看界面 */
          <div className="relative w-full h-[calc(100vh-5rem)]">
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
              <Scene3D sceneData={sceneData} />
            </Suspense>

            {/* 重新上传按钮 */}
            <button
              onClick={handleNewUpload}
              className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow hover:bg-white transition-colors"
            >
              📤 上传新图纸
            </button>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-2 px-6 text-center text-sm text-gray-600">
        仓库3D可视化系统 Demo | 基于 Three.js + React 构建
      </footer>
    </div>
  );
}

export default App;
