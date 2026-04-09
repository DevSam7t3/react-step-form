import type { WizardValues } from "./internal";
import { useWizardSnapshot, useWizardStore } from "./context";

export function useFormWizard<TValues extends WizardValues = WizardValues>() {
    const store = useWizardStore<TValues>();
    const snapshot = useWizardSnapshot<TValues>();

    return {
        ...snapshot,
        setValue: store.setValue.bind(store),
        getValue: store.getValue.bind(store),
        next: store.next.bind(store),
        prev: store.prev.bind(store),
        goTo: store.goTo.bind(store),
        validateStep: () => store.validateCurrentStep(),
        validateAll: () => store.validateAll(),
        reset: store.reset.bind(store),
        clearErrors: store.clearErrors.bind(store),
    };
}
