import { describe, expect, it } from "vitest";
import { createFieldRegistry } from "../../packages/react/src/internal";

describe("FieldRegistry", () => {
    it("deduplicates duplicate field registrations per step", () => {
        const registry = createFieldRegistry();

        registry.registerField("user.email", "account");
        registry.registerField("user.email", "account");

        expect(registry.getFieldsForStep("account")).toEqual(["user.email"]);
    });

    it("returns stable field array references when step fields are unchanged", () => {
        const registry = createFieldRegistry();

        registry.registerField("email", "account");

        const first = registry.getFieldsForStep("account");
        const second = registry.getFieldsForStep("account");

        expect(first).toBe(second);
    });

    it("cleans up inferred field names only when all registrations are removed", () => {
        const registry = createFieldRegistry();

        registry.registerField("email", "account");
        registry.registerField("email", "account");

        registry.unregisterField("email", "account");
        expect(registry.getFieldsForStep("account")).toEqual(["email"]);

        registry.unregisterField("email", "account");
        expect(registry.getFieldsForStep("account")).toEqual([]);
    });
});
