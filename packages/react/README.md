# ✨ react-step-form

🚀 Flexible, type-safe multi-step forms for React with schema-driven validation and fully customizable UI.

---

## 📦 Installation

```bash
npm install @avenra/react-step-form zod
```

---

## ⚡ Quick Example

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

---

## 🧠 Type Safety Notes

-   `FormWizard` automatically infers `values` from your `schema` in most cases.
-   `Controller` provides path-safe `name` and strongly typed `field.value` when used like this:

```tsx
const TypedController = Controller<Values>;
```

-   `field.onChange` supports both direct values and event-like objects.

    -   Works seamlessly with `field.onChange("text")`
    -   Also works with `<input {...field} />`

-   `steps[].fields` is optional and ensures type safety for valid form paths.

-   If `fields` is not provided, the wizard automatically infers step fields from mounted `Controller` names within that step.

---

### 🔗 Nested Fields — Out of the Box

Nested paths are fully supported using a single typed controller alias.

```tsx
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

✨ `field.value` is automatically inferred based on the provided `name`, including nested paths.

---

## 🆕 New in This Version

-   🔍 Automatic step field inference from mounted `Controller` names
-   📊 Enhanced form state helpers:

    -   `isStepValid`
    -   `dirtyFields`
    -   `touchedFields`
    -   `watch`

-   🧭 Derived navigation state:

    -   `totalSteps`
    -   `canGoNext`
    -   `canGoPrev`
    -   `progress`

-   💾 Persistence hydration before first render (prevents overwriting on refresh)
-   ⚡ Persistence writes only when values actually change
-   🛠️ Built-in debug panel (`debug`, `debugPosition`) for real-time state inspection

```tsx
<FormWizard
    schema={schema}
    steps={steps}
    onSubmit={handleSubmit}
    debug
    debugPosition="inline"
/>
```

---

## 🧩 API

-   `FormWizard` → Handles context, step validation, and navigation
-   `Controller` → Connects any input to the wizard state
-   `useFormWizard` → Hook for accessing state and controlling navigation

---

### 🪝 `useFormWizard` Extras

-   `isStepValid`: `boolean`
-   `dirtyFields`: `Record<string, boolean>`
-   `touchedFields`: `Record<string, boolean>`
-   `watch(name?)`: Reactively read a specific field or all values
-   `totalSteps`, `canGoNext`, `canGoPrev`, `progress`

---

### 🎛️ `FormWizard` Render API Extras

When using `children`, the render API also includes:

-   `isStepValid`
-   `dirtyFields`
-   `touchedFields`
-   `watch`
-   `totalSteps`
-   `canGoNext`
-   `canGoPrev`
-   `progress`

---

### 🎯 `Controller` Field Extras

`render({ field })` provides:

-   `field.value`
-   `field.onChange(next)`
-   `field.onBlur()`
-   `field.name`

---

📌 For repository documentation, contribution guidelines, and release workflow, refer to the project root.
