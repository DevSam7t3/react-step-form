# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

-   Package: `@avenra/react-step-form`
-   Current release line: `0.1.0`
-   Package source: `packages/react/src`
-   Example app: `examples/basic`
-   Tests: `tests/core`

## Core Commands

-   Install: `npm install`
-   Build: `npm run build`
-   Validate: `npm run check`
-   Test only: `npm run test`
-   Example app: `npm run dev:example`

## Architecture Notes

-   Public package is a single package under `packages/react`.
-   Internal engine modules live under `packages/react/src/internal`.
-   `Controller` supports both direct value changes and event-like payloads.
-   Type-safe paths are provided via `FieldPath<T>` / `FieldPathValue<T, P>`.

## Editing Rules

-   Keep the package modular by placing reusable logic in `src/internal`.
-   Add tests for behavior changes in `tests/core`.
-   Keep README snippets aligned with real API signatures.
-   Run `npm run check` before finalizing changes.

## Release Notes

-   Changes are tracked with Changesets.
-   Release workflow: `.github/workflows/release.yml`.
-   Manual release-from-tag workflow: `.github/workflows/release-from-tag.yml`.
