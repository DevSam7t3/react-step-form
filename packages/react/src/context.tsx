import {
    createContext,
    useContext,
    useMemo,
    useSyncExternalStore,
    type PropsWithChildren,
    type ReactElement,
} from "react";
import type { WizardSnapshot, WizardStore, WizardValues } from "./internal";

interface WizardContextValue<TValues extends WizardValues> {
    store: WizardStore<TValues>;
}

const WizardContext = createContext<WizardContextValue<WizardValues> | null>(
    null,
);

export function WizardProvider<TValues extends WizardValues>({
    store,
    children,
}: PropsWithChildren<{ store: WizardStore<TValues> }>): ReactElement {
    const value = useMemo(() => ({ store }), [store]);
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
    const context = useContext(WizardContext);
    if (!context) {
        throw new Error("useWizardStore must be used within FormWizard.");
    }

    return context.store as WizardStore<TValues>;
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
