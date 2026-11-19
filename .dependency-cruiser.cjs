/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    // Los features se conectan mediante puertos y un punto de composición externo.
    forbidden: [
        {
            name: "hex-no-feature-to-feature",
            severity: "error",
            comment:
                "Hexagonal: un feature nunca importa de otro feature. Compartir vía lib/shared-kernel o puerto explícito. Tests (*.test.*) pueden cablear adaptadores.",
            from: {
                path: "^src/features/([^/]+)/",
                pathNot: ["\\.test\\."],
            },
            to: { path: "^src/features/", pathNot: "^src/features/$1/" },
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
            from: { path: "^src/(lib|infrastructure|shared-kernel)/" },
            to: { path: "^src/features/" },
        },
        {
            name: "hex-shared-kernel-pure",
            severity: "error",
            comment:
                "Hexagonal: shared-kernel es puro (sin IO ni framework). No importa de infrastructure, features, app ni components.",
            from: { path: "^src/shared-kernel/" },
            to: { path: "^src/(infrastructure|features|app|components)/" },
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
