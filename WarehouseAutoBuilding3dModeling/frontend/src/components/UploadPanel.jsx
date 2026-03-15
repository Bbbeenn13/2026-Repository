import { useState } from 'react';

/**
 * 文件上传面板组件
 */
export default function UploadPanel({ onUploadSuccess, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // 检查文件类型
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'dxf') {
      alert('请上传.dxf格式的CAD文件');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('请先选择文件');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await onUploadSuccess(formData);
      setSelectedFile(null);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败: ' + error.message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📐 上传仓库图纸
      </h2>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".dxf"
          onChange={handleChange}
          disabled={loading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-6xl mb-4">📄</div>
          <p className="text-lg text-gray-700 mb-2">
            点击选择文件 或 拖拽文件到这里
          </p>
          <p className="text-sm text-gray-500">支持 .dxf 格式的CAD图纸</p>
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-bold">已选择文件：</span>
            <span className="ml-2">{selectedFile.name}</span>
            <span className="ml-2 text-gray-500">
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </span>
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className={`w-full mt-4 py-3 px-6 rounded-lg font-bold text-white transition-all ${
          !selectedFile || loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            处理中...
          </span>
        ) : (
          '🚀 生成3D模型'
        )}
      </button>

      {/* 提示信息 */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>💡 提示：</p>
        <ul className="list-disc list-inside">
          <li>图纸应包含墙体线条(LINE/POLYLINE)</li>
          <li>支持圆形柱子(CIRCLE/ARC)</li>
          <li>文件大小不超过10MB</li>
        </ul>
      </div>
    </div>
  );
}
