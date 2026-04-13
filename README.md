<a id="readme-top"></a>

# 🧩 React Step Form

[![npm version](https://img.shields.io/npm/v/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![npm downloads](https://img.shields.io/npm/dm/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Flexible, type-safe multi-step wizard forms for React with schema-driven validation.

Links: [NPM](https://www.npmjs.com/package/@avenra/react-step-form) · [Issues](https://github.com/DevSam7t3/react-step-form/issues) · [Source](https://github.com/DevSam7t3/react-step-form)

## 📋 Table of Contents

-   [About The Project](#about-the-project)
-   [Built With](#built-with)
-   [Getting Started](#getting-started)
-   [Usage](#usage)
-   [Features](#features)
-   [Type Safety](#type-safety)
-   [Components](#components)
-   [Validation Behavior](#validation-behavior)
-   [Persistence](#persistence)
-   [Debug Panel](#debug-panel)
-   [Roadmap](#roadmap)
-   [Development](#development)
-   [Contributing](#contributing)
-   [License](#license)
-   [Contact / Support](#contact--support)
-   [Acknowledgments](#acknowledgments)

## About The Project

`@avenra/react-step-form` is a headless React library for building multi-step forms with strong type safety and schema-driven validation. It provides a clean wizard engine, step-level validation, typed field paths (including nested fields), and a controller pattern that works with native or custom inputs.

![Project Screenshot](assets/screenshot.png)

Replace `assets/screenshot.png` with a real screenshot or GIF of your form flow.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

-   ![React](https://img.shields.io/badge/React-18%2B%20%7C%2019-20232A?logo=react&logoColor=61DAFB)
-   ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
-   ![Zod](https://img.shields.io/badge/Zod-3.x%20%7C%204.x-3E67B1)
-   ![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest&logoColor=white)
-   ![Vite](https://img.shields.io/badge/Vite-Example_App-646CFF?logo=vite&logoColor=white)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

-   Node.js `18+` recommended
-   React peer dependencies:
    -   `react: ^18.2.0 || ^19.0.0`
    -   `react-dom: ^18.2.0 || ^19.0.0`

### Installation

Install in your app:

```bash
npm install @avenra/react-step-form zod
# or
yarn add @avenra/react-step-form zod
# or
pnpm add @avenra/react-step-form zod
```

For local development in this monorepo:

```bash
git clone https://github.com/DevSam7t3/react-step-form.git
cd react-step-form
npm install
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

### Basic Wizard Example

```tsx
import * as z from "zod";
import { Controller, FormWizard } from "@avenra/react-step-form";

const signupSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Min 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

type SignupValues = z.infer<typeof signupSchema>;
const TypedController = Controller<SignupValues>;

function AccountStep() {
    return (
        <section>
            <TypedController
                name="email"
                render={({ field, fieldState }) => (
                    <label>
                        Email
                        <input type="email" {...field} />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />

            <TypedController
                name="password"
                render={({ field, fieldState }) => (
                    <label>
                        Password
                        <input type="password" {...field} />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
        </section>
    );
}

function ProfileStep() {
    return (
        <section>
            <TypedController
                name="firstName"
                render={({ field }) => (
                    <input placeholder="First name" {...field} />
                )}
            />
            <TypedController
                name="lastName"
                render={({ field }) => (
                    <input placeholder="Last name" {...field} />
                )}
            />
        </section>
    );
}

export function SignupWizard() {
    return (
        <FormWizard
            schema={signupSchema}
            defaultValues={{
                email: "",
                password: "",
                firstName: "",
                lastName: "",
            }}
            steps={[
                { id: "account", component: AccountStep },
                { id: "profile", component: ProfileStep },
            ]}
            onSubmit={(values) => console.log("submit", values)}
        >
            {({ currentStep, isFirstStep, isLastStep, prev, next, submit }) => (
                <main>
                    <currentStep.component />
                    <button type="button" onClick={prev} disabled={isFirstStep}>
                        Back
                    </button>
                    {!isLastStep ? (
                        <button type="button" onClick={next}>
                            Next
                        </button>
                    ) : (
                        <button type="button" onClick={submit}>
                            Submit
                        </button>
                    )}
                </main>
            )}
        </FormWizard>
    );
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

-   Headless and unopinionated UI integration
-   Schema-driven validation with step-level checks
-   Auto field inference from mounted `Controller` components
-   Nested field-path support (for example `account.email`)
-   `watch(name?)` reactive reads for one field or full values
-   Navigation helpers: `totalSteps`, `canGoNext`, `canGoPrev`, `progress`
-   Interaction tracking: `dirtyFields`, `touchedFields`
-   Built-in persistence with `localStorage` and `sessionStorage`
-   Optional debug panel with configurable position

## Type Safety

-   `FormWizard` can infer values from `schema` in most scenarios.
-   `steps[].fields` is optional and type-safe with `FieldPath<TValues>`.
-   `Controller` infers `field.value` correctly for nested field names via typed alias.

```tsx
type Values = z.infer<typeof schema>;
const TypedController = Controller<Values>;

<TypedController
    name="account.email"
    render={({ field }) => (
        <input
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
        />
    )}
/>;
```

`field.onChange` supports direct values and event-like payloads, so spreading native input props works:

```tsx
<input {...field} />
```

## Components

### FormWizard

The root component that wires step flow, validation, persistence, and submission.

#### Basic Usage

```tsx
<FormWizard
    schema={schema}
    steps={steps}
    defaultValues={{ email: "" }}
    onSubmit={(values) => console.log(values)}
/>
```

#### Props

| Property        | Type                                                                                                                                                              | Description                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `steps`         | `Array<{ id: string; component: React.ComponentType; fields?: FieldPath<TValues>[]; meta?: Record<string, unknown> }>`                                            | Required. Step definitions.                          |
| `schema`        | `{ safeParse(data: unknown): { success: true; data: TValues } \| { success: false; error: { issues: Array<{ path: (string \| number)[]; message: string }> } } }` | Required. Zod-compatible schema.                     |
| `defaultValues` | `Partial<TValues>`                                                                                                                                                | Optional initial values.                             |
| `onSubmit`      | `(values: TValues) => void \| Promise<void>`                                                                                                                      | Required submit handler when all values are valid.   |
| `persist`       | `boolean \| "localStorage" \| "sessionStorage"`                                                                                                                   | Optional persistence strategy.                       |
| `persistKey`    | `string`                                                                                                                                                          | Custom persistence key.                              |
| `debug`         | `boolean`                                                                                                                                                         | Enables debug panel.                                 |
| `debugPosition` | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left" \| "inline"`                                                                                        | Debug panel placement.                               |
| `children`      | `(api: FormWizardRenderApi<TValues>) => React.ReactNode`                                                                                                          | Render-prop override for custom layout and controls. |

### Controller

Connects custom or native inputs to wizard state.

#### Basic Usage

```tsx
const TypedController = Controller<SignupValues>;

<TypedController
    name="email"
    render={({ field, fieldState }) => (
        <>
            <input type="email" {...field} />
            {fieldState.error ? <p>{fieldState.error}</p> : null}
        </>
    )}
/>;
```

#### Props

| Property | Type                                                                                                                                                                                                 | Description                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `name`   | `FieldPath<TValues>`                                                                                                                                                                                 | Required field path (supports nested paths).                  |
| `render` | `(args: { field: { value: TValue; onChange: (next: ControllerChangeArg<TValue>) => void; onBlur: () => void; name: string }; fieldState: { error?: string; invalid: boolean } }) => React.ReactNode` | Required render callback with value/handlers and field state. |

### useFormWizard

Hook for reading wizard state and invoking navigation/validation actions.

#### Basic Usage

```tsx
import { useFormWizard } from "@avenra/react-step-form";

function WizardFooter() {
    const { isFirstStep, isLastStep, prev, next, submit, progress } =
        useFormWizard<SignupValues>();

    return (
        <footer>
            <small>{progress}% complete</small>
            <button type="button" onClick={prev} disabled={isFirstStep}>
                Back
            </button>
            {!isLastStep ? (
                <button type="button" onClick={next}>
                    Continue
                </button>
            ) : (
                <button type="button" onClick={submit}>
                    Submit
                </button>
            )}
        </footer>
    );
}
```

#### Return API

| Property           | Type                                                                                                                 | Description                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `values`           | `TValues`                                                                                                            | Current form values.                        |
| `errors`           | `Record<string, string>`                                                                                             | Validation errors by field path.            |
| `dirtyFields`      | `Record<string, boolean>`                                                                                            | Dirty state by field path.                  |
| `touchedFields`    | `Record<string, boolean>`                                                                                            | Touched state by field path.                |
| `currentStepIndex` | `number`                                                                                                             | Zero-based active step index.               |
| `currentStep`      | `{ id: string; fields: string[] }`                                                                                   | Active step info with resolved fields.      |
| `isFirstStep`      | `boolean`                                                                                                            | Whether active step is first.               |
| `isLastStep`       | `boolean`                                                                                                            | Whether active step is last.                |
| `isStepValid`      | `boolean`                                                                                                            | Current step validity snapshot.             |
| `watch`            | `() => TValues` and `<TName extends FieldPath<TValues>>(name: TName) => FieldPathValue<TValues, TName> \| undefined` | Read full values or one field reactively.   |
| `totalSteps`       | `number`                                                                                                             | Total steps.                                |
| `canGoNext`        | `boolean`                                                                                                            | Next navigation availability.               |
| `canGoPrev`        | `boolean`                                                                                                            | Previous navigation availability.           |
| `progress`         | `number`                                                                                                             | Integer progress percentage (`0-100`).      |
| `setValue`         | `<TName extends FieldPath<TValues>>(name: TName, value: FieldPathValue<TValues, TName>) => void`                     | Set field value.                            |
| `getValue`         | `<TName extends FieldPath<TValues>>(name: TName) => FieldPathValue<TValues, TName> \| undefined`                     | Get field value.                            |
| `next`             | `() => boolean`                                                                                                      | Validate current step and advance if valid. |
| `prev`             | `() => boolean`                                                                                                      | Go to previous step.                        |
| `goTo`             | `(stepId: string) => boolean`                                                                                        | Navigate by step id.                        |
| `validateStep`     | `() => { valid: boolean; errors: Record<string, string> }`                                                           | Validate active step fields.                |
| `validateAll`      | `() => { valid: boolean; errors: Record<string, string> }`                                                           | Validate full form.                         |
| `reset`            | `(nextValues?: Partial<TValues>) => void`                                                                            | Reset wizard state.                         |
| `clearErrors`      | `(paths?: string[]) => void`                                                                                         | Clear all or selected errors.               |

## Validation Behavior

-   You provide one schema for the complete payload.
-   `next()` validates only active step fields.
-   `submit()` validates all fields before `onSubmit` executes.
-   Step fields can be explicit (`steps[].fields`) or inferred from mounted `Controller` usage.

## Persistence

```tsx
<FormWizard
    persist="localStorage"
    persistKey="signup-form"
    // ...other props
/>
```

-   Stored values are hydrated before first render.
-   Storage writes happen only when serialized values change.

## Debug Panel

```tsx
<FormWizard
    schema={schema}
    steps={steps}
    onSubmit={handleSubmit}
    debug
    debugPosition="bottom-right"
/>
```

Available `debugPosition` values:

-   `"bottom-right"` (default)
-   `"bottom-left"`
-   `"top-right"`
-   `"top-left"`
-   `"inline"`

## Roadmap

-   [x] Type-safe field paths and nested value inference
-   [x] Render-prop APIs for custom wizard layouts
-   [x] Dirty/touched tracking and `watch(name?)`
-   [x] Persistence and debug panel
-   [ ] More advanced examples and recipes
-   [ ] Additional integration guides (UI kits and form patterns)

See [open issues](https://github.com/DevSam7t3/react-step-form/issues) for planned improvements.

## Development

```bash
npm install
npm run check
npm run build
npm run dev:example
```

Release flow:

```bash
npm run changeset
npm run version-packages
npm run release
```

Automated release workflow: `.github/workflows/release.yml`.

## Contributing

Contributions are welcome.

-   Read `CONTRIBUTING.md`
-   Follow `CODE_OF_CONDUCT.md`
-   Report security concerns via `SECURITY.md`
-   General help and questions in `SUPPORT.md`

## License

Distributed under the MIT License. See `LICENSE` for details.

## Contact / Support

-   Repository: `https://github.com/DevSam7t3/react-step-form`
-   Issues: `https://github.com/DevSam7t3/react-step-form/issues`
-   NPM package: `https://www.npmjs.com/package/@avenra/react-step-form`
-   Email: `samirashid54222@gmail.com`
-   LinkedIn: `https://linkedin.com/in/samikhan73`

## Acknowledgments

-   [Shields.io](https://shields.io) for badges
-   [Zod](https://zod.dev) for schema-driven validation patterns
-   [React](https://react.dev) and [TypeScript](https://www.typescriptlang.org)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
