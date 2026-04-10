# CLAUDE.md

Repository context for Claude-compatible assistants.

## Purpose

`@avenra/react-step-form` is a type-safe, schema-driven multi-step form library for React.

## Current Version

-   `0.1.0`

## What is Implemented in 0.1.0

-   `FormWizard`, `Controller`, and `useFormWizard` public API
-   Path-aware type safety (`FieldPath`, `FieldPathValue`)
-   Schema inference support for `FormWizard`
-   `Controller` event/value compatible `onChange` behavior
-   Internal modular engine under `packages/react/src/internal`
-   Example app under `examples/basic`

## Development Workflow

1. `npm install`
2. Make changes
3. `npm run build`
4. `npm run check`

## Release Workflow

-   Create changeset: `npm run changeset`
-   Version: `npm run version-packages`
-   Publish: `npm run release`

If using GitHub Actions, ensure `NPM_TOKEN` is configured.
