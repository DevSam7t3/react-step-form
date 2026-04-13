// @vitest-environment jsdom

import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import {
    Controller,
    FormWizard,
    useFormWizard,
    type ControllerRenderProps,
    type FormWizardRenderApi,
} from "../../packages/react/src";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

interface TestValues {
    email: string;
    firstName: string;
}

const schema = {
    safeParse(data: unknown) {
        const values = data as Partial<TestValues>;
        const issues: Array<{ path: (string | number)[]; message: string }> =
            [];

        if (!values.email || !values.email.includes("@")) {
            issues.push({ path: ["email"], message: "Email is invalid" });
        }

        if (!values.firstName) {
            issues.push({
                path: ["firstName"],
                message: "First name is required",
            });
        }

        if (issues.length > 0) {
            return { success: false as const, error: { issues } };
        }

        return { success: true as const, data: values as TestValues };
    },
};

function createHarness() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const unmount = () => {
        act(() => {
            root.unmount();
        });
        container.remove();
    };

    return { container, root, unmount };
}

afterEach(() => {
    document.body.innerHTML = "";
});

describe("React API extensions", () => {
    it("exposes new fields in useFormWizard including watch and navigation helpers", () => {
        let hookApi: ReturnType<typeof useFormWizard<TestValues>> | null = null;

        function Probe() {
            hookApi = useFormWizard<TestValues>();
            return null;
        }

        function AccountStep() {
            return <Probe />;
        }

        const { root, unmount } = createHarness();

        act(() => {
            root.render(
                <FormWizard<TestValues>
                    schema={schema}
                    defaultValues={{ email: "", firstName: "" }}
                    steps={[
                        {
                            id: "account",
                            component: AccountStep,
                            fields: ["email"],
                        },
                        {
                            id: "profile",
                            component: () => null,
                            fields: ["firstName"],
                        },
                    ]}
                    onSubmit={() => undefined}
                />,
            );
        });

        expect(hookApi).not.toBeNull();
        expect(hookApi!.totalSteps).toBe(2);
        expect(hookApi!.progress).toBe(50);
        expect(hookApi!.canGoPrev).toBe(false);
        expect(hookApi!.canGoNext).toBe(false);
        expect(hookApi!.isStepValid).toBe(false);
        expect(hookApi!.watch()).toEqual({ email: "", firstName: "" });
        expect(hookApi!.watch("email")).toBe("");

        act(() => {
            hookApi!.setValue("email", "valid@example.com");
        });

        expect(hookApi!.isStepValid).toBe(true);
        expect(hookApi!.canGoNext).toBe(true);
        expect(hookApi!.dirtyFields.email).toBe(true);

        unmount();
    });

    it("exposes new fields in FormWizard children render API", () => {
        let renderApi: FormWizardRenderApi<TestValues> | null = null;
        let emailField: ControllerRenderProps<string>["field"] | null = null;
        const TypedController = Controller<TestValues>;

        function AccountStep() {
            return (
                <TypedController
                    name="email"
                    render={({ field }) => {
                        emailField = field;
                        return null;
                    }}
                />
            );
        }

        const { root, unmount } = createHarness();

        act(() => {
            root.render(
                <FormWizard<TestValues>
                    schema={schema}
                    defaultValues={{ email: "", firstName: "" }}
                    steps={[
                        {
                            id: "account",
                            component: AccountStep,
                            fields: ["email"],
                        },
                        {
                            id: "profile",
                            component: () => null,
                            fields: ["firstName"],
                        },
                    ]}
                    onSubmit={() => undefined}
                >
                    {(api) => {
                        renderApi = api;
                        return api.currentStep.id === "account" ? (
                            <AccountStep />
                        ) : null;
                    }}
                </FormWizard>,
            );
        });

        expect(renderApi).not.toBeNull();
        expect(renderApi!.totalSteps).toBe(2);
        expect(renderApi!.progress).toBe(50);
        expect(renderApi!.canGoPrev).toBe(false);
        expect(renderApi!.canGoNext).toBe(false);
        expect(renderApi!.isStepValid).toBe(false);
        expect(renderApi!.watch("email")).toBe("");

        act(() => {
            emailField!.onChange("valid@example.com");
        });

        expect(renderApi!.isStepValid).toBe(true);
        expect(renderApi!.canGoNext).toBe(true);
        expect(renderApi!.dirtyFields.email).toBe(true);

        act(() => {
            renderApi!.next();
        });

        expect(renderApi!.currentStep.id).toBe("profile");
        expect(renderApi!.canGoPrev).toBe(true);
        expect(renderApi!.canGoNext).toBe(false);
        expect(renderApi!.progress).toBe(100);

        unmount();
    });

    it("marks controller fields as touched on blur and change", () => {
        let renderApi: FormWizardRenderApi<TestValues> | null = null;
        let emailField: ControllerRenderProps<string>["field"] | null = null;
        const TypedController = Controller<TestValues>;

        function AccountStep() {
            return (
                <TypedController
                    name="email"
                    render={({ field }) => {
                        emailField = field;
                        return null;
                    }}
                />
            );
        }

        const { root, unmount } = createHarness();

        act(() => {
            root.render(
                <FormWizard<TestValues>
                    schema={schema}
                    defaultValues={{ email: "", firstName: "" }}
                    steps={[
                        {
                            id: "account",
                            component: AccountStep,
                            fields: ["email"],
                        },
                    ]}
                    onSubmit={() => undefined}
                >
                    {(api) => {
                        renderApi = api;
                        return <AccountStep />;
                    }}
                </FormWizard>,
            );
        });

        expect(renderApi!.touchedFields.email).toBeUndefined();

        act(() => {
            emailField!.onBlur();
        });

        expect(renderApi!.touchedFields.email).toBe(true);

        act(() => {
            emailField!.onChange("valid@example.com");
        });

        expect(renderApi!.touchedFields.email).toBe(true);
        expect(renderApi!.dirtyFields.email).toBe(true);

        unmount();
    });
});
