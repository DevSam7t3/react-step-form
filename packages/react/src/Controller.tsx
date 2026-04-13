import { useEffect, useMemo, type ReactElement, type ReactNode } from "react";
import type { WizardValues } from "./internal";
import {
    useWizardFieldRegistry,
    useWizardSnapshot,
    useWizardStore,
} from "./context";
import { extractChangeValue } from "./internal/changeValue";
import type {
    ControllerChangeArg,
    ControllerRenderProps,
    ControllerProps,
} from "./types";

export function Controller<TValues extends WizardValues = WizardValues>({
    name,
    render,
}: ControllerProps<TValues>): ReactElement {
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
            error: snapshot.errors[name as string],
            invalid: Boolean(snapshot.errors[name as string]),
        }),
        [snapshot.errors, name],
    );

    const value = store.getValue(name as string) ?? "";
    const typedRender = render as (
        args: ControllerRenderProps<unknown>,
    ) => ReactNode;

    return (
        <>
            {typedRender({
                field: {
                    value,
                    onChange: (next: ControllerChangeArg<unknown>) =>
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
