import { useMemo, type ReactElement } from "react";
import { useWizardSnapshot, useWizardStore } from "./context";
import type { ControllerProps } from "./types";

export function Controller<TValue = unknown>({
    name,
    render,
}: ControllerProps<TValue>): ReactElement {
    const store = useWizardStore();
    const snapshot = useWizardSnapshot();

    const fieldState = useMemo(
        () => ({
            error: snapshot.errors[name],
            invalid: Boolean(snapshot.errors[name]),
        }),
        [snapshot.errors, name],
    );

    const value = (store.getValue<TValue>(name) ?? "") as TValue;

    return (
        <>
            {render({
                field: {
                    value,
                    onChange: (next: TValue) => store.setValue(name, next),
                    name,
                },
                fieldState,
            })}
        </>
    );
}
