/**
 * Formato de fecha determinista para postulaciones.
 *
 * Fija locale + timeZone para que el render de servidor y cliente coincida
 * (evita hydration mismatch del `toLocaleDateString()` con defaults).
 */
export function formatApplicationDate(value: string | Date): string {
    return new Date(value).toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}
