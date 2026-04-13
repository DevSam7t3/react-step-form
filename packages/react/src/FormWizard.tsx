import { useEffect, useMemo, useRef, type ReactElement } from "react";
import { DebugPanel } from "./DebugPanel";
import {
    WizardStore,
    createFieldRegistry,
    createZodAdapter,
    type WizardStep,
    type WizardValues,
} from "./internal";
import {
    WizardProvider,
    useWizardFieldRegistryVersion,
    useWizardSnapshot,
    useWizardStore,
} from "./context";
import type {
    FieldPath,
    FieldPathValue,
    FormStep,
    FormWizardProps,
    FormWizardRenderApi,
    InferValuesFromSchema,
    SchemaLike,
} from "./types";

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

function loadPersistedValues<TValues extends WizardValues>(
    storage: Storage | null,
    key: string,
): Partial<TValues> | undefined {
    if (!storage) {
        return undefined;
    }

    const raw = storage.getItem(key);
    if (!raw) {
        return undefined;
    }

    try {
        return JSON.parse(raw) as Partial<TValues>;
    } catch {
        storage.removeItem(key);
        return undefined;
    }
}

function InternalFormWizard<TValues extends WizardValues>({
    steps,
    onSubmit,
    children,
    debug,
    debugPosition,
    storage,
    persistKey,
}: Omit<FormWizardProps<TValues>, "schema" | "defaultValues" | "persist"> & {
    storage: Storage | null;
}): ReactElement {
    const store = useWizardStore<TValues>();
    const snapshot = useWizardSnapshot<TValues>();
    const fieldRegistryVersion = useWizardFieldRegistryVersion();
    const totalSteps = store.getTotalSteps();
    const lastPersistedRef = useRef<string | null>(null);
    const currentStep = steps[snapshot.currentStepIndex];
    const StepComponent = currentStep.component;

    useEffect(() => {
        if (!storage) {
            return;
        }

        const key = persistKey ?? "react-step-form";

        if (lastPersistedRef.current === null) {
            lastPersistedRef.current = storage.getItem(key);
        }

        const serializedValues = JSON.stringify(snapshot.values);
        if (lastPersistedRef.current === serializedValues) {
            return;
        }

        storage.setItem(key, serializedValues);
        lastPersistedRef.current = serializedValues;
    }, [snapshot.values, storage, persistKey]);

    const api = useMemo<FormWizardRenderApi<TValues>>(() => {
        const isStepValid = store.getCurrentStepValidation().valid;
        const canGoPrev = !snapshot.isFirstStep;
        const canGoNext = !snapshot.isLastStep && isStepValid;
        const progress = ((snapshot.currentStepIndex + 1) / totalSteps) * 100;

        return {
            ...snapshot,
            isStepValid,
            watch: (<TName extends FieldPath<TValues>>(name?: TName) => {
                if (!name) {
                    return snapshot.values;
                }

                return store.getValue<FieldPathValue<TValues, TName>>(name);
            }) as FormWizardRenderApi<TValues>["watch"],
            totalSteps,
            canGoNext,
            canGoPrev,
            progress,
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
        };
    }, [snapshot, store, onSubmit, totalSteps, fieldRegistryVersion]);

    if (children) {
        return (
            <>
                {children(api)}
                {debug ? <DebugPanel position={debugPosition} /> : null}
            </>
        );
    }

    return (
        <>
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
            {debug ? <DebugPanel position={debugPosition} /> : null}
        </>
    );
}

export function FormWizard<TValues extends WizardValues>(
    props: FormWizardProps<TValues>,
): ReactElement;
export function FormWizard<TSchema extends SchemaLike<WizardValues>>(
    props: FormWizardProps<InferValuesFromSchema<TSchema>>,
): ReactElement;
export function FormWizard<TValues extends WizardValues>(
    props: FormWizardProps<TValues>,
): ReactElement {
    const storage = storageFromMode(props.persist);
    const persistStorageKey = props.persistKey ?? "react-step-form";
    const storeRef = useRef<WizardStore<TValues> | null>(null);
    const fieldRegistryRef = useRef(createFieldRegistry());

    if (!storeRef.current) {
        const persistedValues = loadPersistedValues<TValues>(
            storage,
            persistStorageKey,
        );

        const initialValues = persistedValues
            ? ({
                  ...props.defaultValues,
                  ...persistedValues,
              } as Partial<TValues>)
            : props.defaultValues;

        storeRef.current = new WizardStore<TValues>({
            steps: toCoreSteps(props.steps),
            schemaAdapter: createZodAdapter(props.schema),
            defaultValues: initialValues,
            getFieldsForStep: (stepId) =>
                fieldRegistryRef.current.getFieldsForStep(stepId),
        });
    }

    return (
        <WizardProvider
            store={storeRef.current}
            fieldRegistry={fieldRegistryRef.current}
        >
            <InternalFormWizard
                steps={props.steps}
                onSubmit={props.onSubmit}
                children={props.children}
                debug={props.debug}
                debugPosition={props.debugPosition}
                persistKey={props.persistKey}
                storage={storage}
            />
        </WizardProvider>
    );
}
