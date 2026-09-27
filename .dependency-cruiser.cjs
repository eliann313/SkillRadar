/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    // NOTA: severidades en "warn" hasta completar la migración hexagonal (F4.2);
    // después se suben a "error" y bloquean CI.
    // Excepción conocida (1 warn): jobs/service → job-match/service vía import
    // dinámico en getOrCalculateMatchScore. F4.2 lo extrae a puerto en
    // lib/shared-kernel con inyección desde la capa de aplicación.
    forbidden: [
        {
            name: "hex-no-feature-to-feature",
            severity: "warn",
            comment:
                "Hexagonal: un feature nunca importa de otro feature. Compartir vía lib/shared-kernel o servicio explícito.",
            from: { path: "^src/features/([^/]+)/" },
            to: { path: "^src/features/", pathNot: "^src/features/$1/" },
        },
        {
            name: "hex-no-app-in-features",
            severity: "warn",
            comment:
                "Hexagonal: features no importan de app/ (adapters afuera). La UI vive en features/*/ui o screens.",
            from: { path: "^src/features/" },
            to: { path: "^src/app/" },
        },
        {
            name: "hex-no-features-in-infra",
            severity: "warn",
            comment: "Hexagonal: lib/ infra y shared-kernel no dependen de features.",
            from: { path: "^src/lib/" },
            to: { path: "^src/features/" },
        },
        {
            name: "hex-no-db-in-components",
            severity: "warn",
            comment: "Prisma solo vía features (repository/service) o route handlers. Componentes nunca tocan db.",
            from: { path: "^src/components/" },
            to: { path: "lib/db" },
        },
        {
            name: "no-circular",
            severity: "warn",
            from: {},
            to: { circular: true },
        },
        {
            name: "no-orphans",
            severity: "warn",
            comment: "Archivo sin importadores (excluye entry points, tests y .d.ts): candidato a borrar (ver knip).",
            from: { path: "^src/", pathNot: ["^src/app/", "\\.test\\.", "\\.spec\\.", "\\.d\\.ts$"], orphan: true },
            to: {},
        },
    ],
    options: {
        doNotFollow: { path: "node_modules" },
        tsPreCompilationDeps: true,
        tsConfig: { fileName: "tsconfig.json" },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],
        },
        reporterOptions: {
            text: { highlightFocused: true },
        },
    },
};
