# react-step-form

Flexible, type-safe multi-step forms for React with schema-driven validation and fully custom UI.

## Installation

```bash
npm install react-step-form zod
```

## Quick Example

```tsx
import { Controller, FormWizard, useFormWizard } from "react-step-form";
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
                render={({ field }) => (
                    <input
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="Email"
                    />
                )}
            />
            <Controller
                name="password"
                render={({ field }) => (
                    <input
                        type="password"
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="Password"
                    />
                )}
            />
        </>
    );
}

function ProfileStep() {
    const wizard = useFormWizard<Values>();

    return (
        <>
            <Controller
                name="firstName"
                render={({ field }) => (
                    <input
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="First Name"
                    />
                )}
            />
            <Controller
                name="lastName"
                render={({ field }) => (
                    <input
                        value={String(field.value ?? "")}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="Last Name"
                    />
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
            onSubmit={(values) => {
                console.log(values);
            }}
        />
    );
}
```

## API

-   `FormWizard`: Provides context, step validation, and navigation.
-   `Controller`: Connects arbitrary inputs to wizard state.
-   `useFormWizard`: Hook for reading state and controlling navigation.

For repository docs, contribution, and release flow, see the project root.
