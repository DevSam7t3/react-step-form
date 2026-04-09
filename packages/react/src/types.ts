import type { ReactNode, ComponentType } from "react";
import type { WizardSnapshot, WizardValues } from "./internal";

export interface FormStep<TValues extends WizardValues = WizardValues> {
    id: string;
    component: ComponentType;
    fields: string[];
    meta?: Record<string, unknown>;
    _values?: TValues;
}

export interface FormWizardRenderApi<TValues extends WizardValues>
    extends WizardSnapshot<TValues> {
    next: () => boolean;
    prev: () => boolean;
    goTo: (stepId: string) => boolean;
    validateStep: () => boolean;
    submit: () => boolean;
}

export interface FormWizardProps<TValues extends WizardValues> {
    steps: FormStep<TValues>[];
    schema: {
        safeParse: (data: unknown) =>
            | { success: true; data: TValues }
            | {
                  success: false;
                  error: {
                      issues: Array<{
                          path: (string | number)[];
                          message: string;
                      }>;
                  };
              };
    };
    defaultValues?: Partial<TValues>;
    onSubmit: (values: TValues) => void | Promise<void>;
    persist?: boolean | "localStorage" | "sessionStorage";
    persistKey?: string;
    children?: (api: FormWizardRenderApi<TValues>) => ReactNode;
}

export interface FieldState {
    error?: string;
    invalid: boolean;
}

export interface ControllerRenderProps<TValue = unknown> {
    field: {
        value: TValue;
        onChange: (next: TValue) => void;
        name: string;
    };
    fieldState: FieldState;
}

export interface ControllerProps<TValue = unknown> {
    name: string;
    render: (args: ControllerRenderProps<TValue>) => ReactNode;
}
