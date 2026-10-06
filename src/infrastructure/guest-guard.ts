/**
 * Aislamiento del modo demo/guest de la DB real.
 *
 * Los ids `guest-recruiter-id` y `guest-developer-id` son compartidos entre
 * todos los visitantes: cualquier escritura con esos ids contamina datos
 * visibles para otros (o mueve datos reales). Toda Server Action que escriba
 * en la DB debe llamar a `rejectGuestWrite(session)` antes de persistir.
 */

import type { ActionResult } from "@/shared-kernel/action-result";

interface GuestSession {
    user?: { id?: string; isGuest?: boolean } | null;
}

const SHARED_GUEST_IDS = new Set(["guest-recruiter-id", "guest-developer-id"]);

export function isGuestSession(session: GuestSession | null): boolean {
    const user = session?.user;
    if (!user) return false;
    return user.isGuest === true || (user.id !== undefined && SHARED_GUEST_IDS.has(user.id));
}

export const GUEST_WRITE_ERROR = "Acción no disponible en modo demo. Creá una cuenta gratuita para continuar.";

/**
 * Denegación explícita de escritura para sesiones demo.
 *
 * Uso: `const blocked = rejectGuestWrite(session); if (blocked) return blocked;`
 * antes de cualquier persistencia. No confiar en errores de FK/ownership:
 * el id compartido debe fallar cerrado por diseño, no por accidente.
 */
export function rejectGuestWrite(session: GuestSession | null): ActionResult<never> | null {
    if (isGuestSession(session)) {
        return { success: false, error: GUEST_WRITE_ERROR };
    }
    return null;
}
