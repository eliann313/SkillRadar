/**
 * Shared kernel: resultado estándar de las Server Actions.
 * Fuente única de verdad — los features no deben redefinirla
 * ni importarla entre sí (hex-no-feature-to-feature).
 */
export type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
