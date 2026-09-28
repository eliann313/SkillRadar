/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    // F4.2: reglas hexagonales en "error" (bloquean CI). La única excepción
    // es jobs/ports.ts → job-match/service (adaptador por defecto del puerto
    // MatchProvider): excluida de la regla general vía `pathNot` y auditada
    // por la regla informativa `hex-jobs-port-adapter` (+ ADR-002).
    // Todo borde nuevo feature-to-feature rompe el build.
    forbidden: [
        {
            name: "hex-no-feature-to-feature",
            severity: "error",
            comment:
                "Hexagonal: un feature nunca importa de otro feature. Compartir vía lib/shared-kernel o puerto explícito. Tests (*.test.*) pueden cablear adaptadores.",
            from: {
                path: "^src/features/([^/]+)/",
                pathNot: ["^src/features/jobs/ports\\.ts$", "\\.test\\."],
            },
            to: { path: "^src/features/", pathNot: "^src/features/$1/" },
        },
        {
            name: "hex-jobs-port-adapter",
            severity: "info",
            comment:
                "Excepción explícita y única (ADR-002 en docs/adr/0002-puerto-matching-jobs-jobmatch.md): el adaptador por defecto del puerto MatchProvider vive en job-match. Informativa: no bloquea.",
            from: { path: "^src/features/jobs/ports\\.ts$" },
            to: { path: "^src/features/" },
        },
        {
            name: "hex-no-app-in-features",
            severity: "error",
            comment:
                "Hexagonal: features no importan de app/ (adapters afuera). La UI vive en features/*/ui o screens.",
            from: { path: "^src/features/" },
            to: { path: "^src/app/" },
        },
        {
            name: "hex-no-features-in-infra",
            severity: "error",
            comment: "Hexagonal: lib/ infra y shared-kernel no dependen de features.",
            from: { path: "^src/lib/" },
            to: { path: "^src/features/" },
        },
        {
            name: "hex-no-db-in-components",
            severity: "error",
            comment: "Prisma solo vía features (repository/service) o route handlers. Componentes nunca tocan db.",
            from: { path: "^src/components/" },
            to: { path: "lib/db" },
        },
        {
            name: "no-circular",
            severity: "error",
            from: {},
            to: { circular: true },
        },
        {
            name: "no-orphans",
            severity: "error",
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
