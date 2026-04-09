export type WizardValues = Record<string, unknown>;

export interface WizardStep {
    id: string;
    fields: string[];
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
