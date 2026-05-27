# Skill: Arquitectura de Seguridad y Gobernanza Criptográfica

Este documento detalla las convenciones de desarrollo seguro, los estándares criptográficos aplicados y las buenas prácticas para proteger los datos confidenciales (API Keys, CVs) en **SkillRadar**.

---

## 🛠️ Arquitectura de Seguridad Implementada

### 1. Cifrado de Secretos (API Keys de LLMs)

Para que los usuarios puedan configurar sus propias claves de IA de forma ultra-segura, el proyecto implementa un criptosistema simétrico autenticado en `src/lib/crypto.ts`:

- **Algoritmo:** `aes-256-gcm`. Genera confidencialidad (cifrado) e integridad (autenticación) a través de un _Auth Tag_.
- **Derivación de Clave:** Se genera un hash SHA-256 a partir de la variable de entorno `ENCRYPTION_KEY` o `AUTH_SECRET` del servidor para obtener exactamente 32 bytes de clave simétrica.
- **Vector de Inicialización (IV):** Cada encriptación genera un IV aleatorio de 12 bytes (`crypto.randomBytes(12)`). Esto asegura que guardar la misma clave dos veces resulte en ciphertexts completamente distintos.
- **Regla de Oro en Frontend:** **Nunca** se debe enviar el texto cifrado o el IV al lado cliente. Las acciones del servidor y APIs solo deben retornar indicadores booleanos (ej. `hasGeminiKey: true`).

### 2. Privacidad de Currículums (CVs)

- **Carga Autorizada:** Todos los routers de subida en `src/lib/uploadthing.ts` están protegidos por middleware que valida la sesión activa (`await auth()`).
- **URLs Firmadas Temporales (Pre-signed):** No se exponen las URLs estáticas públicas del bucket CDN en el navegador. La acción `getSignedFileUrlAction` se encarga de solicitar a UploadThing una URL firmada temporal con **duración máxima de 1 hora**, limitando radicalmente la exposición pública de los currículums.

### 3. Blindaje contra Server-Side Request Forgery (SSRF)

Cuando el servidor descarga archivos para parsearlos mediante `fetch` (en `cv-analysis/actions.ts`), se aplica un filtro de reconstrucción estática robusto:

1.  Se valida la URL con una regex estricta de dominios permitidos (`utfs.io` y `ufs.sh`).
2.  Se valida el protocolo (`https:` estrictamente).
3.  Se extrae el `fileKey` y se desinfecta con la regex `/^[a-zA-Z0-9\-_.]+$/` para prevenir inyecciones de directorios (_Path Traversal_).
4.  Se reconstruye la URL final utilizando plantillas estáticas hardcodeadas en el servidor, bloqueando cualquier alteración del host o bypass de DNS.

---

## 🚀 Pautas para el Desarrollo de Nuevas Features

### A. Autenticación Híbrida Premium (Email + Contraseña)

Cuando se complete la integración de la **Tarjeta 8.2 (Credenciales Seguras)**:

- **Hashing (Bcrypt):** Las contraseñas se deben hashear en el registro usando `bcryptjs` con un factor de coste mínimo de **10 o 12 salt rounds**. Jamás persistir contraseñas en texto plano.
- **Validación Zod:** Obligar a contraseñas complejas en el registro (mínimo 8 caracteres, incluyendo mayúsculas, minúsculas y números).
- **Fuerza Bruta:** Proteger el endpoint de login de credenciales aplicando rate limiting por IP/email con Upstash Redis (máximo 5 intentos fallidos en 15 minutos).
- **Passkeys & 2FA:** A futuro, priorizar Passkeys biométricos para accesos sin contraseña y 2FA (TOTP) para la capa tradicional de credenciales. El "Magic Link" se reserva exclusivamente para la **Recuperación de Contraseña**.

### B. Route Handlers Externos (GitHub Analyzer)

- Cifrar cualquier access token de terceros que se persista en base de datos utilizando el módulo `crypto.ts`.
- Sanitizar todos los inputs de URLs de repositorios o nombres de usuario antes de realizar peticiones externas para prevenir SSRF e inyecciones HTTP.

### C. Plataforma Recruiter & Doble Ciego

- **Server-Only DTOs:** Si una postulación o perfil está en modo Doble Ciego (`status !== "accepted"`), el backend debe omitir estrictamente en su consulta SQL/Prisma los campos personales identificables (`PII`): `name`, `email`, `githubUsername` e `image`. No se debe enviar información PII oculta con CSS en el navegador.

---

## 🚨 Herramientas y Linters de Seguridad

- **Semgrep:** Integrado en el pipeline del proyecto (`npm run security:scan`). Ejecutar regularmente para escanear fallas OWASP comunes de forma estática en segundos.
- **SonarLint / Snyk:** Extensiones recomendadas en VS Code para detectar malas prácticas de codificación criptográfica y alertar sobre dependencias vulnerables en `node_modules` en tiempo real.
