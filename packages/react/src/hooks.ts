import { useMemo } from "react";
import type { WizardValues } from "./internal";
import type { FieldPath, FieldPathValue } from "./types";
import {
    useWizardFieldRegistryVersion,
    useWizardSnapshot,
    useWizardStore,
} from "./context";

export function useFormWizard<TValues extends WizardValues = WizardValues>() {
    const store = useWizardStore<TValues>();
    const snapshot = useWizardSnapshot<TValues>();
    const fieldRegistryVersion = useWizardFieldRegistryVersion();

    const totalSteps = store.getTotalSteps();

    const isStepValid = useMemo(
        () => store.getCurrentStepValidation().valid,
        [
            store,
            snapshot.values,
            snapshot.currentStepIndex,
            fieldRegistryVersion,
        ],
    );

    const canGoPrev = !snapshot.isFirstStep;
    const canGoNext = !snapshot.isLastStep && isStepValid;
    const progress = useMemo(
        () => ((snapshot.currentStepIndex + 1) / totalSteps) * 100,
        [snapshot.currentStepIndex, totalSteps],
    );

    const watch = useMemo(
        () =>
            (<TName extends FieldPath<TValues>>(name?: TName) => {
                if (!name) {
                    return snapshot.values;
                }

                return store.getValue<FieldPathValue<TValues, TName>>(name);
            }) as {
                (): TValues;
                <TName extends FieldPath<TValues>>(name: TName):
                    | FieldPathValue<TValues, TName>
                    | undefined;
            },
        [snapshot.values, store],
    );

    return {
        ...snapshot,
        isStepValid,
        watch,
        totalSteps,
        canGoNext,
        canGoPrev,
        progress,
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
