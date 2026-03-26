---
name: discover
description: "First-run codebase discovery and profiling. Detects the stack, test runner, code style, CI/CD, quality gates, and existing patterns, then writes findings to .agent/codebase-profile.md. Invoke this skill at the start of any new project, when .agent/codebase-profile.md does not exist, or when the agent needs to re-orient after significant codebase changes."
---

# Codebase Discovery

Run this protocol to orient yourself to the codebase before executing any phase. The goal is to become project-aware rather than project-agnostic.

## Discovery Steps

### 1. Detect the Stack
Read dependency manifests to identify the language, framework, and tooling:
- `package.json` (Node/JS/TS)
- `Cargo.toml` (Rust)
- `pyproject.toml` or `requirements.txt` (Python)
- `go.mod` (Go)
- `Gemfile` (Ruby)
- `pom.xml` or `build.gradle` (Java/Kotlin)

Note the primary language, framework (e.g., Next.js, Django, Actix), and key dependencies.

### 2. Detect the Test Runner
Find the test command. Check (in order):
- `package.json` scripts for `test`, `test:unit`, `test:e2e`
- `Makefile` for `test` target
- `pytest.ini`, `setup.cfg`, or `pyproject.toml` for pytest config
- `Cargo.toml` (use `cargo test`)
- `go.mod` (use `go test ./...`)

If no test runner exists, note it — you may need to bootstrap one during execution.

### 3. Detect Code Style
Read 2-3 representative source files and note:
- Naming conventions (camelCase, snake_case, PascalCase)
- File organization (flat, feature-based, layer-based)
- Import patterns (absolute, relative, barrel files)
- Comment style (JSDoc, docstrings, inline)
- Formatting (tabs vs spaces, line length)

Check for config files: `.eslintrc`, `.prettierrc`, `rustfmt.toml`, `pyproject.toml` `[tool.black]`, `.editorconfig`.

### 4. Detect CI/CD
Look for:
- `.github/workflows/*.yml` (GitHub Actions)
- `.gitlab-ci.yml` (GitLab CI)
- `Jenkinsfile`
- `Makefile` with deploy/build targets
- `Dockerfile`, `docker-compose.yml`

Note what runs on push/PR: linting, tests, builds, deployments.

### 5. Detect Quality Gates
Identify every check that must pass before code can ship. Scan for:
- **Linters:** eslint, ruff, clippy, golangci-lint — check configs for strictness level (e.g., `-D warnings` for clippy)
- **Formatters:** prettier, black, rustfmt, gofmt — check if there's a `--check` mode configured
- **Type checkers:** tsc, mypy, pyright
- **Test suites:** every distinct test command (unit, integration, e2e — they may be separate)
- **Build verification:** does the project have a build step that must succeed?

Assemble these into an ordered list of commands that constitute the quality gates. These will be run by `/phase-ship` before every PR.

### 6. Detect Existing Patterns
Scan the codebase for how it handles:
- **Error handling** — custom error types, try/catch patterns, Result types
- **Logging** — which library, log levels, structured logging
- **Configuration** — env vars, config files, feature flags
- **Database access** — ORM, raw queries, migration tool
- **API design** — REST, GraphQL, RPC; routing patterns; middleware
- **Authentication** — session, JWT, OAuth; where auth checks happen

## Output

Write findings to `.agent/codebase-profile.md` using this format:

```markdown
# Codebase Profile

## Stack
- Language: {language}
- Framework: {framework}
- Key dependencies: {list}

## Test Runner
- Command: {test_command}
- Framework: {jest/pytest/cargo test/etc}

## Code Style
- Naming: {convention}
- File organization: {pattern}
- Formatting: {tool and config}

## CI/CD
- Platform: {GitHub Actions/GitLab CI/etc}
- On push: {what runs}
- On PR: {what runs}

## Quality Gates
Run these commands in order. All must pass before shipping.
1. {lint command}
2. {format check command}
3. {type check command, if applicable}
4. {test command}
5. {build command, if applicable}

## Patterns
- Error handling: {approach}
- Logging: {library and pattern}
- Config: {approach}
- Database: {ORM/tool}
- API: {style and router}
- Auth: {approach}
```

Update this file whenever you encounter new patterns during execution.
