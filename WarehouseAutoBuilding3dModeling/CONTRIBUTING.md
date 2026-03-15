# 🤝 Contributing to Warehouse 3D Visualization System

Thank you for your interest in contributing! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or spreading the word.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)

---

## 🎖️ Code of Conduct

### Our Pledge

We as contributors, maintainers, and reviewers pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

**Positive behaviors include**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include**:
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, or personal attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Any other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed and configured
- A GitHub account
- Basic knowledge of JavaScript/React
- Familiarity with Three.js (optional but helpful)

### First Time Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork locally
git clone https://github.com/YOUR_USERNAME/warehouse-3d-visualization.git
cd warehouse-3d-visualization

# 3. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 4. Create a new branch for your work
git checkout -b feature/your-feature-name

# 5. Start the development servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

---

## 🔄 Development Workflow

### 1. Find an Issue

- Browse [issues](https://github.com/Bbbeenn/warehouse-3d-visualization/issues)
- Look for labels:
  - `good first issue` - Good for newcomers
  - `help wanted` - Community contributions welcome
  - `enhancement` - New features
  - `bug` - Bugs to fix

### 2. Claim an Issue

- Comment on the issue that you'd like to work on it
- Wait for maintainers to assign it to you
- Ask questions if anything is unclear

### 3. Create a Branch

```bash
# Use descriptive branch names:
git checkout -b bugfix/parse-line-endpoints
git checkout -b feature/auto-scaling-camera
git checkout -b docs/update-api-documentation
```

**Branch Naming Conventions**:
- `bugfix/` - Bug fixes
- `feature/` - New features
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `style/` - Style changes (formatting, etc.)

### 4. Make Your Changes

- Write clean, well-commented code
- Follow the [Coding Standards](#coding-standards)
- Test your changes thoroughly
- Update documentation as needed

### 5. Commit Your Changes

Follow [Commit Message Guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add support for LWPOLYLINE entities"
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

- Visit the original repository on GitHub
- Click "New Pull Request"
- Provide a clear description of your changes
- Link related issues
- Request review from maintainers

---

## 📐 Coding Standards

### JavaScript/JSX Style

**Use ES6+ Syntax**:
```javascript
// ✅ Good
const parseDXF = (content) => { ... }

// ❌ Bad
var parseDXF = function(content) { ... }
```

**Prefer Const Over Let**:
```javascript
// ✅ Good
const wallHeight = 4;

// ❌ Bad
var wallHeight = 4;
```

**Use Template Literals**:
```javascript
// ✅ Good
const message = `Parsed ${entities.length} entities`;

// ❌ Bad
const message = 'Parsed ' + entities.length + ' entities';
```

### File Naming

- **Components**: PascalCase (e.g., `WarehouseModel.jsx`)
- **Utilities**: camelCase (e.g., `dxfTo3D.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_WALL_HEIGHT`)
- **Tests**: `.test.js` or `.spec.js` suffix

### Code Organization

**Backend Structure**:
```
backend/
├── services/          # Business logic
├── routes/           # API endpoints
├── middleware/       # Express middleware
├── utils/            # Helper functions
└── tests/            # Test files
```

**Frontend Structure**:
```
frontend/src/
├── components/       # React components
│   ├── common/      # Reusable components
│   └── features/    # Feature-specific components
├── hooks/           # Custom React hooks
├── utils/           # Helper functions
├── services/        # API services
└── styles/          # CSS/global styles
```

### Commenting Guidelines

```javascript
/**
 * Parses DXF file and extracts entities
 * @param {string} dxfContent - DXF file content
 * @returns {Array<Object>} Array of parsed entities
 * @throws {Error} When DXF content is invalid
 *
 * @example
 * const entities = parseDXF(dxfContent);
 * // Returns: [{ type: 'line', points: [...] }, ...]
 */
function parseDXF(dxfContent) {
  // Implementation here
}
```

---

## 🧪 Testing Guidelines

### Backend Testing

```javascript
// Test DXF parsing
import DXFTo3DService from './services/dxfTo3D.js';

describe('DXF Parsing', () => {
  it('should parse LINE entities correctly', () => {
    const dxfContent = '...';
    const parser = new DXFTo3DService();
    const entities = parser.parseDXF(dxfContent);

    expect(entities).toHaveLength(8);
    expect(entities[0].type).toBe('line');
  });

  it('should generate 3D geometry from entities', () => {
    const entities = [...];
    const parser = new DXFTo3DService();
    const scene = parser.generate3DGeometry(entities);

    expect(scene.objects).toBeDefined();
    expect(scene.objects.length).toBeGreaterThan(0);
  });
});
```

### Frontend Testing

```javascript
// Test React components
import { render, screen } from '@testing-library/react';
import Scene3D from './Scene3D';

describe('Scene3D Component', () => {
  it('renders without crashing', () => {
    render(<Scene3D sceneData={mockData} />);
    expect(screen.getByText('3D View')).toBeInTheDocument();
  });

  it('handles missing scene data gracefully', () => {
    render(<Scene3D sceneData={null} />);
    expect(screen.getByText('No scene data')).toBeInTheDocument();
  });
});
```

### Testing DXF Files

When adding support for new DXF entities:

1. Create a test DXF file in `samples/test-entities.dxf`
2. Add test cases to `backend/test-complex-dxf.js`
3. Verify 3D generation
4. Document any limitations

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

**Good Commit Messages**:
```bash
feat(backend): add support for LWPOLYLINE entities

- Implement LWPOLYLINE parsing
- Generate 3D geometry from polylines
- Add unit tests for polyline entities

Closes #123
```

```bash
fix(frontend): resolve camera positioning for large models

The auto-scaling feature was not correctly calculating
scene bounds for models larger than 50m. This commit
fixes the bounding box calculation algorithm.

Fixes #145
```

**Bad Commit Messages**:
```bash
# ❌ Too vague
git commit -m "update code"

# ❌ Doesn't follow convention
git commit -m "Fixed the bug with camera"

# ❌ Too long
git commit -m "I fixed the camera positioning issue and also updated the documentation and added some tests"
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Code is well-commented
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow guidelines

### PR Title Format

```
<type>: <short description>
```

Examples:
- `feat: add support for ARC entities`
- `fix: resolve camera clipping on large models`
- `docs: update API documentation`

### PR Description Template

Use the PR template and include:

1. **Summary**: What this PR does
2. **Related Issue**: Link to issue number
3. **Changes**: List of files changed
4. **Testing**: Tests performed
5. **Screenshots**: If UI changes
6. **Breaking Changes**: Any breaking changes

### Review Process

1. **Automated Checks**: CI pipeline must pass
2. **Code Review**: At least one maintainer approval
3. **Testing**: Manual testing by reviewers
4. **Merge**: Squashed into main branch

### Addressing Feedback

- Make requested changes
- Push to the same branch
- Leave a comment when changes are ready
- Ask questions if anything is unclear

---

## 🛠️ Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

### DXF File Testing

```bash
# Test DXF parsing
cd backend
node test-complex-dxf.js

# Expected output:
# - Parses 52 entities
# - Generates 53 objects
# - Exports to test-output-complex.json
```

---

## 📚 Adding Documentation

### Code Documentation

Use JSDoc for functions:

```javascript
/**
 * Creates a 3D wall from a LINE entity
 * @param {Object} entity - DXF LINE entity
 * @param {Array} entity.points - Start and end points
 * @returns {Object} 3D wall object with geometry and position
 */
function createWallFromLine(entity) {
  // Implementation
}
```

### README Updates

When adding features:
- Update the "Features" section
- Add usage examples
- Update screenshots
- Document new API endpoints

### API Documentation

Document new endpoints in `docs/API.md`:

```markdown
### POST /api/model/parse

Parse DXF file without generating 3D model.

**Request**:
- File: DXF file

**Response**:
```json
{
  "entities": [...],
  "metadata": {...}
}
```
```

---

## 🐛 Bug Reports

When reporting bugs:

1. Use the bug report template
2. Provide clear reproduction steps
3. Include error messages and logs
4. Attach problematic DXF files
5. Specify your environment

---

## ✨ Feature Requests

When suggesting features:

1. Check if it's already been requested
2. Use the feature request template
3. Describe the use case clearly
4. Consider if it fits the project scope
5. Be open to discussion

---

## 📖 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [DXF Reference](https://help.autodesk.com/view/OARX/2022/ENU/)
- [Contributing to Open Source](https://opensource.guide/)

---

## 💬 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Email**: your-email@example.com

---

## 🎉 Recognition

All contributors will be:
- Listed in the CONTRIBUTORS.md file
- Mentioned in release notes
- Credited in commit history

Thank you for contributing! 🙏

---

**Made with ❤️ by the Warehouse 3D Visualization community**
