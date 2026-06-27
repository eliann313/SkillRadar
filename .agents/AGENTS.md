# Reglas Operativas de SkillRadar

## Flujo de Trabajo con Ramas y Pull Requests (Git Workflow)

Para asegurar la estabilidad de la rama principal (`main`) y garantizar que el pipeline de Integración Continua (CI) valide correctamente todas las modificaciones antes de integrarlas:

1. **Ramas Separadas:** Todo desarrollo de tarjetas de trello (features, bugfixes, refactors) debe realizarse estrictamente en una rama dedicada con un prefijo correspondiente (ej. `feature/job-match-ui` o `bugfix/auth-flow`).
2. **Prohibido el Merge Directo a main:** El agente de IA no debe fusionar directamente sus ramas de características a `main` de forma local, ni hacer push directo a la rama `main` remota.
3. **Creación de Pull Requests (PR):**
    - Al finalizar la codificación, tests y linter, subir los cambios a la rama remota correspondiente.
    - Crear una Pull Request (PR) en GitHub apuntando a `main`.
    - Permitir que el pipeline de CI en GitHub valide la compilación.
4. **Fusión Exclusiva por el Usuario:** La fusión (merge) de la PR a `main` queda delegada al usuario. El agente no debe forzar la fusión automática en main sin revisión previa en la Pull Request.
