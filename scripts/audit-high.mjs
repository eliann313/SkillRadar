/**
 * Gate de auditoría: falla con vulnerabilidades high/critical NUEVAS.
 *
 * Allowlist (transitivas de prisma@7, sin fix no-breaking;cubiertas por Dependabot):
 * - GHSA-ggr8-5vv4-36mx (deepmerge-ts <8 vía @prisma/config; fix exige prisma@6, breaking)
 * - GHSA-3f6p-5ww8-9rcr (mysql2 vía prisma; idem)
 * - GHSA-rgwj-5xj2-c3m3 (mysql2 vía prisma; idem)
 * TODO: eliminar la allowlist cuando Prisma adopte deepmerge-ts@8.
 *
 * Allowlist (CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm, braces<=3.0.3, SIN PARCHE):
 * - DoS por stack-exhaustion solo con patrones glob adversarios; en este repo
 *   braces solo se alcanza en build/lint/dev (fast-glob/micromatch vía shadcn,
 *   eslint, tailwind, ts-morph), nunca con input de usuario en runtime/prod.
 * TODO: quitar de la allowlist cuando micromatch/braces publique parche;
 * Dependabot alertará (package-lock) y el gate volverá a exigir el fix.
 */
import { execSync } from "node:child_process";

const ALLOWLIST = new Set(["GHSA-ggr8-5vv4-36mx", "GHSA-3f6p-5ww8-9rcr", "GHSA-rgwj-5xj2-c3m3", "GHSA-vfj7-8cjw-p6xm"]);

// Sin console.* (regla no-console del repo): salida vía stdout/stderr.
function out(line) {
    process.stdout.write(`${line}\n`);
}

function err(line) {
    process.stderr.write(`${line}\n`);
}

function classify(spec) {
    // npm audit --json: advisories en `vulnerabilities` (npm v10+) o `advisories` (v6)
    const vulns = spec.vulnerabilities ?? spec.advisories ?? {};
    const flagged = [];
    const allowed = [];
    const pending = [];
    for (const [name, v] of Object.entries(vulns)) {
        const severity = v.severity ?? "";
        if (severity !== "high" && severity !== "critical") continue;
        const urls = Array.isArray(v.via) ? v.via.filter((x) => typeof x === "object" && x.url).map((x) => x.url) : [];
        const entry = { name, severity, urls };
        if (urls.length === 0) {
            // Nodo padre (ej. prisma, @prisma/config): hereda severidad de sus
            // dependencias vulnerables. Se resuelve en segunda pasada.
            pending.push({ entry, refs: (v.via ?? []).filter((x) => typeof x === "string") });
        } else if (urls.length > 0 && urls.every((url) => [...ALLOWLIST].some((id) => url.includes(id)))) {
            // Endurecido: TODAS las URLs deben estar allowlisteadas. Con `some`,
            // un paquete con 2 advisories (uno conocido + uno nuevo) enmascaraba el nuevo.
            allowed.push(entry);
        } else {
            flagged.push(entry);
        }
    }
    const allowedNames = new Set(allowed.map((a) => a.name));
    // Punto fijo: los padres se allowlistean cuando TODAS sus refs ya lo están
    // (cadenas como prisma → @prisma/config → deepmerge-ts).
    let changed = true;
    const remaining = [...pending];
    while (changed && remaining.length > 0) {
        changed = false;
        for (let i = remaining.length - 1; i >= 0; i--) {
            const { entry, refs } = remaining[i];
            if (refs.length > 0 && refs.every((r) => allowedNames.has(r))) {
                allowedNames.add(entry.name);
                allowed.push(entry);
                remaining.splice(i, 1);
                changed = true;
            }
        }
    }
    for (const { entry } of remaining) {
        flagged.push(entry);
    }
    return { flagged, allowed };
}

let raw;
try {
    raw = execSync("npm audit --json", { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
} catch (err) {
    // npm audit sale con código != 0 cuando hay vulnerabilidades, pero igual imprime el JSON
    raw = err.stdout?.toString() ?? "";
}
if (!raw.trim()) {
    err("[audit:high] npm audit no devolvió JSON.");
    process.exit(2);
}

const { flagged, allowed } = classify(JSON.parse(raw));

for (const a of allowed) {
    out(`[audit:high] allowlist: ${a.name} [${a.severity}] ${a.urls.join(", ")}`);
}
if (flagged.length > 0) {
    err("[audit:high] vulnerabilidades high/critical NO allowlisteadas:");
    for (const f of flagged) {
        err(`  - ${f.name} [${f.severity}] ${f.urls.join(", ")}`);
    }
    process.exit(1);
}
out("[audit:high] OK: sin vulnerabilidades high/critical fuera de la allowlist.");
