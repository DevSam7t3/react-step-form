# Changesets

Use Changesets to manage versioning and release notes in pull requests.

## Typical flow

1. Run `npm run changeset` when your pull request changes user-facing behavior.
2. Commit the generated file in `.changeset/`.
3. Merge to `main`.
4. The release workflow opens or updates a version PR.
5. Merging the version PR publishes packages to npm.

## Commands

-   `npm run changeset`
-   `npm run version-packages`
-   `npm run release`
