import type { FieldRegistry } from "./types";

export function createFieldRegistry(): FieldRegistry {
    const countsByStep = new Map<string, Map<string, number>>();
    const cacheByStep = new Map<string, string[]>();
    const listeners = new Set<() => void>();
    let version = 0;

    function invalidate(stepId: string): void {
        cacheByStep.delete(stepId);
    }

    function emit(): void {
        version += 1;
        for (const listener of listeners) {
            listener();
        }
    }

    return {
        registerField(name, stepId) {
            let stepCounts = countsByStep.get(stepId);
            if (!stepCounts) {
                stepCounts = new Map<string, number>();
                countsByStep.set(stepId, stepCounts);
            }

            const previous = stepCounts.get(name) ?? 0;
            stepCounts.set(name, previous + 1);

            if (previous === 0) {
                invalidate(stepId);
                emit();
            }
        },
        unregisterField(name, stepId) {
            const stepCounts = countsByStep.get(stepId);
            if (!stepCounts) {
                return;
            }

            const previous = stepCounts.get(name);
            if (!previous) {
                return;
            }

            if (previous === 1) {
                stepCounts.delete(name);
                invalidate(stepId);
                emit();
            } else {
                stepCounts.set(name, previous - 1);
            }

            if (stepCounts.size === 0) {
                countsByStep.delete(stepId);
            }
        },
        getFieldsForStep(stepId) {
            const cached = cacheByStep.get(stepId);
            if (cached) {
                return cached;
            }

            const fields = Array.from(countsByStep.get(stepId)?.keys() ?? []);
            cacheByStep.set(stepId, fields);
            return fields;
        },
        subscribe(listener) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
        getVersion() {
            return version;
        },
    };
}
