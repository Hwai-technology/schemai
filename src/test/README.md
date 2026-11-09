# Feature: Test Harness & CI Pipeline

## 1. Overview
- **Feature Name**: Test Harness & CI Pipeline
- **Assigned Owner**: Yunus
- **Associated ClickUp HUs**: QA, CI

## 2. Responsibilities
- Maintain the Mocha test runner environment for VS Code extension testing.
- Provide shared testing utilities, mock VS Code contexts, and API response fixtures.
- Configure and maintain GitHub Actions CI workflows for automated pull request validation.
- Enforce code quality gates (linting, test coverage, build verification).

## 3. Scope Boundaries
- **In Scope**: Test infrastructure, CI workflow definitions, mock helpers, runner scripts.
- **Out of Scope**: Feature-specific unit test assertions (authored by feature owners as TDD tests).

## 4. Expected Interfaces & Integration Points
- Provides test execution entry points:
  - `npm test`
  - CI test action matrices.

## 5. Development & Ownership Rules
- Changes to this directory require Yunus's review and approval.
- CI workflows must run tests in isolated containers without depending on uncommitted state.

