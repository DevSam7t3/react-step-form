import {
    createContext,
    useContext,
    useMemo,
    useSyncExternalStore,
    type PropsWithChildren,
    type ReactElement,
} from "react";
import type {
    FieldRegistry,
    WizardSnapshot,
    WizardStore,
    WizardValues,
} from "./internal";

interface WizardContextValue<TValues extends WizardValues> {
    store: WizardStore<TValues>;
    registerField: FieldRegistry["registerField"];
    unregisterField: FieldRegistry["unregisterField"];
    getFieldsForStep: FieldRegistry["getFieldsForStep"];
    subscribeToFieldRegistry: FieldRegistry["subscribe"];
    getFieldRegistryVersion: FieldRegistry["getVersion"];
    getCurrentStepId: () => string;
}

const WizardContext = createContext<WizardContextValue<WizardValues> | null>(
    null,
);

export function WizardProvider<TValues extends WizardValues>({
    store,
    fieldRegistry,
    children,
}: PropsWithChildren<{
    store: WizardStore<TValues>;
    fieldRegistry: FieldRegistry;
}>): ReactElement {
    const value = useMemo(
        () => ({
            store,
            registerField: fieldRegistry.registerField,
            unregisterField: fieldRegistry.unregisterField,
            getFieldsForStep: fieldRegistry.getFieldsForStep,
            subscribeToFieldRegistry: fieldRegistry.subscribe,
            getFieldRegistryVersion: fieldRegistry.getVersion,
            getCurrentStepId: () => store.getSnapshot().currentStep.id,
        }),
        [store, fieldRegistry],
    );
    return (
        <WizardContext.Provider
            value={value as WizardContextValue<WizardValues>}
        >
            {children}
        </WizardContext.Provider>
    );
}

export function useWizardStore<
    TValues extends WizardValues,
>(): WizardStore<TValues> {
    const context = useWizardContextValue();
    return context.store as WizardStore<TValues>;
}

export function useWizardFieldRegistry(): Pick<
    WizardContextValue<WizardValues>,
    | "registerField"
    | "unregisterField"
    | "getFieldsForStep"
    | "subscribeToFieldRegistry"
    | "getFieldRegistryVersion"
    | "getCurrentStepId"
> {
    const context = useWizardContextValue();

    return {
        registerField: context.registerField,
        unregisterField: context.unregisterField,
        getFieldsForStep: context.getFieldsForStep,
        subscribeToFieldRegistry: context.subscribeToFieldRegistry,
        getFieldRegistryVersion: context.getFieldRegistryVersion,
        getCurrentStepId: context.getCurrentStepId,
    };
}

export function useWizardFieldRegistryVersion(): number {
    const { subscribeToFieldRegistry, getFieldRegistryVersion } =
        useWizardFieldRegistry();

    return useSyncExternalStore(
        subscribeToFieldRegistry,
        getFieldRegistryVersion,
        getFieldRegistryVersion,
    );
}

function useWizardContextValue(): WizardContextValue<WizardValues> {
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error("useWizardStore must be used within FormWizard.");
    }

    return context;
}

export function useWizardSnapshot<
    TValues extends WizardValues,
>(): WizardSnapshot<TValues> {
    const store = useWizardStore<TValues>();

    return useSyncExternalStore(
        (listener) => store.subscribe(() => listener()),
        () => store.getSnapshot(),
        () => store.getSnapshot(),
    );
}
