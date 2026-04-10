# react-step-form

Flexible, type-safe multi-step forms for React with schema-driven validation and fully custom UI.

## Installation

```bash
npm install @avenra/react-step-form zod
```

## Quick Example

```tsx
import { Controller, FormWizard, useFormWizard } from "@avenra/react-step-form";
import * as z from "zod";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
});

type Values = z.infer<typeof schema>;
const TypedController = Controller<Values>;

function AccountStep() {
    return (
        <>
            <TypedController
                name="email"
                render={({ field }) => <input {...field} placeholder="Email" />}
            />
            <TypedController
                name="password"
                render={({ field }) => (
                    <input type="password" {...field} placeholder="Password" />
                )}
            />
        </>
    );
}

function ProfileStep() {
    const wizard = useFormWizard<Values>();

    return (
        <>
            <TypedController
                name="firstName"
                render={({ field }) => (
                    <input {...field} placeholder="First Name" />
                )}
            />
            <TypedController
                name="lastName"
                render={({ field }) => (
                    <input {...field} placeholder="Last Name" />
                )}
            />
            <button type="button" onClick={wizard.prev}>
                Previous
            </button>
        </>
    );
}

export function RegistrationWizard() {
    return (
        <FormWizard
            steps={[
                {
                    id: "account",
                    component: AccountStep,
                },
                {
                    id: "profile",
                    component: ProfileStep,
                },
            ]}
            schema={schema}
            persist="localStorage"
            persistKey="signup-form"
            debug
            debugPosition="bottom-right"
            onSubmit={(values) => {
                console.log(values);
            }}
        />
    );
}
```

## Type Safety Notes

-   `FormWizard` infers `values` from your `schema` in most cases.
-   `Controller` gets path-safe `name` and strongly typed `field.value` when using:

```tsx
const TypedController = Controller<Values>;
```

-   `field.onChange` accepts either direct values or event-like objects.
    -   Works with both `field.onChange("text")` and `<input {...field} />`.
-   `steps[].fields` is optional and type-safe against valid form paths.
-   If `fields` is omitted, the wizard infers step fields from mounted `Controller` names in that step.

## New in This Version

-   Automatic step field inference from mounted `Controller` names.
-   Persistence hydration before first render (prevents refresh overwrite).
-   Persistence writes only when values actually change.
-   Built-in debug panel (`debug`, `debugPosition`) for live state inspection.

```tsx
<FormWizard
    schema={schema}
    steps={steps}
    onSubmit={handleSubmit}
    debug
    debugPosition="inline"
/>
```

## API

-   `FormWizard`: Provides context, step validation, and navigation.
-   `Controller`: Connects arbitrary inputs to wizard state.
-   `useFormWizard`: Hook for reading state and controlling navigation.

For repository docs, contribution, and release flow, see the project root.
