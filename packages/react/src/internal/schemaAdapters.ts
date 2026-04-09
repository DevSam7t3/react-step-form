import { getIn } from "./utils";
import type { SchemaAdapter, ValidationResult, WizardValues } from "./types";

export interface ZodIssue {
    path: (string | number)[];
    message: string;
}

export interface ZodLikeSchema<TValues extends WizardValues> {
    safeParse(
        data: unknown,
    ):
        | { success: true; data: TValues }
        | { success: false; error: { issues: ZodIssue[] } };
}

function issuePathToKey(path: (string | number)[]): string {
    return path.map(String).join(".");
}

function collectErrors(issues: ZodIssue[]): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const issue of issues) {
        const key = issuePathToKey(issue.path);
        if (!key) {
            continue;
        }
        if (!errors[key]) {
            errors[key] = issue.message;
        }
    }

    return errors;
}

function isFieldCovered(errorPath: string, fields: string[]): boolean {
    return fields.some(
        (field) => errorPath === field || errorPath.startsWith(`${field}.`),
    );
}

function filterErrorsByFields(
    errors: Record<string, string>,
    values: WizardValues,
    fields: string[],
): Record<string, string> {
    const filtered: Record<string, string> = {};

    for (const [errorPath, message] of Object.entries(errors)) {
        if (isFieldCovered(errorPath, fields)) {
            filtered[errorPath] = message;
        }
    }

    for (const field of fields) {
        if (
            getIn(values, field) === undefined &&
            !Object.keys(filtered).some((key) => key.startsWith(field))
        ) {
            continue;
        }
    }

    return filtered;
}

export function createZodAdapter<TValues extends WizardValues>(
    schema: ZodLikeSchema<TValues>,
): SchemaAdapter<TValues> {
    function parse(values: TValues): ValidationResult {
        const parsed = schema.safeParse(values);

        if (parsed.success) {
            return { valid: true, errors: {} };
        }

        return {
            valid: false,
            errors: collectErrors(parsed.error.issues),
        };
    }

    return {
        validateAll(values) {
            return parse(values);
        },
        validateFields(values, fields) {
            const result = parse(values);
            if (result.valid) {
                return result;
            }

            const errors = filterErrorsByFields(result.errors, values, fields);
            return {
                valid: Object.keys(errors).length === 0,
                errors,
            };
        },
    };
}
