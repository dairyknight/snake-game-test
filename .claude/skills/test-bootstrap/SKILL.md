---
name: test-bootstrap
description: |
  Detect the project's test framework and runtime, or bootstrap a test suite if none exists.
  Cross-runtime: Node.js, Python, Ruby, Go, Rust, PHP, Elixir. Other skills (ship, qa,
  design-review) reference this algorithm instead of duplicating it.
---

# Test Framework Bootstrap

Detect the project's test framework and runtime. Use this algorithm wherever you need to run tests or bootstrap a test suite.

## Step 1: Detect Runtime

```bash
[ -f Gemfile ] && echo "RUNTIME:ruby"
[ -f package.json ] && echo "RUNTIME:node"
[ -f requirements.txt ] || [ -f pyproject.toml ] && echo "RUNTIME:python"
[ -f go.mod ] && echo "RUNTIME:go"
[ -f Cargo.toml ] && echo "RUNTIME:rust"
[ -f composer.json ] && echo "RUNTIME:php"
[ -f mix.exs ] && echo "RUNTIME:elixir"
```

Sub-frameworks:
```bash
[ -f Gemfile ] && grep -q "rails" Gemfile 2>/dev/null && echo "FRAMEWORK:rails"
[ -f package.json ] && grep -q '"next"' package.json 2>/dev/null && echo "FRAMEWORK:nextjs"
```

## Step 2: Detect Existing Test Infrastructure

```bash
ls jest.config.* vitest.config.* playwright.config.* .rspec pytest.ini pyproject.toml phpunit.xml 2>/dev/null
ls -d test/ tests/ spec/ __tests__/ cypress/ e2e/ 2>/dev/null
```

**If test framework detected** (config files or test directories found):
Print "Test framework detected: {name} ({N} existing tests). Skipping bootstrap."
Read 2-3 existing test files to learn conventions (naming, imports, assertion style, setup patterns).

**If no runtime detected:** Continue without tests. Document: "AUTONOMOUS DECISION: No runtime detected — skipping test bootstrap."

## Step 3: Bootstrap (if runtime detected but no test framework)

### Research best practices

Use WebSearch if available: `"[runtime] best test framework 2025 2026"`

Otherwise, use this built-in table:

| Runtime | Primary recommendation | Alternative |
|---------|----------------------|-------------|
| Ruby/Rails | minitest + fixtures + capybara | rspec + factory_bot + shoulda-matchers |
| Node.js | vitest + @testing-library | jest + @testing-library |
| Next.js | vitest + @testing-library/react + playwright | jest + cypress |
| Python | pytest + pytest-cov | unittest |
| Go | stdlib testing + testify | stdlib only |
| Rust | cargo test (built-in) + mockall | — |
| PHP | phpunit + mockery | pest |
| Elixir | ExUnit (built-in) + ex_machina | — |

### Install and configure

1. Install the chosen packages (npm/bun/gem/pip/etc.)
2. Create minimal config file
3. Create directory structure (test/, spec/, etc.)
4. Create one example test matching the project's code to verify setup works

If package installation fails → debug once. If still failing → revert. Warn and continue without tests.

### Verify

Run the full test suite to confirm everything works. If tests fail → debug once. If still failing → revert all bootstrap changes and warn.
