import { useEffect, useMemo, useRef, type ReactElement } from "react";
import {
    WizardStore,
    createZodAdapter,
    type WizardStep,
    type WizardValues,
} from "./internal";
import { WizardProvider, useWizardSnapshot, useWizardStore } from "./context";
import type { FormStep, FormWizardProps, FormWizardRenderApi } from "./types";

function toCoreSteps<TValues extends WizardValues>(
    steps: FormStep<TValues>[],
): WizardStep[] {
    return steps.map((step) => ({
        id: step.id,
        fields: step.fields,
    }));
}

function storageFromMode(
    mode: FormWizardProps<WizardValues>["persist"],
): Storage | null {
    if (typeof window === "undefined" || !mode) {
        return null;
    }

    if (mode === "sessionStorage") {
        return window.sessionStorage;
    }

    return window.localStorage;
}

function InternalFormWizard<TValues extends WizardValues>({
    steps,
    onSubmit,
    children,
    storage,
    persistKey,
}: Omit<FormWizardProps<TValues>, "schema" | "defaultValues" | "persist"> & {
    storage: Storage | null;
}): ReactElement {
    const store = useWizardStore<TValues>();
    const snapshot = useWizardSnapshot<TValues>();
    const currentStep = steps[snapshot.currentStepIndex];
    const StepComponent = currentStep.component;

    useEffect(() => {
        if (!storage) {
            return;
        }

        storage.setItem(
            persistKey ?? "react-step-form",
            JSON.stringify(snapshot.values),
        );
    }, [snapshot.values, storage, persistKey]);

    const api = useMemo<FormWizardRenderApi<TValues>>(
        () => ({
            ...snapshot,
            next: () => store.next(),
            prev: () => store.prev(),
            goTo: (stepId) => store.goTo(stepId),
            validateStep: () => store.validateCurrentStep().valid,
            submit: () => {
                const result = store.validateAll();
                if (!result.valid) {
                    return false;
                }

                void onSubmit(store.getValues());
                return true;
            },
        }),
        [snapshot, store, onSubmit],
    );

    if (children) {
        return <>{children(api)}</>;
    }

    return (
        <div>
            <StepComponent />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                    type="button"
                    onClick={api.prev}
                    disabled={api.isFirstStep}
                >
                    Previous
                </button>
                {!api.isLastStep ? (
                    <button type="button" onClick={api.next}>
                        Next
                    </button>
                ) : (
                    <button type="button" onClick={api.submit}>
                        Submit
                    </button>
                )}
            </div>
        </div>
    );
}

export function FormWizard<TValues extends WizardValues>(
    props: FormWizardProps<TValues>,
): ReactElement {
    const storeRef = useRef<WizardStore<TValues> | null>(null);

    if (!storeRef.current) {
        storeRef.current = new WizardStore<TValues>({
            steps: toCoreSteps(props.steps),
            schemaAdapter: createZodAdapter(props.schema),
            defaultValues: props.defaultValues,
        });
    }

    const storage = storageFromMode(props.persist);

    useEffect(() => {
        if (!storage) {
            return;
        }

        const raw = storage.getItem(props.persistKey ?? "react-step-form");
        if (!raw) {
            return;
        }

        try {
            const parsed = JSON.parse(raw) as TValues;
            storeRef.current?.setValues(parsed);
        } catch {
            storage.removeItem(props.persistKey ?? "react-step-form");
        }
    }, [storage, props.persistKey]);

    return (
        <WizardProvider store={storeRef.current}>
            <InternalFormWizard
                steps={props.steps}
                onSubmit={props.onSubmit}
                children={props.children}
                persistKey={props.persistKey}
                storage={storage}
            />
        </WizardProvider>
    );
}
