# 🚀 Development Workflow Guide

This guide explains the automated development workflow for the Warehouse 3D Visualization System.

---

## 📋 Development Process Overview

```
Planning → Development → Testing → Review → Merge → Deploy
   ↓          ↓           ↓         ↓       ↓        ↓
 Issues    Branch      CI/CD      PR    Main    Production
```

---

## 1. 🎯 Planning Phase

### Finding Work

1. **Check GitHub Issues**: https://github.com/Bbbeenn/warehouse-3d-visualization/issues
2. **Filter by Labels**:
   - `good first issue` - Great for newcomers
   - `help wanted` - Community contributions
   - `enhancement` - New features
   - `bug` - Bug fixes
3. **Comment on Issue**: Claim it by commenting "I'd like to work on this"

### Creating Issues

Use appropriate templates:
- 🐛 **Bug Report**: For problems
- ✨ **Feature Request**: For new features
- 📐 **DXF Issue**: For DXF parsing problems

---

## 2. 🔨 Development Phase

### Branch Creation

```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
git checkout -b bugfix/your-bug-fix
git checkout -b docs/your-documentation-update
```

### Development Setup

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Start development servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# 3. Create your feature
# Edit files...
```

### Coding Standards

Follow the guidelines in `CONTRIBUTING.md`:
- ES6+ syntax
- Const over let
- Template literals
- JSDoc comments
- Descriptive variable names

### Testing Locally

```bash
# Test backend
cd backend
node test-complex-dxf.js

# Test frontend
cd frontend
npm run build
npm run lint
```

---

## 3. 🧪 Testing Phase

### Manual Testing Checklist

- [ ] Upload `samples/simple-warehouse.dxf`
- [ ] Upload `samples/complex-factory-warehouse.dxf`
- [ ] Test camera controls (rotate, pan, zoom)
- [ ] Test all view buttons (Perspective, Top, Front, Side)
- [ ] Test error handling (upload invalid file)
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Automated Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run all tests
npm test
```

---

## 4. 📝 Commit Phase

### Staging Changes

```bash
# Check what changed
git status

# Stage all changes
git add .

# Stage specific files
git add backend/services/dxfTo3D.js
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Refactoring
- `perf`: Performance
- `test`: Tests
- `chore`: Maintenance

**Examples**:

```bash
# Good
git commit -m "feat(backend): add LWPOLYLINE support

- Implement LWPOLYLINE parsing
- Generate walls from polylines
- Add unit tests

Closes #123"

# Good
git commit -m "fix(frontend): resolve camera clipping on large models

The auto-scaling was not calculating correct bounds
for models larger than 50m.

Fixes #145"
```

### Committing

```bash
# Commit changes
git commit -m "feat: add support for ARC entities"

# Push to your fork
git push origin feature/arc-support
```

---

## 5. 🔀 Pull Request Phase

### Creating a PR

1. Visit: https://github.com/Bbbeenn/warehouse-3d-visualization
2. Click "Compare & pull request"
3. Fill in the PR template:
   - Summary of changes
   - Related issue number
   - Testing performed
   - Screenshots (if UI changes)

### PR Review Process

```
Submit PR → CI Checks → Code Review → Feedback → Approval → Merge
    ↓           ↓          ↓           ↓          ↓         ↓
   You      GitHub    Maintainer   Maintainer  Maintainer  Auto
```

**CI Checks**:
- Backend tests pass ✅
- Frontend builds ✅
- Code quality checks ✅
- Integration tests ✅

**Code Review**:
- Maintainer reviews your code
- Provides feedback or requests changes
- You make updates if needed
- Maintainer approves

### Addressing Feedback

```bash
# Make requested changes
# Edit files...

# Commit to same branch
git add .
git commit -m "fix: address review feedback"

# Push to update PR
git push origin feature/your-feature-name
```

---

## 6. 🚢 Merge Phase

### After Approval

1. **Squash Merge**: Maintainer will squash your commits
2. **Merge to Main**: Your code is now in main branch
3. **Delete Branch**: Clean up old branches

### Automatic Deployment

When merged to `main`:
1. GitHub Actions runs CI/CD pipeline
2. Tests are executed
3. Build artifacts are created
4. (Future) Deployed to production

---

## 7. 📊 Post-Merge Phase

### Update Local Repository

```bash
# Pull latest changes from main
git checkout main
git pull origin main

# Delete your feature branch
git branch -d feature/your-feature-name

# Update dependencies
cd backend && npm update
cd ../frontend && npm update
```

### Celebrate! 🎉

Your contribution is now part of the project!

---

## 🔄 Continuous Integration

### GitHub Actions Pipeline

Every push triggers:

```yaml
1. Test Backend
   - Install dependencies
   - Run DXF parsing test
   - Validate output

2. Test Frontend
   - Install dependencies
   - Lint code
   - Build application

3. Code Quality
   - Check file sizes
   - Find TODOs
   - Validate samples

4. Integration Test
   - Start backend server
   - Test health endpoint
   - Test DXF upload

5. Deploy (main branch only)
   - Build frontend
   - Create artifacts
   - Deploy to production
```

### Monitoring CI

Check your workflow runs:
https://github.com/Bbbeenn/warehouse-3d-visualization/actions

---

## 🐛 Bug Fix Workflow

### Quick Bug Fixes

```bash
# Create bugfix branch
git checkout -b bugfix/camera-positioning

# Make the fix
# Edit files...

# Test the fix
npm test

# Commit and push
git add .
git commit -m "fix: resolve camera positioning bug"
git push origin bugfix/camera-positioning

# Create PR
# Link to issue: Fixes #123
```

### Complex Bug Fixes

1. **Research**: Understand the problem
2. **Create Issue**: Document the bug
3. **Plan**: Outline the fix approach
4. **Implement**: Write the fix
5. **Test**: Thoroughly test
6. **Document**: Update documentation
7. **PR**: Submit pull request

---

## ✨ Feature Development Workflow

### New Feature Process

```bash
1. Discuss
   - Create issue with feature proposal
   - Get feedback from maintainers

2. Plan
   - Break down into tasks
   - Estimate complexity
   - Identify dependencies

3. Implement
   - Create feature branch
   - Write code
   - Add tests
   - Update docs

4. Review
   - Submit PR
   - Address feedback
   - Get approval

5. Merge
   - Squash merge to main
   - Update changelog
   - Celebrate!
```

---

## 📚 Documentation Updates

### When to Update Docs

Update documentation when you:
- Add a new feature
- Change an API endpoint
- Fix a significant bug
- Update dependencies
- Change architecture

### Documentation Files

- `README.md` - Main project documentation
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contributor guide
- `docs/API.md` - API documentation
- `docs/ARCHITECTURE.md` - System architecture
- `CODE_OF_CONDUCT.md` - Community guidelines
- `SECURITY.md` - Security policy

---

## 🎯 Development Tips

### Productive Habits

1. **Small Commits**: Commit often with small, focused changes
2. **Clear Messages**: Write descriptive commit messages
3. **Test Early**: Test as you develop, not at the end
4. **Read Docs**: Check existing docs before asking questions
5. **Ask Questions**: Use GitHub Discussions for help

### Debugging Tips

```bash
# Backend debugging
cd backend
node test-complex-dxf.js

# Frontend debugging
cd frontend
npm run dev
# Check browser console for logs

# Git debugging
git log --oneline --graph
git diff main
git blame file.js
```

### Code Review Tips

- Be open to feedback
- Ask clarifying questions
- Explain your reasoning
- Learn from others
- Help review others' PRs

---

## 🔄 Release Process

### Version Bumping

```bash
# Update version in package.json files
cd backend
npm version minor  # or major, or patch

cd ../frontend
npm version minor

# Commit
git add .
git commit -m "chore: bump version to 1.1.0"
git push origin main
```

### Changelog Update

Before release, update `CHANGELOG.md`:

```markdown
## [1.1.0] - 2026-03-20

### Added
- New feature A
- New feature B

### Fixed
- Bug fix C
```

---

## 📞 Getting Help

### Resources

- **Documentation**: README.md, docs/
- **Issues**: https://github.com/Bbbeenn/warehouse-3d-visualization/issues
- **Discussions**: https://github.com/Bbbeenn/warehouse-3d-visualization/discussions
- **Email**: your-email@example.com

### Asking Questions

1. **Search first**: Check if your question was already answered
2. **Be specific**: Provide details about your problem
3. **Show your work**: Share code snippets, error messages
4. **Use the right channel**:
   - Bugs → Issues
   - Questions → Discussions
   - Security → Email

---

## 🎉 Success!

You've completed the development workflow! Your contribution is helping make the Warehouse 3D Visualization System better for everyone.

**Thank you for contributing!** 🙏

---

**Last Updated**: 2026-03-16

**Maintainer**: Bbben
