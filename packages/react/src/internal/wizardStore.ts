import { getIn, mergeErrors, setIn } from "./utils";
import type {
    ValidationResult,
    WizardSnapshot,
    WizardState,
    WizardStep,
    WizardStoreOptions,
    WizardSubscriber,
    WizardValues,
} from "./types";

export class WizardStore<TValues extends WizardValues> {
    private readonly steps: WizardStep[];
    private readonly schemaAdapter: WizardStoreOptions<TValues>["schemaAdapter"];
    private readonly subscribers = new Set<WizardSubscriber<TValues>>();

    private state: WizardState<TValues>;
    private cachedSnapshot: WizardSnapshot<TValues> | null = null;

    constructor(options: WizardStoreOptions<TValues>) {
        if (options.steps.length === 0) {
            throw new Error("Wizard requires at least one step.");
        }

        this.steps = options.steps;
        this.schemaAdapter = options.schemaAdapter;
        this.state = {
            values: (options.defaultValues ?? {}) as TValues,
            errors: {},
            currentStepIndex: 0,
        };
        this.cachedSnapshot = this.buildSnapshot();
    }

    subscribe(subscriber: WizardSubscriber<TValues>): () => void {
        this.subscribers.add(subscriber);

        return () => {
            this.subscribers.delete(subscriber);
        };
    }

    private buildSnapshot(): WizardSnapshot<TValues> {
        const currentStep = this.steps[this.state.currentStepIndex];

        return {
            ...this.state,
            currentStep,
            isFirstStep: this.state.currentStepIndex === 0,
            isLastStep: this.state.currentStepIndex === this.steps.length - 1,
        };
    }

    getSnapshot(): WizardSnapshot<TValues> {
        return this.cachedSnapshot!;
    }

    setValues(values: TValues): void {
        this.state.values = values;
        this.emit();
    }

    getValues(): TValues {
        return this.state.values;
    }

    getValue<TValue = unknown>(path: string): TValue | undefined {
        return getIn<TValue>(this.state.values, path);
    }

    setValue(path: string, value: unknown): void {
        this.state.values = setIn(this.state.values, path, value);

        if (this.state.errors[path]) {
            const nextErrors = { ...this.state.errors };
            delete nextErrors[path];
            this.state.errors = nextErrors;
        }

        this.emit();
    }

    reset(nextValues?: Partial<TValues>): void {
        this.state = {
            values: (nextValues ?? {}) as TValues,
            errors: {},
            currentStepIndex: 0,
        };
        this.emit();
    }

    prev(): boolean {
        if (this.state.currentStepIndex === 0) {
            return false;
        }

        this.state.currentStepIndex -= 1;
        this.emit();
        return true;
    }

    goTo(stepId: string): boolean {
        const stepIndex = this.steps.findIndex((step) => step.id === stepId);
        if (stepIndex === -1) {
            return false;
        }

        this.state.currentStepIndex = stepIndex;
        this.emit();
        return true;
    }

    validateCurrentStep(): ValidationResult {
        const fields = this.steps[this.state.currentStepIndex].fields;
        const result = this.schemaAdapter.validateFields(
            this.state.values,
            fields,
        );

        this.state.errors = mergeErrors(
            this.state.errors,
            this.mapStepFieldErrors(fields, result.errors),
        );
        this.emit();

        return result;
    }

    validateAll(): ValidationResult {
        const result = this.schemaAdapter.validateAll(this.state.values);
        this.state.errors = result.errors;
        this.emit();
        return result;
    }

    next(): boolean {
        const validation = this.validateCurrentStep();
        if (!validation.valid) {
            return false;
        }

        if (this.state.currentStepIndex >= this.steps.length - 1) {
            return false;
        }

        this.state.currentStepIndex += 1;
        this.emit();
        return true;
    }

    clearErrors(paths?: string[]): void {
        if (!paths || paths.length === 0) {
            this.state.errors = {};
            this.emit();
            return;
        }

        const nextErrors = { ...this.state.errors };
        for (const path of paths) {
            delete nextErrors[path];
        }
        this.state.errors = nextErrors;
        this.emit();
    }

    private mapStepFieldErrors(
        fields: string[],
        errors: Record<string, string>,
    ): Record<string, string> {
        const nextErrors: Record<string, string> = {};

        for (const field of fields) {
            if (errors[field]) {
                nextErrors[field] = errors[field];
            }

            for (const [key, message] of Object.entries(errors)) {
                if (key.startsWith(`${field}.`)) {
                    nextErrors[key] = message;
                }
            }
        }

        return nextErrors;
    }

    private emit(): void {
        this.cachedSnapshot = this.buildSnapshot();
        const snapshot = this.getSnapshot();
        for (const subscriber of this.subscribers) {
            subscriber(snapshot);
        }
    }
}
