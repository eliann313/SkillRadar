/**
 * Shared kernel: constantes del dominio recruiter.
 * Sin "use server": los módulos "use server" no pueden exportar valores
 * no-función (Turbopack lo rechaza en build), así que la constante vive acá
 * y las actions la importan desde este módulo.
 */
export const RECRUITER_PENDING_ERROR =
    "Cuenta recruiter pendiente de verificación. Completá la solicitud y te avisaremos por email.";
