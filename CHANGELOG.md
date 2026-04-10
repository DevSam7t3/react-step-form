# Changelog

All notable changes to this project are documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [0.1.0] - 2026-04-10

### Added

-   Initial public release of `@avenra/react-step-form`.
-   Core public API: `FormWizard`, `Controller`, and `useFormWizard`.
-   Step-based validation with schema-driven parsing (`safeParse`-style schema).
-   Navigation controls: `next`, `prev`, `goTo`, and submit flow.
-   Optional persistence support with `localStorage` / `sessionStorage`.
-   Typed path utilities for fields (`FieldPath`, `FieldPathValue`).
-   Type-aware step field declarations via `steps[].fields`.
-   Event/value compatible `Controller` `field.onChange` behavior.
-   Example application and unit tests.
-   CI and release workflow integration with Changesets.

### Notes

-   This is the baseline release entry. Future changes should append new version sections above this one.
