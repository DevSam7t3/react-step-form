import { getIn, mergeErrors, setIn } from "./utils";
import type {
    SetValueOptions,
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
    private readonly getFieldsForStep?: WizardStoreOptions<TValues>["getFieldsForStep"];
    private readonly subscribers = new Set<WizardSubscriber<TValues>>();
    private defaultValues: TValues;

    private state: WizardState<TValues>;
    private cachedSnapshot: WizardSnapshot<TValues> | null = null;
    private cachedStepValidation: {
        stepIndex: number;
        valuesRef: TValues;
        fieldsKey: string;
        result: ValidationResult;
    } | null = null;

    constructor(options: WizardStoreOptions<TValues>) {
        if (options.steps.length === 0) {
            throw new Error("Wizard requires at least one step.");
        }

        this.steps = options.steps;
        this.schemaAdapter = options.schemaAdapter;
        this.getFieldsForStep = options.getFieldsForStep;
        this.defaultValues = (options.defaultValues ?? {}) as TValues;
        this.state = {
            values: this.defaultValues,
            errors: {},
            dirtyFields: {},
            touchedFields: {},
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

    getTotalSteps(): number {
        return this.steps.length;
    }

    getValues(): TValues {
        return this.state.values;
    }

    getValue<TValue = unknown>(path: string): TValue | undefined {
        return getIn<TValue>(this.state.values, path);
    }

    setValue(path: string, value: unknown, options?: SetValueOptions): void {
        const previousValue = this.getValue(path);
        if (Object.is(previousValue, value)) {
            if (options?.markTouched && !this.state.touchedFields[path]) {
                this.state.touchedFields = {
                    ...this.state.touchedFields,
                    [path]: true,
                };
                this.emit();
            }
            return;
        }

        this.state.values = setIn(this.state.values, path, value);

        const defaultValue = getIn(this.defaultValues, path);
        const isDirty = !Object.is(value, defaultValue);
        if (isDirty) {
            this.state.dirtyFields = {
                ...this.state.dirtyFields,
                [path]: true,
            };
        } else if (this.state.dirtyFields[path]) {
            const nextDirtyFields = { ...this.state.dirtyFields };
            delete nextDirtyFields[path];
            this.state.dirtyFields = nextDirtyFields;
        }

        if (options?.markTouched && !this.state.touchedFields[path]) {
            this.state.touchedFields = {
                ...this.state.touchedFields,
                [path]: true,
            };
        }

        if (this.state.errors[path]) {
            const nextErrors = { ...this.state.errors };
            delete nextErrors[path];
            this.state.errors = nextErrors;
        }

        this.emit();
    }

    reset(nextValues?: Partial<TValues>): void {
        this.defaultValues = (nextValues ?? {}) as TValues;
        this.state = {
            values: this.defaultValues,
            errors: {},
            dirtyFields: {},
            touchedFields: {},
            currentStepIndex: 0,
        };
        this.emit();
    }

    markTouched(path: string): void {
        if (this.state.touchedFields[path]) {
            return;
        }

        this.state.touchedFields = {
            ...this.state.touchedFields,
            [path]: true,
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
        this.cachedStepValidation = null;
        const currentStep = this.steps[this.state.currentStepIndex];
        const fields = this.resolveStepFields(currentStep);
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

    getCurrentStepValidation(): ValidationResult {
        const currentStep = this.steps[this.state.currentStepIndex];
        const fields = this.resolveStepFields(currentStep);
        const fieldsKey = fields.join("|");

        if (
            this.cachedStepValidation &&
            this.cachedStepValidation.stepIndex ===
                this.state.currentStepIndex &&
            this.cachedStepValidation.valuesRef === this.state.values &&
            this.cachedStepValidation.fieldsKey === fieldsKey
        ) {
            return this.cachedStepValidation.result;
        }

        const result = this.schemaAdapter.validateFields(
            this.state.values,
            fields,
        );
        this.cachedStepValidation = {
            stepIndex: this.state.currentStepIndex,
            valuesRef: this.state.values,
            fieldsKey,
            result,
        };

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

    private resolveStepFields(step: WizardStep): string[] {
        if (step.fields) {
            return step.fields;
        }

        return this.getFieldsForStep?.(step.id) ?? [];
    }

    private emit(): void {
        this.cachedStepValidation = null;
        this.cachedSnapshot = this.buildSnapshot();
        const snapshot = this.getSnapshot();
        for (const subscriber of this.subscribers) {
            subscriber(snapshot);
        }
    }
}
