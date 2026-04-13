import type { ReactNode, ComponentType } from "react";
import type { WizardSnapshot, WizardValues } from "./internal";

type Primitive =
    | string
    | number
    | boolean
    | bigint
    | symbol
    | null
    | undefined
    | Date;

type StringKeyOf<T> = Extract<keyof T, string>;

type IsLeaf<T> = T extends
    | Primitive
    | ((...args: never[]) => unknown)
    | readonly unknown[]
    ? true
    : false;

export type FieldPath<T> = T extends object
    ? {
          [K in StringKeyOf<T>]: IsLeaf<NonNullable<T[K]>> extends true
              ? K
              : K | `${K}.${FieldPath<NonNullable<T[K]>>}`;
      }[StringKeyOf<T>]
    : never;

export type FieldPathValue<
    T,
    TPath extends string,
> = TPath extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
        ? FieldPathValue<NonNullable<T[Head]>, Tail>
        : never
    : TPath extends keyof T
    ? T[TPath]
    : never;

export interface SchemaLike<TValues extends WizardValues> {
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
}

export type InferValuesFromSchema<TSchema> = TSchema extends SchemaLike<
    infer TValues
>
    ? TValues
    : never;

export interface FormStep<TValues extends WizardValues = WizardValues> {
    id: string;
    component: ComponentType;
    fields?: FieldPath<TValues>[];
    meta?: Record<string, unknown>;
    _values?: TValues;
}

export interface FormWizardRenderApi<TValues extends WizardValues>
    extends WizardSnapshot<TValues> {
    isStepValid: boolean;
    watch: {
        (): TValues;
        <TName extends FieldPath<TValues>>(name: TName):
            | FieldPathValue<TValues, TName>
            | undefined;
    };
    totalSteps: number;
    canGoNext: boolean;
    canGoPrev: boolean;
    progress: number;
    next: () => boolean;
    prev: () => boolean;
    goTo: (stepId: string) => boolean;
    validateStep: () => boolean;
    submit: () => boolean;
}

export type DebugPanelPosition =
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left"
    | "inline";

export interface FormWizardProps<
    TValues extends WizardValues,
    TSchema extends SchemaLike<TValues> = SchemaLike<TValues>,
> {
    steps: FormStep<TValues>[];
    schema: TSchema;
    defaultValues?: Partial<TValues>;
    onSubmit: (values: TValues) => void | Promise<void>;
    persist?: boolean | "localStorage" | "sessionStorage";
    persistKey?: string;
    debug?: boolean;
    debugPosition?: DebugPanelPosition;
    children?: (api: FormWizardRenderApi<TValues>) => ReactNode;
}

export interface FieldState {
    error?: string;
    invalid: boolean;
}

export interface ControllerChangeTarget<TValue> {
    value?: TValue;
    checked?: boolean;
    type?: string;
    valueAsNumber?: number;
    multiple?: boolean;
    selectedOptions?: ArrayLike<{ value: string }>;
}

export interface ControllerChangeEventLike<TValue> {
    target: ControllerChangeTarget<TValue>;
}

export type ControllerChangeArg<TValue> =
    | TValue
    | ControllerChangeEventLike<TValue>;

export interface ControllerRenderProps<TValue = unknown> {
    field: {
        value: TValue;
        onChange: (next: ControllerChangeArg<TValue>) => void;
        onBlur: () => void;
        name: string;
    };
    fieldState: FieldState;
}

type ControllerPropsForName<
    TValues extends WizardValues,
    TName extends FieldPath<TValues>,
> = {
    name: TName;
    render: (
        args: ControllerRenderProps<FieldPathValue<TValues, TName>>,
    ) => ReactNode;
};

export type ControllerProps<
    TValues extends WizardValues = WizardValues,
    TName extends FieldPath<TValues> = FieldPath<TValues>,
> = [TName] extends [FieldPath<TValues>]
    ? {
          [TPath in FieldPath<TValues>]: ControllerPropsForName<TValues, TPath>;
      }[FieldPath<TValues>]
    : ControllerPropsForName<TValues, TName>;
