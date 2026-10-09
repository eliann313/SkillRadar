/**
 * Instala el espejo nativo de hooks (scripts/githooks/) en .git/hooks/.
 *
 * Uso: `npm run hooks:install`
 *
 * Copia (no symlink: los symlinks exigen permisos extra en Windows) y
 * preserva el resto de hooks que ya existan. Alternativa opt-in a husky
 * para entornos donde su runner está bloqueado; husky queda intacto.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, chmodSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const gitDir = join(here, "..", "..", ".git");
const hooksDir = join(gitDir, "hooks");

if (!existsSync(gitDir)) {
    process.stderr.write("[hooks:install] No se encontró .git/ — ¿repo clonado correctamente?\n");
    process.exit(1);
}
mkdirSync(hooksDir, { recursive: true });

const installed = [];
for (const file of readdirSync(here)) {
    if (file === "install.mjs") continue;
    copyFileSync(join(here, file), join(hooksDir, file));
    try {
        chmodSync(join(hooksDir, file), 0o755);
    } catch {
        // Windows (Git Bash igual ejecuta .git/hooks por extensión/contenido)
    }
    installed.push(file);
}

process.stdout.write(`[hooks:install] Instalados en .git/hooks/: ${installed.join(", ") || "(ninguno)"}\n`);

// Husky v9 redirige los hooks vía `core.hooksPath=.husky/_`, lo que deja
// .git/hooks/ fuera de juego. Para que el espejo corra, hay que soltarlo
// (volver con `npm run prepare`, que re-ejecuta `husky`).
try {
    const current = execSync("git config --get core.hooksPath", { encoding: "utf8" }).trim();
    if (current) {
        execSync("git config --unset core.hooksPath", { stdio: "inherit" });
        process.stdout.write(`[hooks:install] core.hooksPath soltado (era "${current}"). Este clon usa .git/hooks/.\n`);
    }
} catch {
    // Sin hooksPath configurado: git ya usa .git/hooks/ por defecto.
}
process.stdout.write("[hooks:install] Restaurar husky: `npm run prepare`.\n");
