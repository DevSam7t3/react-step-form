import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import * as z from "zod";
import { Controller, FormWizard, useFormWizard } from "@avenra/react-step-form";

class ErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ color: "red", padding: "20px" }}>
                    <h1>Something went wrong</h1>
                    <p>Check the browser console for details.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const schema = z.object({
    email: z.string().email("Please provide a valid email."),
    password: z.string().min(6, "Password must contain at least 6 characters."),
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
});

type Values = z.infer<typeof schema>;

function AccountStep() {
    return (
        <div>
            <h2>Account</h2>
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
                            placeholder="you@example.com"
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
                            placeholder="******"
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
        </div>
    );
}

function ProfileStep() {
    return (
        <div>
            <h2>Profile</h2>
            <Controller
                name="firstName"
                render={({ field, fieldState }) => (
                    <label>
                        First Name
                        <input
                            value={String(field.value ?? "")}
                            onChange={(event) =>
                                field.onChange(event.target.value)
                            }
                            placeholder="Samir"
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
            <Controller
                name="lastName"
                render={({ field, fieldState }) => (
                    <label>
                        Last Name
                        <input
                            value={String(field.value ?? "")}
                            onChange={(event) =>
                                field.onChange(event.target.value)
                            }
                            placeholder="Khan"
                        />
                        {fieldState.error ? <p>{fieldState.error}</p> : null}
                    </label>
                )}
            />
        </div>
    );
}

function WizardLayout({ submit }: { submit: () => boolean }) {
    const wizard = useFormWizard<Values>();

    return (
        <section>
            {wizard.currentStep.id === "account" ? (
                <AccountStep />
            ) : (
                <ProfileStep />
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                    type="button"
                    onClick={wizard.prev}
                    disabled={wizard.isFirstStep}
                >
                    Previous
                </button>
                {!wizard.isLastStep ? (
                    <button type="button" onClick={wizard.next}>
                        Next
                    </button>
                ) : (
                    <button type="button" onClick={submit}>
                        Submit
                    </button>
                )}
            </div>

            <pre style={{ marginTop: 16, fontSize: 12 }}>
                {JSON.stringify(wizard.values, null, 2)}
            </pre>
        </section>
    );
}

function App() {
    return (
        <main style={{ margin: "2rem auto", maxWidth: 520 }}>
            <h1>react-step-form</h1>
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
                onSubmit={(values) => {
                    console.log("submitted", values);
                }}
            >
                {({ submit }) => <WizardLayout submit={submit} />}
            </FormWizard>
        </main>
    );
}

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
);
