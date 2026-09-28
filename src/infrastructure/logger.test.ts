import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("reenvía a console con prefijo [SkillRadar] (compatible con spies)", () => {
        const spyInfo = vi.spyOn(console, "info").mockImplementation(() => {});
        const spyError = vi.spyOn(console, "error").mockImplementation(() => {});

        logger.info("hola", { a: 1 });
        logger.error("fallo");

        expect(spyInfo).toHaveBeenCalledWith("[SkillRadar]", "hola", { a: 1 });
        expect(spyError).toHaveBeenCalledWith("[SkillRadar]", "fallo");
    });
});
