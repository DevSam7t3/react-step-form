# 🧩 React Step Form

Flexible, type-safe multi-step wizard forms for React with built-in schema-driven validation.

[![npm version](https://img.shields.io/npm/v/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![npm downloads](https://img.shields.io/npm/dm/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

**React Step Form** is a headless, lightweight library that provides state management and complex multi-step validation out-of-the-box. Built from the ground up to pair perfectly with modern schema validators like **Zod**.

## ✨ Features

-   🧩 **Headless and unopinionated:** Bring your own UI components. We handle the state, navigation, and validation.
-   🛡️ **Schema-driven validation:** Provide a single Zod schema for the entire form. Each step only validates its assigned fields.
-   🎛️ **Controller API:** Easily wire any custom or native input type.
-   🔄 **State persistence:** Built-in support to persist form progress via `localStorage` or `sessionStorage`.
-   📝 **TypeScript-first:** Fully typed API for excellent autocomplete and developer experience.
-   📂 **Nested field paths:** Seamlessly handle complex data structures like `profile.firstName` or `address.city`.

## Installation

```bash
npm install @avenra/react-step-form zod
```

`@avenra/react-step-form` expects a schema object that exposes a `safeParse(data)` method and returns Zod-style issues (`path` + `message`). Zod works out of the box.

## 🚀 Quick Start

Here is a complete, multi-step example. We'll build a standard 2-step registration form.

### 1. Define your Schema & Type

React Step Form uses a single schema for the entire wizard. Each step handles its own subset of fields.

```tsx
import * as z from "zod";

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

type FormValues = z.infer<typeof schema>;
```

### 2. Build your Step Components

Create standard React components. Use the `Controller` to easily connect your inputs to the wizard's state and validation engine without boilerplate.

Tip: for full type safety on `name` and `field.value`, create a typed alias:

```tsx
const TypedController = Controller<FormValues>;
```

```tsx
import { Controller } from "@avenra/react-step-form";

const TypedController = Controller<FormValues>;

export function AccountStep() {
    return (
        <div>
            <h2>Step 1: Account Details</h2>
            <TypedController
                name="email"
                render={({ field, fieldState }) => (
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" {...field} />
                        {fieldState.error && (
                            <p className="error">{fieldState.error}</p>
                        )}
                    </div>
                )}
            />
            <TypedController
                name="password"
                render={({ field, fieldState }) => (
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" {...field} />
                        {fieldState.error && (
                            <p className="error">{fieldState.error}</p>
                        )}
                    </div>
                )}
            />
        </div>
    );
}

export function ProfileStep() {
    return (
        <div>
            <h2>Step 2: User Profile</h2>
            <TypedController
                name="firstName"
                render={({ field, fieldState }) => (
                    <div className="input-group">
                        <label>First Name</label>
                        <input {...field} />
                        {fieldState.error && (
                            <p className="error">{fieldState.error}</p>
                        )}
                    </div>
                )}
            />
            <TypedController
                name="lastName"
                render={({ field, fieldState }) => (
                    <div className="input-group">
                        <label>Last Name</label>
                        <input {...field} />
                        {fieldState.error && (
                            <p className="error">{fieldState.error}</p>
                        )}
                    </div>
                )}
            />
        </div>
    );
}
```

### 3. Assemble the Wizard

Wire it all together using the `FormWizard` component. Use the `fields` array on each step to tell the wizard which schema properties map to which step!

```tsx
import { FormWizard } from "@avenra/react-step-form";

export function RegistrationWizard() {
    return (
        <FormWizard
            schema={schema}
            defaultValues={{
                email: "",
                password: "",
                firstName: "",
                lastName: "",
            }}
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
            onSubmit={async (data) => {
                // Fired only when the entire schema is valid
                console.log("Submitted payload:", data);
                await submitToServer(data);
            }}
        />
    );
}
```

## Type Safety

-   `FormWizard` infers values from `schema` in most cases, so `<FormWizard<Values>>` is optional.
-   `steps[].fields` is optional and type-safe against valid nested paths (`FieldPath<TValues>`). If omitted, fields are inferred from `Controller` names rendered in that step.
-   `Controller` name and `field.value` are type-safe when using a typed alias:

```tsx
type Values = z.infer<typeof schema>;
const TypedController = Controller<Values>;
```

-   `field.onChange` accepts either:
    -   a direct value (`field.onChange("abc")`)
    -   an event-like object (`field.onChange(event)`), so native spread works:

```tsx
<input {...field} />
```

Normalization currently handles text-like inputs, checkbox (`checked`), number (`valueAsNumber`) and multi-select (`selectedOptions`).

### 4. Customizing Layout & Navigation (Optional)

By default, the `FormWizard` renders standard `Previous`/`Next`/`Submit` buttons. If you want full control over the UI, use the `children` render prop:

```tsx
<FormWizard schema={schema} steps={steps} onSubmit={handleSubmit}>
    {({ currentStep, isFirstStep, isLastStep, prev, next, submit, values }) => (
        <div className="custom-wrapper">
            <header>Current Step: {currentStep.id}</header>

            {/* The active step component goes here */}
            <currentStep.component />

            <footer>
                <button onClick={prev} disabled={isFirstStep}>
                    Back
                </button>
                {!isLastStep ? (
                    <button onClick={next}>Continue</button>
                ) : (
                    <button onClick={submit}>Complete Registration</button>
                )}
            </footer>
        </div>
    )}
</FormWizard>
```

## API

### `FormWizard`

```ts
interface FormWizardProps<TValues> {
    steps: Array<{
        id: string;
        component: React.ComponentType;
        fields?: FieldPath<TValues>[];
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
    name: FieldPath<TValues>;
    render: (args: {
        field: {
            value: TValue;
            onChange: (next: ControllerChangeArg<TValue>) => void;
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
    setValue<TName extends FieldPath<TValues>>(
        name: TName,
        value: FieldPathValue<TValues, TName>,
    ): void;
    getValue<TName extends FieldPath<TValues>>(
        name: TName,
    ): FieldPathValue<TValues, TName> | undefined;
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
-   Each step can define field paths via `fields`, or let the wizard infer them from `Controller` usage during step render.
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
