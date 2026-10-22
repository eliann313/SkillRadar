/**
 * Gate de auditoría: falla con vulnerabilidades high/critical nuevas.
 *
 * La única excepción es GHSA-vfj7-8cjw-p6xm (braces <=3.0.3), sin versión corregida.
 * Se alcanza por herramientas de desarrollo (shadcn y ESLint) y patrones de glob
 * controlados por el repositorio; shadcn queda en devDependencies.
 * TODO: quitar la excepción cuando upstream publique un parche.
 */
import { execSync } from "node:child_process";

const ALLOWLIST = new Set(["GHSA-vfj7-8cjw-p6xm"]);

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
    // (cadenas como shadcn → fast-glob → micromatch → braces).
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
