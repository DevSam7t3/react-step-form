import {
    useMemo,
    useState,
    type CSSProperties,
    type ReactElement,
} from "react";
import {
    useWizardFieldRegistry,
    useWizardFieldRegistryVersion,
    useWizardSnapshot,
} from "./context";
import type { WizardValues } from "./internal";
import type { DebugPanelPosition } from "./types";

function hasStepError(errors: Record<string, string>, field: string): boolean {
    return Object.keys(errors).some(
        (key) => key === field || key.startsWith(`${field}.`),
    );
}

function statusColor(status: "valid" | "invalid" | "unknown"): string {
    if (status === "valid") {
        return "#3dd68c";
    }

    if (status === "invalid") {
        return "#ff6b6b";
    }

    return "#f2be5c";
}

export function DebugPanel<TValues extends WizardValues>({
    position = "bottom-right",
}: {
    position?: DebugPanelPosition;
}): ReactElement {
    const snapshot = useWizardSnapshot<TValues>();
    const { getFieldsForStep } = useWizardFieldRegistry();
    useWizardFieldRegistryVersion();
    const [isOpen, setIsOpen] = useState(true);

    const inferredFields = getFieldsForStep(snapshot.currentStep.id);
    const stepFields = snapshot.currentStep.fields ?? inferredFields;
    const usesInferredFields = snapshot.currentStep.fields === undefined;

    const validationStatus =
        stepFields.length === 0
            ? "unknown"
            : stepFields.some((field) => hasStepError(snapshot.errors, field))
            ? "invalid"
            : "valid";

    const valuesJson = useMemo(
        () => JSON.stringify(snapshot.values, null, 2),
        [snapshot.values],
    );
    const errorsJson = useMemo(
        () => JSON.stringify(snapshot.errors, null, 2),
        [snapshot.errors],
    );
    const fieldsJson = useMemo(
        () => JSON.stringify(stepFields, null, 2),
        [stepFields],
    );

    const placementStyle: CSSProperties = {
        position: position === "inline" ? "relative" : "absolute",
        width: position === "inline" ? "100%" : 390,
        maxWidth: "100%",
        marginTop: position === "inline" ? 12 : undefined,
    };

    if (position !== "inline") {
        if (position.includes("bottom")) {
            placementStyle.bottom = 20;
        } else {
            placementStyle.top = 20;
        }

        if (position.includes("left")) {
            placementStyle.left = 20;
        } else {
            placementStyle.right = 20;
        }
    }

    return (
        <aside
            style={{
                maxHeight: "70vh",
                background:
                    "linear-gradient(160deg, rgba(17, 24, 39, 0.95), rgba(15, 23, 42, 0.95))",
                color: "#e9eef8",
                border: "1px solid rgba(148, 163, 184, 0.26)",
                borderRadius: 14,
                boxShadow:
                    "0 22px 48px rgba(2, 6, 23, 0.5), 0 4px 16px rgba(2, 6, 23, 0.35)",
                backdropFilter: "blur(6px)",
                fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                zIndex: 9999,
                overflow: "hidden",
                ...placementStyle,
            }}
        >
            <button
                type="button"
                onClick={() => setIsOpen((value) => !value)}
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "left",
                    background:
                        "linear-gradient(160deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.92))",
                    color: "#f8fbff",
                    border: "none",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                    padding: "12px 14px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 0.2,
                }}
            >
                <span>FormWizard Debug</span>
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 22,
                        height: 22,
                        borderRadius: 999,
                        background: "rgba(96, 165, 250, 0.18)",
                        color: "#93c5fd",
                        fontWeight: 700,
                        border: "1px solid rgba(96, 165, 250, 0.35)",
                    }}
                >
                    {isOpen ? "-" : "+"}
                </span>
            </button>

            {isOpen ? (
                <div
                    style={{
                        padding: 14,
                        overflow: "auto",
                        maxHeight: "calc(70vh - 50px)",
                        display: "grid",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                background: "rgba(30, 41, 59, 0.55)",
                                border: "1px solid rgba(148, 163, 184, 0.2)",
                                borderRadius: 10,
                                padding: "8px 10px",
                            }}
                        >
                            <div style={{ fontSize: 10, opacity: 0.75 }}>
                                Step ID
                            </div>
                            <div style={{ marginTop: 4, fontWeight: 700 }}>
                                {snapshot.currentStep.id}
                            </div>
                        </div>
                        <div
                            style={{
                                background: "rgba(30, 41, 59, 0.55)",
                                border: "1px solid rgba(148, 163, 184, 0.2)",
                                borderRadius: 10,
                                padding: "8px 10px",
                            }}
                        >
                            <div style={{ fontSize: 10, opacity: 0.75 }}>
                                Step Index
                            </div>
                            <div style={{ marginTop: 4, fontWeight: 700 }}>
                                {snapshot.currentStepIndex}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span
                            style={{
                                borderRadius: 999,
                                padding: "4px 9px",
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                border: "1px solid rgba(129, 140, 248, 0.45)",
                                background: "rgba(99, 102, 241, 0.15)",
                                color: "#c7d2fe",
                            }}
                        >
                            {usesInferredFields
                                ? "fields: inferred"
                                : "fields: manual"}
                        </span>
                        <span
                            style={{
                                borderRadius: 999,
                                padding: "4px 9px",
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                border: `1px solid ${statusColor(
                                    validationStatus,
                                )}66`,
                                background: `${statusColor(
                                    validationStatus,
                                )}1f`,
                                color: statusColor(validationStatus),
                            }}
                        >
                            {`step: ${validationStatus}`}
                        </span>
                    </div>

                    <div
                        style={{
                            borderRadius: 10,
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            background: "rgba(30, 41, 59, 0.4)",
                            padding: 10,
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                            Step Fields
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                            }}
                        >
                            {stepFields.length === 0 ? (
                                <span style={{ opacity: 0.75, fontSize: 12 }}>
                                    No fields registered for this step yet.
                                </span>
                            ) : (
                                stepFields.map((field) => {
                                    const invalid = hasStepError(
                                        snapshot.errors,
                                        field,
                                    );

                                    return (
                                        <span
                                            key={field}
                                            style={{
                                                borderRadius: 999,
                                                padding: "4px 8px",
                                                fontSize: 11,
                                                border: invalid
                                                    ? "1px solid rgba(248, 113, 113, 0.45)"
                                                    : "1px solid rgba(148, 163, 184, 0.3)",
                                                background: invalid
                                                    ? "rgba(239, 68, 68, 0.15)"
                                                    : "rgba(148, 163, 184, 0.12)",
                                                color: invalid
                                                    ? "#fca5a5"
                                                    : "#cbd5e1",
                                            }}
                                        >
                                            {field}
                                        </span>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            borderRadius: 10,
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            background: "rgba(2, 6, 23, 0.52)",
                            padding: 10,
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                            Fields (JSON)
                        </div>
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                fontSize: 11,
                                lineHeight: 1.4,
                                color: "#cbd5e1",
                            }}
                        >
                            {fieldsJson}
                        </pre>
                    </div>

                    <div
                        style={{
                            borderRadius: 10,
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            background: "rgba(2, 6, 23, 0.52)",
                            padding: 10,
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                            Values
                        </div>
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                fontSize: 11,
                                lineHeight: 1.4,
                                color: "#93c5fd",
                            }}
                        >
                            {valuesJson}
                        </pre>
                    </div>

                    <div
                        style={{
                            borderRadius: 10,
                            border: "1px solid rgba(248, 113, 113, 0.3)",
                            background: "rgba(127, 29, 29, 0.18)",
                            padding: 10,
                        }}
                    >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>
                            Errors
                        </div>
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                fontSize: 11,
                                lineHeight: 1.4,
                                color: "#fca5a5",
                            }}
                        >
                            {errorsJson}
                        </pre>
                    </div>
                </div>
            ) : null}
        </aside>
    );
}
