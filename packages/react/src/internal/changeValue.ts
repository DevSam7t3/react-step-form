import type { ControllerChangeArg, ControllerChangeEventLike } from "../types";

export function isEventLike<TValue>(
    input: ControllerChangeArg<TValue>,
): input is ControllerChangeEventLike<TValue> {
    return typeof input === "object" && input !== null && "target" in input;
}

export function extractChangeValue<TValue>(
    input: ControllerChangeArg<TValue>,
): TValue {
    if (!isEventLike(input)) {
        return input;
    }

    const target = input.target;
    const targetType =
        typeof target.type === "string" ? target.type.toLowerCase() : "";

    if (targetType === "checkbox") {
        return Boolean(target.checked) as TValue;
    }

    if (target.multiple && target.selectedOptions) {
        return Array.from(
            target.selectedOptions,
            (option) => option.value,
        ) as TValue;
    }

    if (
        targetType === "number" &&
        typeof target.valueAsNumber === "number" &&
        !Number.isNaN(target.valueAsNumber)
    ) {
        return target.valueAsNumber as TValue;
    }

    if (target.value !== undefined) {
        return target.value as TValue;
    }

    return target.checked as TValue;
}
