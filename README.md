# 🧩 React Step Form

Flexible, type-safe multi-step wizard forms for React with built-in schema-driven validation.

[![npm version](https://img.shields.io/npm/v/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![npm downloads](https://img.shields.io/npm/dm/%40avenra%2Freact-step-form.svg)](https://www.npmjs.com/package/@avenra/react-step-form)
[![license: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

**React Step Form** is a headless, lightweight library that provides state management and complex multi-step validation out-of-the-box. Built from the ground up to pair perfectly with modern schema validators like **Zod**.

## ✨ Features

-   🧩 **Headless and unopinionated:** Bring your own UI components. We handle the state, navigation, and validation.
-   🛡️ **Schema-driven validation:** Provide a single Zod schema for the entire form. Each step only validates its assigned fields.
-   🧠 **Auto field inference:** Skip `steps[].fields` and infer step fields directly from mounted `Controller` names.
-   🎛️ **Controller API:** Easily wire any custom or native input type.
-   👀 **Reactive watch API:** Read live values for one field or the full form via `watch()`.
-   🧭 **Navigation helpers:** `totalSteps`, `canGoNext`, `canGoPrev`, and `progress` are exposed out of the box.
-   ✍️ **Interaction tracking:** `dirtyFields` and `touchedFields` are tracked per field.
-   🔄 **State persistence:** Built-in support to persist form progress via `localStorage` or `sessionStorage`.
-   🪟 **Debug mode:** Optional live debug panel via `debug` and `debugPosition`.
-   📝 **TypeScript-first:** Fully typed API for excellent autocomplete and developer experience.
-   📂 **Nested field paths:** Seamlessly handle complex data structures like `profile.firstName` or `address.city`.

## Installation

```bash
npm install @avenra/react-step-form zod
```

`@avenra/react-step-form` expects a schema object that exposes a `safeParse(data)` method and returns Zod-style issues (`path` + `message`). Zod works out of the box.

## ⚡ Build a Multi-Step Form in 5 Minutes

One schema. Two steps. Type-safe fields. Bring your own UI.

```bash
npm install @avenra/react-step-form zod
```

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
            <h2>Account</h2>

            <TypedController
                name="email"
                render={({ field, fieldState }) => (
                    <label>
                        Email
                        <input
                            type="email"
                            {...field}
                            placeholder="you@company.com"
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />

            <TypedController
                name="password"
                render={({ field, fieldState }) => (
                    <label>
                        Password
                        <input
                            type="password"
                            {...field}
                            placeholder="******"
                        />
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
            <h2>Profile</h2>

            <TypedController
                name="firstName"
                render={({ field, fieldState }) => (
                    <label>
                        First Name
                        <input {...field} placeholder="Ada" />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />

            <TypedController
                name="lastName"
                render={({ field, fieldState }) => (
                    <label>
                        Last Name
                        <input {...field} placeholder="Lovelace" />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
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
            onSubmit={(values) => {
                console.log("Signup payload", values);
            }}
        >
            {({ currentStep, isFirstStep, isLastStep, prev, next, submit }) => (
                <main>
                    <currentStep.component />

                    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        <button
                            type="button"
                            onClick={prev}
                            disabled={isFirstStep}
                        >
                            Back
                        </button>
                        {!isLastStep ? (
                            <button type="button" onClick={next}>
                                Continue
                            </button>
                        ) : (
                            <button type="button" onClick={submit}>
                                Create account
                            </button>
                        )}
                    </div>
                </main>
            )}
        </FormWizard>
    );
}
```

How it works:

-   Single schema validates the full payload.
-   `next()` validates only the current step.
-   `Controller` wires any input to wizard state without UI lock-in.
-   `FieldPath` typing keeps field names and values type-safe.

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

-   `field.onBlur()` is also available and marks the field as touched.

### Customizing Layout & Navigation (Optional)

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
    debug?: boolean;
    debugPosition?:
        | "bottom-right"
        | "bottom-left"
        | "top-right"
        | "top-left"
        | "inline";
    children?: (api: FormWizardRenderApi<TValues>) => React.ReactNode;
}
```

`children` is optional and enables fully custom layouts/navigation. If not provided, the wizard renders the current step with default `Previous/Next/Submit` buttons.
Set `debug` to `true` to render a live debug panel with current step, values, errors, and resolved step fields.
Use `debugPosition` to place the panel (`"bottom-right"` by default).

### `Controller`

```ts
interface ControllerProps<TValue = unknown> {
    name: FieldPath<TValues>;
    render: (args: {
        field: {
            value: TValue;
            onChange: (next: ControllerChangeArg<TValue>) => void;
            onBlur: () => void;
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
    dirtyFields: Record<string, boolean>;
    touchedFields: Record<string, boolean>;
    currentStepIndex: number;
    currentStep: { id: string; fields: string[] };
    isFirstStep: boolean;
    isLastStep: boolean;
    isStepValid: boolean;
    watch(): TValues;
    watch<TName extends FieldPath<TValues>>(
        name: TName,
    ): FieldPathValue<TValues, TName> | undefined;
    totalSteps: number;
    canGoNext: boolean;
    canGoPrev: boolean;
    progress: number;
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

Persistence notes:

-   Stored values are hydrated before first render to avoid empty-state overwrite on refresh.
-   Storage is only updated when serialized form values actually change.

## Debug Mode

Enable a real-time debug panel while developing forms:

```tsx
<FormWizard
    schema={schema}
    steps={steps}
    onSubmit={handleSubmit}
    debug
    debugPosition="bottom-right"
/>
```

Debug panel includes:

-   current step ID and index
-   resolved step fields (manual or inferred)
-   current values and errors (JSON)
-   step validation state

Available `debugPosition` values:

-   `"bottom-right"` (default)
-   `"bottom-left"`
-   `"top-right"`
-   `"top-left"`
-   `"inline"`

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
