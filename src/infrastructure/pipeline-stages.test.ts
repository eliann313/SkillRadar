import { describe, it, expect } from "vitest";
import { resolveStages, unionStages, isValidStage, DEFAULT_PIPELINE_STAGES } from "./pipeline-stages";

describe("pipeline-stages", () => {
    it("usa el default cuando no hay custom", () => {
        expect(resolveStages([])).toEqual([...DEFAULT_PIPELINE_STAGES]);
        expect(resolveStages(null)).toEqual([...DEFAULT_PIPELINE_STAGES]);
    });

    it("limpia y deduplica etapas custom", () => {
        expect(resolveStages([" Screening ", "SCREENING", "offer", "..", ""])).toEqual(["screening", "offer"]);
    });

    it("une etapas con default primero", () => {
        expect(unionStages([["screening"], ["offer", "custom"]])).toEqual([
            ...DEFAULT_PIPELINE_STAGES,
            "screening",
            "custom",
        ]);
    });

    it("valida etapas contra la oferta", () => {
        expect(isValidStage("offer", [])).toBe(true);
        expect(isValidStage("custom", ["custom"])).toBe(true);
        expect(isValidStage("nope", ["custom"])).toBe(false);
    });
});
