import { useEffect, useMemo, type ReactElement } from "react";
import type { WizardValues } from "./internal";
import {
    useWizardFieldRegistry,
    useWizardSnapshot,
    useWizardStore,
} from "./context";
import { extractChangeValue } from "./internal/changeValue";
import type {
    ControllerChangeArg,
    ControllerProps,
    FieldPath,
    FieldPathValue,
} from "./types";

export function Controller<
    TValues extends WizardValues = WizardValues,
    TName extends FieldPath<TValues> = FieldPath<TValues>,
>({ name, render }: ControllerProps<TValues, TName>): ReactElement {
    const store = useWizardStore<TValues>();
    const snapshot = useWizardSnapshot<TValues>();
    const { registerField, unregisterField, getCurrentStepId } =
        useWizardFieldRegistry();
    const currentStepId = getCurrentStepId();

    useEffect(() => {
        registerField(name, currentStepId);

        return () => {
            unregisterField(name, currentStepId);
        };
    }, [name, currentStepId, registerField, unregisterField]);

    const fieldState = useMemo(
        () => ({
            error: snapshot.errors[name],
            invalid: Boolean(snapshot.errors[name]),
        }),
        [snapshot.errors, name],
    );

    const value = (store.getValue<FieldPathValue<TValues, TName>>(name) ??
        "") as FieldPathValue<TValues, TName>;

    return (
        <>
            {render({
                field: {
                    value,
                    onChange: (
                        next: ControllerChangeArg<
                            FieldPathValue<TValues, TName>
                        >,
                    ) =>
                        store.setValue(name, extractChangeValue(next), {
                            markTouched: true,
                        }),
                    onBlur: () => store.markTouched(name),
                    name,
                },
                fieldState,
            })}
        </>
    );
}
