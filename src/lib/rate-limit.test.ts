import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkCVRateLimit } from "./rate-limit";

describe("Rate Limiting Service", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("debe permitir solicitudes consecutivas hasta el límite establecido", async () => {
    // El límite por defecto es 5 por día
    const testIdentifier = "test-user-success";

    for (let i = 0; i < 5; i++) {
      const result = await checkCVRateLimit(testIdentifier);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }

    // La sexta solicitud debe fallar
    const blockedResult = await checkCVRateLimit(testIdentifier);
    expect(blockedResult.success).toBe(false);
    expect(blockedResult.remaining).toBe(0);
  });

  it("debe calcular el tiempo de restablecimiento correcto (reset time)", async () => {
    const testIdentifier = "test-user-reset";
    const startTime = Date.now();

    // Agotar cuota
    for (let i = 0; i < 5; i++) {
      await checkCVRateLimit(testIdentifier);
    }

    const blockedResult = await checkCVRateLimit(testIdentifier);
    expect(blockedResult.success).toBe(false);

    // El reset time debe ser exactamente la hora de inicio + 24 horas (WINDOW_DURATION)
    const expectedReset = startTime + 24 * 60 * 60 * 1000;
    expect(blockedResult.reset).toBe(expectedReset);
  });

  it("debe liberar espacio en la ventana deslizante una vez transcurrido el tiempo", async () => {
    const testIdentifier = "test-user-window";

    // Primera solicitud a las T = 0
    const r1 = await checkCVRateLimit(testIdentifier);
    expect(r1.success).toBe(true);

    // Mover el tiempo 2 horas adelante
    vi.advanceTimersByTime(2 * 60 * 60 * 1000);

    // 4 solicitudes más
    for (let i = 0; i < 4; i++) {
      await checkCVRateLimit(testIdentifier);
    }

    // Agotado
    const rBlocked = await checkCVRateLimit(testIdentifier);
    expect(rBlocked.success).toBe(false);

    // Mover el tiempo 22 horas y 1 minuto adelante (T = 24h + 1m desde la primera solicitud)
    // Esto debe liberar la primera solicitud (ya que tiene > 24h)
    vi.advanceTimersByTime(22 * 60 * 60 * 1000 + 60 * 1000);

    const rAllowed = await checkCVRateLimit(testIdentifier);
    expect(rAllowed.success).toBe(true);
    expect(rAllowed.remaining).toBe(0); // Queda 0 porque solo se liberó la primera
  });
});
