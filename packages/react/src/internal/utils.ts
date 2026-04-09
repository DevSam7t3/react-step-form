const PATH_SEPARATOR = ".";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function splitPath(path: string): string[] {
    return path.split(PATH_SEPARATOR).filter(Boolean);
}

export function getIn<TValue = unknown>(
    source: unknown,
    path: string,
): TValue | undefined {
    const segments = splitPath(path);
    let current: unknown = source;

    for (const segment of segments) {
        if (!isRecord(current) && !Array.isArray(current)) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[segment];
    }

    return current as TValue | undefined;
}

export function setIn<TObject extends Record<string, unknown>>(
    source: TObject,
    path: string,
    value: unknown,
): TObject {
    const segments = splitPath(path);
    if (segments.length === 0) {
        return source;
    }

    const clone: Record<string, unknown> = structuredClone(source);
    let current: Record<string, unknown> = clone;

    for (let index = 0; index < segments.length - 1; index += 1) {
        const segment = segments[index];
        const existing = current[segment];

        if (!isRecord(existing)) {
            current[segment] = {};
        }

        current = current[segment] as Record<string, unknown>;
    }

    current[segments[segments.length - 1]] = value;
    return clone as TObject;
}

export function mergeErrors(
    target: Record<string, string>,
    next: Record<string, string>,
): Record<string, string> {
    const merged = { ...target };

    for (const key of Object.keys(next)) {
        if (!next[key]) {
            delete merged[key];
            continue;
        }
        merged[key] = next[key];
    }

    return merged;
}
