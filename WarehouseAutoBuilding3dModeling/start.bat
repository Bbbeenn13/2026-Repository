@echo off
echo ====================================
echo 🏭 仓库3D可视化系统 - 快速启动
echo ====================================
echo.

echo [1/3] 检查后端依赖...
cd backend
if not exist "node_modules" (
    echo 正在安装后端依赖...
    call npm install
) else (
    echo ✓ 后端依赖已安装
)
echo.

echo [2/3] 检查前端依赖...
cd ..\frontend
if not exist "node_modules" (
    echo 正在安装前端依赖...
    call npm install
) else (
    echo ✓ 前端依赖已安装
)
echo.

echo [3/3] 启动服务...
echo.
echo 启动后端服务（端口 3001）...
start "仓库3D系统-后端" cmd /k "cd ..\backend && npm run dev"
timeout /t 2 /nobreak >nul

echo 启动前端服务（端口 5173）...
start "仓库3D系统-前端" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ====================================
echo ✅ 服务启动完成！
echo ====================================
echo.
echo 📱 前端地址: http://localhost:5173
echo 🔧 后端地址: http://localhost:3001
echo.
echo 按任意键关闭此窗口...
pause >nul
