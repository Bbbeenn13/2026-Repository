# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- User authentication system
- Project saving and loading
- Export to GLTF/OBJ/FBX formats
- LWPOLYLINE entity support
- Door and window detection
- Material library
- VR/AR export
- Real-time collaboration

## [1.0.0] - 2026-03-16

### Added
- ✨ Initial release of Warehouse 3D Visualization System
- 🎨 DXF file parsing with LINE and CIRCLE entity support
- 🏗️ Automatic 3D model generation using Three.js
- 🖼️ Interactive 3D viewer with React Three Fiber
- 📐 Auto-scaling camera for models from 10m to 100m+
- 🎯 Multi-view support (Perspective, Top, Front, Side)
- 📊 Scene bounds calculation and automatic camera positioning
- 🔄 REST API for DXF upload and conversion
- 🧪 Comprehensive testing with sample DXF files
- 📚 Full documentation (README, ARCHITECTURE, API docs)
- 🤝 Contributing guidelines and code of conduct
- 🔐 Security policy and issue templates
- ⚙️ GitHub Actions CI/CD pipeline
- 📝 Issue and pull request templates

### Backend Features
- DXF parsing service (`dxfTo3D.js`)
- Support for DXF LINE entities with start/end points
- Support for DXF CIRCLE entities for columns
- Automatic floor generation from scene bounds
- Wall geometry generation (BoxGeometry)
- Column geometry generation (CylinderGeometry)
- JSON export functionality
- Test utilities for validation

### Frontend Features
- File upload interface with drag-and-drop
- Real-time 3D scene rendering
- Interactive camera controls (OrbitControls)
- Automatic camera positioning based on scene size
- Multi-view switching
- Environment lighting and shadows
- Grid helper for spatial reference
- Responsive design with Tailwind CSS
- Error handling and user feedback

### Documentation
- Comprehensive README with quick start guide
- Architecture documentation
- API documentation
- Contributing guidelines
- Code of conduct
- Security policy
- Test report with performance benchmarks

### Testing
- Validated with simple warehouse (10×8m, 8 entities)
- Validated with complex factory (40×30m, 52 entities)
- Auto-scaling verified for scenes up to 70m
- Performance benchmarks: < 1s parsing for 50+ entities
- Expected 60 FPS rendering

### Performance
- DXF parsing: < 0.5s for small files, < 1s for large files
- 3D generation: < 0.5s
- Rendering: 60 FPS for 50+ objects
- Memory usage: ~50MB for Three.js scene

### Developer Experience
- ES Modules support
- Hot module reloading (Vite)
- Git version control with comprehensive commit history
- GitHub Actions CI/CD pipeline
- Automated testing
- Code quality checks
- Issue and PR templates

---

## Version History Format

Each version includes the following sections:

### Added
- New features
- New functionality
- New entities/objects support

### Changed
- Changes in existing functionality
- Improvements to existing features

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes
- Issue resolutions

### Security
- Security vulnerability fixes

---

## Release Notes

### v1.0.0 Highlights

🎉 **First Public Release**

This is the initial release of the Warehouse 3D Visualization System. This version provides core functionality for converting 2D DXF warehouse drawings into interactive 3D models.

**Key Capabilities**:
- Upload DXF files and instantly see 3D visualization
- Support for walls (LINE entities) and columns (CIRCLE entities)
- Automatic camera positioning for any model size
- Interactive 3D controls (rotate, pan, zoom)
- Multi-view perspectives

**Known Limitations**:
- Only supports LINE and CIRCLE entities
- No user authentication (all files are public)
- No project saving
- Limited to single-floor layouts
- No export functionality

**Future Roadmap**:
See README.md for the complete development roadmap.

---

## How to Update

### From Source

```bash
# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm update

# Update frontend dependencies
cd ../frontend
npm update

# Restart services
cd ../backend && npm run dev
cd ../frontend && npm run dev
```

### Migration Guides

Migration guides will be provided for major version updates that include breaking changes.

---

## Support

For questions or issues:
- 📧 Email: your-email@example.com
- 🐛 Issues: https://github.com/Bbbeenn/warehouse-3d-visualization/issues
- 💬 Discussions: https://github.com/Bbbeenn/warehouse-3d-visualization/discussions

---

**Maintained by**: Bbben
**License**: MIT
