export type WizardValues = Record<string, unknown>;

export interface FieldRegistry {
    registerField(name: string, stepId: string): void;
    unregisterField(name: string, stepId: string): void;
    getFieldsForStep(stepId: string): string[];
    subscribe(listener: () => void): () => void;
    getVersion(): number;
}

export interface WizardStep {
    id: string;
    fields?: string[];
}

export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

export interface SchemaAdapter<TValues extends WizardValues> {
    validateAll(values: TValues): ValidationResult;
    validateFields(values: TValues, fields: string[]): ValidationResult;
}

export interface WizardStoreOptions<TValues extends WizardValues> {
    steps: WizardStep[];
    schemaAdapter: SchemaAdapter<TValues>;
    defaultValues?: Partial<TValues>;
    getFieldsForStep?: (stepId: string) => string[];
}

export interface WizardState<TValues extends WizardValues> {
    values: TValues;
    errors: Record<string, string>;
    currentStepIndex: number;
}

export interface WizardSnapshot<TValues extends WizardValues>
    extends WizardState<TValues> {
    currentStep: WizardStep;
    isFirstStep: boolean;
    isLastStep: boolean;
}

export type WizardSubscriber<TValues extends WizardValues> = (
    state: WizardSnapshot<TValues>,
) => void;
