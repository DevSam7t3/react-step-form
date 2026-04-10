import { describe, expect, it } from "vitest";
import { extractChangeValue } from "../../packages/react/src/internal/changeValue";

describe("extractChangeValue", () => {
    it("returns direct values unchanged", () => {
        expect(extractChangeValue("hello")).toBe("hello");
        expect(extractChangeValue(42)).toBe(42);
    });

    it("extracts string value from text-like event targets", () => {
        const value = extractChangeValue<string>({
            target: { value: "devsam" },
        });
        expect(value).toBe("devsam");
    });

    it("extracts checked state for checkbox targets", () => {
        const checked = extractChangeValue<boolean>({
            target: { type: "checkbox", checked: true },
        });
        expect(checked).toBe(true);
    });

    it("extracts numeric value for number input targets", () => {
        const value = extractChangeValue<number>({
            target: { type: "number", valueAsNumber: 17, value: 17 },
        });
        expect(value).toBe(17);
    });

    it("extracts selected values for multiple select targets", () => {
        const value = extractChangeValue<string[]>({
            target: {
                multiple: true,
                selectedOptions: [{ value: "react" }, { value: "typescript" }],
            },
        });

        expect(value).toEqual(["react", "typescript"]);
    });
});
