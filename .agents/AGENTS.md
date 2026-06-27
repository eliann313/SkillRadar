# Reglas Operativas de SkillRadar

## 🔀 Flujo de Trabajo con Ramas y Pull Requests (Git Workflow)

Para asegurar la estabilidad de la rama principal (`main`) y garantizar que el pipeline de Integración Continua (CI) valide correctamente todas las modificaciones antes de integrarlas:

1. **Rama Base `develop`:** Todo desarrollo atómico (features, bugfixes, refactors) debe basarse y crearse a partir de la rama `develop` (no `main`), a menos que el usuario indique lo contrario de forma explícita:
   `git checkout develop && git pull origin develop`
2. **Ramas Separadas:** Crear una rama dedicada con el prefijo correspondiente (ej. `feature/job-match-ui` o `bugfix/auth-flow`) a partir de `develop`:
   `git checkout -b feature/<nombre-de-tarjeta>`
3. **Prohibido el Merge Directo a main o develop:** El agente de IA no debe fusionar directamente sus ramas de características localmente, ni hacer push directo a la rama `main` o `develop` remotas.
4. **Creación de Pull Requests (PR):**
    - Al finalizar la codificación, tests y linter, subir los cambios a la rama remota correspondiente.
    - Crear una Pull Request (PR) en GitHub apuntando a `develop`.
    - Permitir que el pipeline de CI en GitHub valide la compilación.
5. **Fusión Exclusiva por el Usuario:** La fusión (merge) de la PR a `develop` queda delegada al usuario. El agente no debe forzar la fusión automática sin revisión previa en la Pull Request.

---

## 🛠️ Validación y Calidad de Código

1. **Chequeo de Tipos y Compilación Manual:**
    - Correr **siempre** el chequeo de tipos manualmente antes de subir la rama:
      `cmd /c npm run type-check`
    - Ejecutar los tests de regresión locales:
      `cmd /c npm run test`
2. **Husky Hooks (Pre-Commit):**
    - El proyecto tiene Husky y `lint-staged` configurados. Al ejecutar `git commit`, se ejecutarán automáticamente Prettier y ESLint sobre los archivos staged. No es necesario correrlos a mano antes.

---

## 📖 Reglas Específicas de Desarrollo (.cursor/rules/)

El asistente de IA debe consultar activamente y aplicar de forma obligatoria las políticas de seguridad, criptografía, base de datos e interfaz detalladas en los siguientes archivos del workspace:

- **[skillradar-security.mdc](file:///c:/Users/Usuario/Desktop/Proyectos%20de%20Desarrollo/skill-radar/.cursor/rules/skillradar-security.mdc)**: Cifrado AES-256-GCM, Auth Híbrida Premium, Privacidad de CVs (URLs firmadas, SSRF/Path Traversal Prevention) y Doble Ciego.
- **[skillradar-db.mdc](file:///c:/Users/Usuario/Desktop/Proyectos%20de%20Desarrollo/skill-radar/.cursor/rules/skillradar-db.mdc)**: Convenciones de consultas Prisma y esquemas.
- **[skillradar-ai.mdc](file:///c:/Users/Usuario/Desktop/Proyectos%20de%20Desarrollo/skill-radar/.cursor/rules/skillradar-ai.mdc)**: Inferencia con AIService multi-modelo y prompts de sistema pasivos.
- **[skillradar-nextjs16.mdc](file:///c:/Users/Usuario/Desktop/Proyectos%20de%20Desarrollo/skill-radar/.cursor/rules/skillradar-nextjs16.mdc)**: Convenciones de Next.js v16.2.6 y Tailwind v4.
