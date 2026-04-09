# react-step-form

[![npm version](https://img.shields.io/npm/v/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![npm downloads](https://img.shields.io/npm/dm/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

Flexible, type-safe multi-step forms for React with schema-driven validation and fully custom UI.

## Features

-   User-defined steps with custom React components
-   Centralized wizard state (`values`, `errors`, current step)
-   `Controller` API for wiring any input type
-   Per-step validation using a single full schema
-   Navigation controls: `next`, `prev`, `goTo`
-   Nested field paths (`profile.firstName`, `address.city`)
-   Optional persistence (`localStorage` or `sessionStorage`)
-   TypeScript-first API

## Installation

```bash
npm install @avenra/react-step-form zod
```

`@avenra/react-step-form` expects a schema object that exposes a `safeParse(data)` method and returns Zod-style issues (`path` + `message`). Zod works out of the box.

## Quick Start

```tsx
import { Controller, FormWizard } from "@avenra/react-step-form";
import * as z from "zod";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
});

type Values = z.infer<typeof schema>;

function AccountStep() {
    return (
        <>
            <Controller
                name="email"
                render={({ field, fieldState }) => (
                    <label>
                        Email
                        <input
                            value={String(field.value ?? "")}
                            onChange={(event) =>
                                field.onChange(event.target.value)
                            }
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
            <Controller
                name="password"
                render={({ field, fieldState }) => (
                    <label>
                        Password
                        <input
                            type="password"
                            value={String(field.value ?? "")}
                            onChange={(event) =>
                                field.onChange(event.target.value)
                            }
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
        </>
    );
}

function ProfileStep() {
    return (
        <>
            <Controller
                name="firstName"
                render={({ field, fieldState }) => (
                    <label>
                        First name
                        <input
                            value={String(field.value ?? "")}
                            onChange={(event) =>
                                field.onChange(event.target.value)
                            }
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
            <Controller
                name="lastName"
                render={({ field, fieldState }) => (
                    <label>
                        Last name
                        <input
                            value={String(field.value ?? "")}
                            onChange={(event) =>
                                field.onChange(event.target.value)
                            }
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
        </>
    );
}

export function RegistrationWizard() {
    return (
        <FormWizard<Values>
            steps={[
                {
                    id: "account",
                    component: AccountStep,
                    fields: ["email", "password"],
                },
                {
                    id: "profile",
                    component: ProfileStep,
                    fields: ["firstName", "lastName"],
                },
            ]}
            schema={schema}
            defaultValues={{
                email: "",
                password: "",
                firstName: "",
                lastName: "",
            }}
            onSubmit={(data) => {
                console.log("Submitted:", data);
            }}
        />
    );
}
```

## API

### `FormWizard`

```ts
interface FormWizardProps<TValues> {
    steps: Array<{
        id: string;
        component: React.ComponentType;
        fields: string[];
        meta?: Record<string, unknown>;
    }>;
    schema: {
        safeParse(data: unknown):
            | { success: true; data: TValues }
            | {
                  success: false;
                  error: {
                      issues: Array<{
                          path: (string | number)[];
                          message: string;
                      }>;
                  };
              };
    };
    defaultValues?: Partial<TValues>;
    onSubmit: (values: TValues) => void | Promise<void>;
    persist?: boolean | "localStorage" | "sessionStorage";
    persistKey?: string;
    children?: (api: FormWizardRenderApi<TValues>) => React.ReactNode;
}
```

`children` is optional and enables fully custom layouts/navigation. If not provided, the wizard renders the current step with default `Previous/Next/Submit` buttons.

### `Controller`

```ts
interface ControllerProps<TValue = unknown> {
    name: string;
    render: (args: {
        field: {
            value: TValue;
            onChange: (next: TValue) => void;
            name: string;
        };
        fieldState: {
            error?: string;
            invalid: boolean;
        };
    }) => React.ReactNode;
}
```

### `useFormWizard`

```ts
function useFormWizard<TValues = Record<string, unknown>>(): {
    values: TValues;
    errors: Record<string, string>;
    currentStepIndex: number;
    currentStep: { id: string; fields: string[] };
    isFirstStep: boolean;
    isLastStep: boolean;
    setValue(path: string, value: unknown): void;
    getValue<TValue = unknown>(path: string): TValue | undefined;
    next(): boolean;
    prev(): boolean;
    goTo(stepId: string): boolean;
    validateStep(): { valid: boolean; errors: Record<string, string> };
    validateAll(): { valid: boolean; errors: Record<string, string> };
    reset(nextValues?: Partial<TValues>): void;
    clearErrors(paths?: string[]): void;
};
```

## Validation Behavior

-   You provide one full schema for the entire form.
-   Each step defines the field paths it owns via `fields`.
-   `next()` validates only the active step fields.
-   `submit()` validates all fields and calls `onSubmit` only when valid.

## Persistence

Use `persist` to retain values across refreshes:

```tsx
<FormWizard
    persist="localStorage"
    persistKey="signup-form"
    // ...other props
/>
```

## Workspace Structure

```txt
packages/
    react/    React public package (`@avenra/react-step-form`) with internal core logic
examples/
  basic/    runnable usage example
tests/
    core/     wizard engine unit tests
```

## Development

```bash
npm install
npm run check
npm run build
npm run dev:example
```

## Releasing (Changesets)

### Create a changeset

```bash
npm run changeset
```

### Version packages

```bash
npm run version-packages
```

### Publish

```bash
npm run release
```

Automated release is configured via GitHub Actions in `.github/workflows/release.yml`.

## Contributing and Community

-   Contribution guide: `CONTRIBUTING.md`
-   Code of conduct: `CODE_OF_CONDUCT.md`
-   Security policy: `SECURITY.md`
-   Support and help: `SUPPORT.md`

## License

MIT
