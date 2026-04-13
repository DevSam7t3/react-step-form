import { describe, expect, it } from "vitest";
import {
    WizardStore,
    createZodAdapter,
    type ZodLikeSchema,
} from "../../packages/react/src/internal";

interface TestValues {
    email?: string;
    password?: string;
    profile?: {
        firstName?: string;
    };
}

const schema: ZodLikeSchema<TestValues> = {
    safeParse(data: unknown) {
        const values = data as TestValues;
        const issues: Array<{ path: (string | number)[]; message: string }> =
            [];

        if (!values.email?.includes("@")) {
            issues.push({ path: ["email"], message: "Email is invalid" });
        }

        if (!values.password || values.password.length < 6) {
            issues.push({
                path: ["password"],
                message: "Password is too short",
            });
        }

        if (!values.profile?.firstName) {
            issues.push({
                path: ["profile", "firstName"],
                message: "First name is required",
            });
        }

        if (issues.length > 0) {
            return { success: false as const, error: { issues } };
        }

        return { success: true as const, data: values };
    },
};

describe("WizardStore", () => {
    it("blocks next step when step validation fails", () => {
        const store = new WizardStore<TestValues>({
            steps: [
                { id: "account", fields: ["email", "password"] },
                { id: "profile", fields: ["profile.firstName"] },
            ],
            schemaAdapter: createZodAdapter(schema),
            defaultValues: { email: "bad", password: "123" },
        });

        const moved = store.next();

        expect(moved).toBe(false);
        expect(store.getSnapshot().currentStep.id).toBe("account");
        expect(store.getSnapshot().errors.email).toBe("Email is invalid");
    });

    it("allows navigating and validates nested fields", () => {
        const store = new WizardStore<TestValues>({
            steps: [
                { id: "account", fields: ["email", "password"] },
                { id: "profile", fields: ["profile.firstName"] },
            ],
            schemaAdapter: createZodAdapter(schema),
            defaultValues: { email: "test@demo.dev", password: "123456" },
        });

        expect(store.next()).toBe(true);
        expect(store.getSnapshot().currentStep.id).toBe("profile");

        expect(store.next()).toBe(false);
        expect(store.getSnapshot().errors["profile.firstName"]).toBe(
            "First name is required",
        );

        store.setValue("profile.firstName", "Samir");
        expect(store.validateCurrentStep().valid).toBe(true);
    });

    it("falls back to inferred fields when step fields are omitted", () => {
        const store = new WizardStore<TestValues>({
            steps: [{ id: "account" }, { id: "profile" }],
            schemaAdapter: createZodAdapter(schema),
            defaultValues: { email: "bad", password: "123" },
            getFieldsForStep: (stepId) =>
                stepId === "account"
                    ? ["email", "password"]
                    : ["profile.firstName"],
        });

        expect(store.next()).toBe(false);
        expect(store.getSnapshot().errors.email).toBe("Email is invalid");
        expect(store.getSnapshot().errors.password).toBe(
            "Password is too short",
        );
    });

    it("prefers explicit step fields when both explicit and inferred fields exist", () => {
        const store = new WizardStore<TestValues>({
            steps: [
                { id: "account", fields: ["email"] },
                { id: "profile", fields: ["profile.firstName"] },
            ],
            schemaAdapter: createZodAdapter(schema),
            defaultValues: { email: "bad", password: "123" },
            getFieldsForStep: () => ["password"],
        });

        expect(store.next()).toBe(false);
        expect(store.getSnapshot().errors.email).toBe("Email is invalid");
        expect(store.getSnapshot().errors.password).toBeUndefined();
    });

    it("tracks dirty fields against defaults and clears when value returns to default", () => {
        const store = new WizardStore<TestValues>({
            steps: [{ id: "account", fields: ["email"] }],
            schemaAdapter: createZodAdapter(schema),
            defaultValues: { email: "start@demo.dev" },
        });

        store.setValue("email", "changed@demo.dev");
        expect(store.getSnapshot().dirtyFields.email).toBe(true);

        store.setValue("email", "start@demo.dev");
        expect(store.getSnapshot().dirtyFields.email).toBeUndefined();
    });

    it("tracks touched fields and computes step validity without mutating errors", () => {
        const store = new WizardStore<TestValues>({
            steps: [{ id: "account", fields: ["email"] }],
            schemaAdapter: createZodAdapter(schema),
            defaultValues: { email: "bad" },
        });

        store.markTouched("email");
        expect(store.getSnapshot().touchedFields.email).toBe(true);

        const stepValidation = store.getCurrentStepValidation();
        expect(stepValidation.valid).toBe(false);
        expect(store.getSnapshot().errors.email).toBeUndefined();

        const submittedStepValidation = store.validateCurrentStep();
        expect(submittedStepValidation.valid).toBe(false);
        expect(store.getSnapshot().errors.email).toBe("Email is invalid");
    });
});
