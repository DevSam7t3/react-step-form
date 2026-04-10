import type { WizardValues } from "./internal";
import type { FieldPath, FieldPathValue } from "./types";
import { useWizardSnapshot, useWizardStore } from "./context";

export function useFormWizard<TValues extends WizardValues = WizardValues>() {
    const store = useWizardStore<TValues>();
    const snapshot = useWizardSnapshot<TValues>();

    return {
        ...snapshot,
        setValue: <TName extends FieldPath<TValues>>(
            name: TName,
            value: FieldPathValue<TValues, TName>,
        ) => store.setValue(name, value),
        getValue: <TName extends FieldPath<TValues>>(name: TName) =>
            store.getValue<FieldPathValue<TValues, TName>>(name),
        next: store.next.bind(store),
        prev: store.prev.bind(store),
        goTo: store.goTo.bind(store),
        validateStep: () => store.validateCurrentStep(),
        validateAll: () => store.validateAll(),
        reset: store.reset.bind(store),
        clearErrors: store.clearErrors.bind(store),
    };
}
