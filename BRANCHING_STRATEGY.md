# Branching Strategy

This project follows a simplified Git Flow branching strategy optimized for a single-developer portfolio project with continuous deployment.

## Branch Structure

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Protected branch
- **Deployment**: Auto-deploys to Koyeb production
- **Merge Policy**: Only merge from `develop` or `hotfix/*`
- **CI/CD**: Full pipeline (lint, type-check, build, security audit, CodeQL)

#### `develop`
- **Purpose**: Integration branch for features
- **Protection**: Optional protection
- **Deployment**: Can deploy to staging environment
- **Merge Policy**: Merge from `feature/*` branches
- **CI/CD**: Full pipeline on push

### Supporting Branches

#### `feature/*`
- **Purpose**: New features or enhancements
- **Naming**: `feature/feature-name`
- **Base Branch**: `develop`
- **Merge To**: `develop`
- **Lifetime**: Temporary (delete after merge)
- **Examples**:
  - `feature/add-export-function`
  - `feature/improve-search`
  - `feature/dark-mode-settings`

#### `bugfix/*`
- **Purpose**: Bug fixes for develop branch
- **Naming**: `bugfix/bug-description`
- **Base Branch**: `develop`
- **Merge To**: `develop`
- **Lifetime**: Temporary (delete after merge)
- **Examples**:
  - `bugfix/fix-login-error`
  - `bugfix/kanban-drag-issue`

#### `hotfix/*`
- **Purpose**: Critical production bugs
- **Naming**: `hotfix/issue-description`
- **Base Branch**: `main`
- **Merge To**: Both `main` and `develop`
- **Lifetime**: Temporary (delete after merge)
- **Examples**:
  - `hotfix/security-patch`
  - `hotfix/database-connection-fix`

#### `release/*`
- **Purpose**: Prepare for production release
- **Naming**: `release/v1.2.0`
- **Base Branch**: `develop`
- **Merge To**: Both `main` and `develop`
- **Lifetime**: Temporary (delete after merge)
- **Examples**:
  - `release/v1.0.0`
  - `release/v2.1.0`

## Workflow Examples

### Feature Development

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/add-export-function

# 2. Develop the feature
git add .
git commit -m "feat: Add CSV export functionality"

# 3. Push to remote
git push origin feature/add-export-function

# 4. Create Pull Request to develop
gh pr create --base develop --title "feat: Add CSV export functionality"

# 5. After PR approval and merge, delete branch
git checkout develop
git pull origin develop
git branch -d feature/add-export-function
git push origin --delete feature/add-export-function
```

### Bug Fix

```bash
# 1. Create bugfix branch from develop
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-login-error

# 2. Fix the bug
git add .
git commit -m "fix: Resolve authentication token expiry issue"

# 3. Push and create PR
git push origin bugfix/fix-login-error
gh pr create --base develop --title "fix: Resolve authentication token expiry issue"

# 4. Clean up after merge
git checkout develop
git pull origin develop
git branch -d bugfix/fix-login-error
git push origin --delete bugfix/fix-login-error
```

### Hotfix (Critical Production Bug)

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/security-patch

# 2. Fix the critical issue
git add .
git commit -m "fix: Security patch for XSS vulnerability"

# 3. Merge to main
git checkout main
git merge --no-ff hotfix/security-patch
git push origin main

# 4. Merge to develop
git checkout develop
git merge --no-ff hotfix/security-patch
git push origin develop

# 5. Tag the release
git tag -a v1.0.1 -m "Security patch v1.0.1"
git push origin v1.0.1

# 6. Delete hotfix branch
git branch -d hotfix/security-patch
git push origin --delete hotfix/security-patch
```

### Release Process

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 2. Update version numbers, CHANGELOG
npm version 1.1.0
git add .
git commit -m "chore: Bump version to 1.1.0"

# 3. Merge to main
git checkout main
git merge --no-ff release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags

# 4. Merge back to develop
git checkout develop
git merge --no-ff release/v1.1.0
git push origin develop

# 5. Delete release branch
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes
- **ci**: CI/CD configuration changes

### Examples
```bash
feat(ideas): Add CSV export functionality
fix(auth): Resolve token expiry issue
docs(readme): Update installation instructions
refactor(api): Simplify error handling logic
perf(dashboard): Optimize statistics query
test(ideas): Add unit tests for CRUD operations
chore(deps): Update dependencies
ci(workflow): Add security scanning
```

## Pull Request Guidelines

### Title Format
Use conventional commit format:
```
feat: Add user profile settings
fix: Resolve database connection timeout
docs: Update API documentation
```

### Description Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No linting errors

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

### Review Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All CI checks pass

## Branch Protection Rules

### For `main` branch:
- Require pull request reviews before merging
- Require status checks to pass:
  - Lint check
  - Type check
  - Build
  - Security audit
  - CodeQL analysis
- Require branches to be up to date before merging
- Do not allow force pushes
- Do not allow deletions

### For `develop` branch:
- Require pull request reviews (optional for solo developer)
- Require status checks to pass
- Allow force pushes (with caution)

## Quick Reference

| Branch | Base | Merge To | Delete After | Purpose |
|--------|------|----------|--------------|---------|
| `main` | - | - | Never | Production |
| `develop` | `main` | `main` | Never | Integration |
| `feature/*` | `develop` | `develop` | Yes | New features |
| `bugfix/*` | `develop` | `develop` | Yes | Bug fixes |
| `hotfix/*` | `main` | `main` + `develop` | Yes | Critical fixes |
| `release/*` | `develop` | `main` + `develop` | Yes | Releases |

## Version Tagging

Use [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

Example: v1.2.3
```

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Tagging Commands
```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag to remote
git push origin v1.0.0

# List all tags
git tag -l

# Delete tag (local)
git tag -d v1.0.0

# Delete tag (remote)
git push origin --delete v1.0.0
```

## Deployment Flow

```
feature/* ─┐
           ├─> develop ─> release/* ─> main ─> Koyeb Production
bugfix/*  ─┘                          ▲
                                      │
                          hotfix/* ───┘
```

## Best Practices

1. **Keep branches short-lived**: Merge feature branches within 1-2 days
2. **Commit often**: Small, focused commits are easier to review and revert
3. **Write meaningful commit messages**: Follow conventional commits
4. **Pull before push**: Always pull latest changes before pushing
5. **Review your own PRs**: Self-review before requesting review
6. **Delete merged branches**: Keep repository clean
7. **Tag releases**: Use semantic versioning for all releases
8. **Never commit directly to main**: Always use PRs
9. **Keep develop stable**: Don't merge broken features
10. **Document breaking changes**: Update CHANGELOG.md for breaking changes

## Emergency Procedures

### Rollback Production
```bash
# 1. Find last stable commit
git log --oneline -10

# 2. Create hotfix to revert
git checkout main
git checkout -b hotfix/rollback-to-stable
git revert <bad-commit-hash>
git push origin hotfix/rollback-to-stable

# 3. Merge to main
git checkout main
git merge --no-ff hotfix/rollback-to-stable
git push origin main

# 4. Clean up
git branch -d hotfix/rollback-to-stable
git push origin --delete hotfix/rollback-to-stable
```

### Force Update Develop from Main
```bash
# Use only in emergency when develop is broken
git checkout develop
git reset --hard main
git push --force origin develop
```

## Tools

- **Git CLI**: Primary version control
- **GitHub CLI (`gh`)**: PR management, issue tracking
- **GitHub Actions**: CI/CD automation
- **Branch name validation**: Enforce naming conventions via hooks

## References

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
