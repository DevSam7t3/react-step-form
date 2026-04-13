import {
    Component,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import * as z from "zod";
import {
    Controller,
    FormWizard,
    useFormWizard,
    type FormWizardRenderApi,
} from "@avenra/react-step-form";
import "./styles.css";

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
    account: z.object({
        email: z.string().email("Please provide a valid email."),
        password: z
            .string()
            .min(6, "Password must contain at least 6 characters.")
            .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
                message:
                    "Password must contain at least one special character.",
            }),
    }),
    profile: z.object({
        firstName: z.string().min(1, "First name is required."),
        lastName: z.string().min(1, "Last name is required."),
    }),
});

type Values = z.infer<typeof schema>;
const TypedController = Controller<Values>;
const defaultValues: Values = {
    account: {
        email: "",
        password: "",
    },
    profile: {
        firstName: "",
        lastName: "",
    },
};

type LogEntry = {
    id: number;
    message: string;
};

function AccountStep() {
    return (
        <div className="panel">
            <h2 className="step-title">Account</h2>
            <div className="field-grid">
                <TypedController
                    name="account.email"
                    render={({ field, fieldState }) => (
                        <label className="field">
                            Email
                            <input
                                className="field-input"
                                {...field}
                                style={{
                                    borderColor: fieldState.invalid
                                        ? "red"
                                        : undefined,
                                }}
                                placeholder="you@example.com"
                            />
                            {fieldState.error ? (
                                <p className="field-error">
                                    {fieldState.error}
                                </p>
                            ) : null}
                        </label>
                    )}
                />
                <TypedController
                    name="account.password"
                    render={({ field, fieldState }) => (
                        <label className="field">
                            Password
                            <input
                                type="password"
                                className="field-input"
                                placeholder="******"
                                {...field}
                                style={{
                                    borderColor: fieldState.invalid
                                        ? "red"
                                        : undefined,
                                }}
                            />
                            {fieldState.error ? (
                                <p className="field-error">
                                    {fieldState.error}
                                </p>
                            ) : null}
                        </label>
                    )}
                />
            </div>
        </div>
    );
}

function ProfileStep() {
    return (
        <div className="panel">
            <h2 className="step-title">Profile</h2>
            <div className="field-grid">
                <TypedController
                    name="profile.firstName"
                    render={({ field, fieldState }) => (
                        <label className="field">
                            First Name
                            <input
                                className="field-input"
                                {...field}
                                style={{
                                    borderColor: fieldState.invalid
                                        ? "red"
                                        : undefined,
                                }}
                                placeholder="Samir"
                            />
                            {fieldState.error ? (
                                <p className="field-error">
                                    {fieldState.error}
                                </p>
                            ) : null}
                        </label>
                    )}
                />
                <TypedController
                    name="profile.lastName"
                    render={({ field, fieldState }) => (
                        <label className="field">
                            Last Name
                            <input
                                className="field-input"
                                {...field}
                                style={{
                                    borderColor: fieldState.invalid
                                        ? "red"
                                        : undefined,
                                }}
                                placeholder="Khan"
                            />
                            {fieldState.error ? (
                                <p className="field-error">
                                    {fieldState.error}
                                </p>
                            ) : null}
                        </label>
                    )}
                />
            </div>
        </div>
    );
}

function WizardLayout({
    api,
    logs,
    onLog,
}: {
    api: FormWizardRenderApi<Values>;
    logs: LogEntry[];
    onLog: (message: string) => void;
}) {
    const wizard = useFormWizard<Values>();
    const watchedAll = wizard.watch();
    const watchedEmail = wizard.watch("account.email") ?? "";
    const currentPassword = wizard.getValue("account.password") ?? "";

    useEffect(() => {
        onLog(
            `step changed -> ${wizard.currentStep.id} (${
                wizard.currentStepIndex + 1
            }/${wizard.totalSteps})`,
        );
    }, [
        wizard.currentStep.id,
        wizard.currentStepIndex,
        wizard.totalSteps,
        onLog,
    ]);

    useEffect(() => {
        onLog(`isStepValid -> ${wizard.isStepValid}`);
    }, [wizard.isStepValid, onLog]);

    const handleNext = () => {
        const moved = wizard.next();
        onLog(`next() -> ${moved}`);
    };

    const handlePrev = () => {
        const moved = wizard.prev();
        onLog(`prev() -> ${moved}`);
    };

    const handleSubmit = () => {
        const submitted = api.submit();
        onLog(`submit() -> ${submitted}`);
    };

    const handleValidateStep = () => {
        const result = wizard.validateStep();
        onLog(
            `validateStep() -> ${result.valid} (errors: ${
                Object.keys(result.errors).length
            })`,
        );
    };

    const handleValidateAll = () => {
        const result = wizard.validateAll();
        onLog(
            `validateAll() -> ${result.valid} (errors: ${
                Object.keys(result.errors).length
            })`,
        );
    };

    const handleAutofill = () => {
        wizard.setValue("account.email", "demo@example.com");
        wizard.setValue("account.password", "secret123");
        wizard.setValue("profile.firstName", "Samir");
        wizard.setValue("profile.lastName", "Khan");
        onLog("setValue() -> autofilled all fields");
    };

    const handleReset = () => {
        wizard.reset(defaultValues);
        onLog("reset(defaultValues)");
    };

    const handleGoToAccount = () => {
        const moved = wizard.goTo("account");
        onLog(`goTo('account') -> ${moved}`);
    };

    const handleGoToProfile = () => {
        const moved = wizard.goTo("profile");
        onLog(`goTo('profile') -> ${moved}`);
    };

    const handleClearErrors = () => {
        wizard.clearErrors();
        onLog("clearErrors()");
    };

    const handleClearAccountErrors = () => {
        wizard.clearErrors(["account.email", "account.password"]);
        onLog("clearErrors(['account.email', 'account.password'])");
    };

    const handleRenderApiValidateStep = () => {
        const valid = api.validateStep();
        onLog(`renderApi.validateStep() -> ${valid}`);
    };

    const StepComponent =
        wizard.currentStep.id === "account" ? AccountStep : ProfileStep;

    return (
        <section>
            <h2 className="step-title">Live Wizard Playground</h2>
            <p className="app-subtitle">
                Uses all major APIs with UI state + logs. Open console for extra
                events.
            </p>

            <div className="panel panel-muted top-stats">
                <div className="stat-line">
                    Step: <strong>{wizard.currentStep.id}</strong> (
                    {wizard.currentStepIndex + 1}/{wizard.totalSteps})
                </div>
                <div className="progress-wrap">
                    <div className="stat-line">
                        Progress:{" "}
                        <strong>{Math.round(wizard.progress)}%</strong>
                    </div>
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${wizard.progress}%` }}
                        />
                    </div>
                </div>
                <div className="chip-row">
                    <span
                        className={`chip ${wizard.canGoPrev ? "ok" : "warn"}`}
                    >
                        canGoPrev: {String(wizard.canGoPrev)}
                    </span>
                    <span
                        className={`chip ${wizard.canGoNext ? "ok" : "warn"}`}
                    >
                        canGoNext: {String(wizard.canGoNext)}
                    </span>
                    <span
                        className={`chip ${wizard.isStepValid ? "ok" : "warn"}`}
                    >
                        isStepValid: {String(wizard.isStepValid)}
                    </span>
                </div>
                <div className="stat-line">
                    watched email: <strong>{watchedEmail || "(empty)"}</strong>{" "}
                    | password length: <strong>{currentPassword.length}</strong>
                </div>
            </div>

            <StepComponent />

            <div className="button-row">
                <button
                    type="button"
                    className="btn"
                    onClick={handlePrev}
                    disabled={!wizard.canGoPrev}
                >
                    Previous
                </button>
                {!wizard.isLastStep ? (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                        // disabled={!wizard.canGoNext}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                )}
                <button
                    className="btn"
                    type="button"
                    onClick={handleGoToAccount}
                >
                    Go to Account
                </button>
                <button
                    className="btn"
                    type="button"
                    onClick={handleGoToProfile}
                >
                    Go to Profile
                </button>
            </div>

            <div className="button-row">
                <button
                    className="btn"
                    type="button"
                    onClick={handleValidateStep}
                >
                    validateStep()
                </button>
                <button
                    className="btn"
                    type="button"
                    onClick={handleRenderApiValidateStep}
                >
                    renderApi.validateStep()
                </button>
                <button
                    className="btn"
                    type="button"
                    onClick={handleValidateAll}
                >
                    validateAll()
                </button>
                <button
                    className="btn"
                    type="button"
                    onClick={handleClearErrors}
                >
                    clearErrors()
                </button>
                <button
                    className="btn"
                    type="button"
                    onClick={handleClearAccountErrors}
                >
                    clear account errors
                </button>
                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleAutofill}
                >
                    autofill via setValue()
                </button>
                <button
                    className="btn btn-warn"
                    type="button"
                    onClick={handleReset}
                >
                    reset()
                </button>
            </div>

            <h3 className="step-title" style={{ marginTop: 16 }}>
                State (watch + maps)
            </h3>
            <pre className="code-box">
                {JSON.stringify(
                    {
                        watch: watchedAll,
                        values: wizard.values,
                        errors: wizard.errors,
                        dirtyFields: wizard.dirtyFields,
                        touchedFields: wizard.touchedFields,
                        // also show render-prop API values to demonstrate parity
                        renderApi: {
                            progress: api.progress,
                            totalSteps: api.totalSteps,
                            canGoNext: api.canGoNext,
                            canGoPrev: api.canGoPrev,
                            isStepValid: api.isStepValid,
                        },
                    },
                    null,
                    2,
                )}
            </pre>

            <h3 className="step-title" style={{ marginTop: 16 }}>
                Event Log
            </h3>
            <div className="log-box">
                {logs.length === 0 ? (
                    <div className="muted">No events yet.</div>
                ) : (
                    logs.map((log) => (
                        <div className="log-line" key={log.id}>
                            {log.message}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

function App() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const onLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const formatted = `[${timestamp}] ${message}`;
        console.log("[example]", message);

        setLogs((current) => {
            const next = [
                { id: Date.now() + Math.random(), message: formatted },
                ...current,
            ];
            return next.slice(0, 40);
        });
    }, []);

    return (
        <main className="app-shell">
            <h1 className="app-title">react-step-form</h1>
            <p className="app-subtitle">
                Demonstrates all available options: persistence, debug panel,
                dirty/touched tracking, watch, step validity, helpers, and
                action logging.
            </p>
            <FormWizard<Values>
                debug
                debugPosition="bottom-right"
                persist="localStorage"
                persistKey="react-step-form-demo"
                steps={[
                    {
                        id: "account",
                        component: AccountStep,
                        fields: ["account.email", "account.password"],
                        meta: { title: "Account" },
                    },
                    {
                        id: "profile",
                        component: ProfileStep,
                        // fields intentionally omitted to demonstrate inference
                        meta: { title: "Profile" },
                    },
                ]}
                schema={schema}
                defaultValues={defaultValues}
                onSubmit={(values) => {
                    onLog(`onSubmit -> ${JSON.stringify(values)}`);
                }}
            >
                {(api) => <WizardLayout api={api} logs={logs} onLog={onLog} />}
            </FormWizard>
        </main>
    );
}

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
);
