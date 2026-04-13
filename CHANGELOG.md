# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.3.1] - 2026-04-13

### Added

-   Extended `useFormWizard` state with `isStepValid`, `dirtyFields`, `touchedFields`, and reactive `watch(name?)`.
-   Added derived navigation helpers: `totalSteps`, `canGoNext`, `canGoPrev`, and `progress`.
-   Extended `FormWizard` render-prop API (`children`) to expose the new state and navigation helpers.
-   Added `field.onBlur()` to `Controller` render props and touched-field updates on interaction.
-   Added React-level API tests for new hook/render/controller behavior in `tests/core/reactApi.test.tsx`.

### Changed

-   Improved internal wizard state tracking for dirty/touched fields while preserving existing APIs.
-   Improved step validation reuse with cached current-step validation checks to avoid redundant work.
-   Updated root and package README documentation to reflect the latest API surface.

## [0.2.0] - 2026-04-10

### Added

-   Strong path-based typing with `FieldPath<T>` and `FieldPathValue<T, P>` utilities.
-   Type-safe `Controller` names and inferred `field.value` typing via `Controller<Values>` usage.
-   Type-safe `steps[].fields` declarations aligned to actual form value paths.
-   Schema-driven generic inference improvements for `FormWizard` to reduce explicit type arguments.
-   `ControllerChangeArg` support for direct values and event-like payloads.
-   Native spread compatibility for controlled inputs (`<input {...field} />`).
-   Modular internal change parsing utility with dedicated tests.

### Improved

-   Better TypeScript DX for `useFormWizard` `setValue`/`getValue` path-value relationships.
-   Better modularity by extracting change normalization into internal helpers.

## [0.1.0] - 2026-04-10

### Added

-   Initial public release of `@avenra/react-step-form`.
-   Core public API: `FormWizard`, `Controller`, and `useFormWizard`.
-   Step-based validation with schema-driven parsing (`safeParse`-style schema).
-   Navigation controls: `next`, `prev`, `goTo`, and submit flow.
-   Optional persistence support with `localStorage` / `sessionStorage`.
-   Example application and unit tests.
-   CI and release workflow integration with Changesets.
