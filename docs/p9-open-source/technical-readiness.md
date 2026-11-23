# Plan de Apertura Open Source: Preparación Técnica y Seguridad
**Documento:** `technical-readiness.md`  
**Equipo B:** Yusuf (Auth, Security & History) y Yunus (Network Resilience & QA/CI)  
**Proyecto:** SchemAI — External Code & License Risk Analyzer  
**Fecha:** Noviembre 2026  

---

## 1. Revisión de la Estructura y Organización del Repositorio

El repositorio se ha organizado bajo una arquitectura desacoplada por dominios funcionales (Feature-Driven Architecture) con contratos estrictos de integración:

```text
extention/
├── .gitignore                   # Reglas estrictas de exclusión (build, .env, .vsix, .team-work)
├── README.md                    # Visión global y arquitectura
├── LICENSE                      # Licencia MIT verificada
├── package.json                 # Metadatos limpios (v0.1.0) sin scripts de publicación sensibles
├── FEATURES.md                  # Matriz de propiedad y gobernanza técnica
│
├── src/
│   ├── types.ts                 # Interfaces comunes (cero tipos 'any', contratos limpios)
│   ├── extension.ts             # Punto de entrada coordinado con contratos register()
│   ├── core/                    # Orquestación de ciclo de vida
│   ├── analysis/                # Tokenizador sintáctico y monitor de eventos
│   ├── search/                  # Cliente GitHub Code Search API
│   ├── licenses/                # Detección SPDX y evaluación de riesgo
│   ├── alerts/                  # Diagnósticos nativos y panel Webview
│   ├── config/                  # Lectura de settings y detección de LICENSE raíz
│   ├── auth/                    # Proveedor OAuth de VS Code
│   ├── security/                # SecretStorage para tokens cifrados
│   ├── history/                 # Almacenamiento local acotado (150 registros)
│   ├── network/                 # Cliente HTTP con rate-limiting y backoff
│   └── test/                    # Suite de pruebas unitarias y mocks
└── .github/workflows/           # Automatización de integración continua (CI)
```

**Valoración:** La separación en carpetas con un único punto de registro (`register(context: vscode.ExtensionContext)`) evita colisiones de código entre contribuidores externos y simplifica la incorporación de nuevos módulos.

---

## 2. Identificación de Secretos, Credenciales y Datos Sensibles

### 2.1. Auditoría del Código y Gestión de Parámetros Sensibles
- **Tokens de Usuario:** SchemAI requiere tokens de acceso de GitHub para superar el límite anónimo de la API (60 req/h). Históricamente en extensiones tempranas se guardaban en `settings.json` en texto plano. En SchemAI se ha implementado `SecretStorageManager` que utiliza la API nativa de VS Code (`ExtensionContext.secrets`), la cual delega el cifrado en el almacén de credenciales del sistema operativo (Windows Credential Manager, macOS Keychain, Linux Secret Service).
- **Sanitización de Logs:** Ningún log generado por `console.log` o `vscode.window.showErrorMessage` incluye cabeceras `Authorization` ni fragmentos completos de código del usuario.

### 2.2. Auditoría del Historial Git
- **Hallazgo Crítico:** En el entorno local existe un archivo `.env` que contiene un token de Open VSX (`OVSX_PAT=ovsxat_...`).
- **Verificación:** Se ha comprobado que `.gitignore` excluye `.env` y `.env.*`. Además, en la rama `develop` reinicializada como *orphan branch*, este archivo **no está rastreado**.
- **Acción Obligatoria antes de hacer público el repositorio:**
  1. Ejecutar una herramienta de escaneo de secretos profunda (`trufflehog` o `gitleaks`) sobre todo el árbol de commits de `main` y `develop`.
  2. Revocar y regenerar inmediatamente en el portal de Open VSX el token `OVSX_PAT` expuesto en local, tratándolo como potencialmente comprometido.

---

## 3. Revisión de Dependencias y Licencias de Terceros

### 3.1. Dependencias en `package.json`
El proyecto se ha diseñado intencionadamente con **cero dependencias en tiempo de ejecución (runtime dependencies)**. Utiliza exclusivamente APIs nativas de Node.js (`https`, `crypto`) y la API de VS Code (`vscode`):

```json
"devDependencies": {
  "@types/mocha": "^10.0.10",
  "@types/node": "^16.18.126",
  "@types/vscode": "^1.75.0",
  "mocha": "^10.8.2",
  "typescript": "^4.9.5"
}
```

### 3.2. Evaluación de Licencias de Dependencias
- `@types/*`: Licencia MIT (Permisiva).
- `mocha`: Licencia MIT (Permisiva).
- `typescript`: Licencia Apache-2.0 (Permisiva y compatible con MIT).
- **Conclusión:** No existe riesgo de contaminación por licencias de terceros en la distribución del código. `npm audit` reporta 0 vulnerabilidades.

---

## 4. Configuración de la Aplicación y Gestión de Parámetros

Los parámetros configurables por el usuario se gestionan mediante el esquema formal de `contributes.configuration` en `package.json`:
- `schemaAI.projectLicense`: Licencia de referencia del proyecto actual (por defecto: `"MIT"`). Si se deja vacía, se activa la autodeteción en `WorkspaceLicenseDetector`.
- `schemaAI.similarityThreshold`: Umbral numérico de coincidencia para disparar alertas (fijado internamente en 0.70).
- `schemaAI.githubToken`: Declarado explícitamente como `markdownDeprecationMessage` para forzar a los usuarios a utilizar la autenticación segura nativa.

**Valoración:** No existen URLs codificadas a servidores privados ni configuraciones dependientes de rutas absolutas locales de la máquina del desarrollador.

---

## 5. Tests, CI/CD y Automatización de Comprobaciones

### 5.1. Estado de la Suite de Tests
- Se dispone de pruebas unitarias para el analizador de código (`codeAnalyzer.test.ts`), el motor de riesgo (`riskEngine.test.ts`) y el gestor de historial (`historyManager.test.ts`).
- **Aislamiento de Red:** Todas las pruebas que involucran `sourceSearch` o `httpClient` emplean respuestas simuladas (*mocks*). Ningún test unitario realiza peticiones reales a la API de GitHub para garantizar que los tests pasen offline y sin agotar cuotas.

### 5.2. Pipeline de Integración Continua (GitHub Actions)
La automatización definida en `.github/workflows/` ejecuta en cada Push y PR a `develop`:
1. `compile`: Verificación de tipos con `tsc -p ./` en modo estricto.
2. `lint`: Análisis estático de código para evitar `any` y patrones inseguros.
3. `test`: Ejecución de suite Mocha en Node.js 18.x y 20.x sobre Linux y Windows.
4. `build-vsix`: Empaquetado de prueba de la extensión con `@vscode/vsce package` para garantizar que la extensión es empaquetable sin errores de empaquetado.

---

## 6. Tres Riesgos Técnicos Prioritarios a Resolver Antes de Publicar

### Riesgo Técnico 1: Denegación de Servicio por Rate-Limiting de GitHub API (HTTP 403 / 429)
- **Descripción:** Un usuario externo que instale la extensión y pegue múltiples fragmentos seguidos agotará la cuota de 60 peticiones/hora de GitHub en menos de 5 minutos si no está autenticado, lo que generará errores continuos.
- **Acción Correctora:** Implementar una cola con limitador de tasa local (*Token Bucket* o retardo forzado de 2 segundos entre consultas) y mostrar un aviso sutil sugiriendo iniciar sesión mediante VS Code Auth antes de desactivar temporalmente el escaneo automático.

### Riesgo Técnico 2: Bloqueo del Hilo de la UI de VS Code en Archivos Monolíticos
- **Descripción:** Si el usuario abre o pega un archivo generado automáticamente de más de 50.000 líneas (ej. bundles JS minimizados o volcados SQL), el cálculo síncrono de tokens y regex bloqueará la interfaz de usuario de VS Code.
- **Acción Correctora:** Introducir una cláusula de guarda estricta: abortar inmediatamente el análisis si el texto pegado supera los 100 KB o las 1.000 líneas, marcándolo como *"Snippet too large for inline analysis"*.

### Riesgo Técnico 3: Fuga de Información por URLs en Texto Plano en el Webview
- **Descripción:** El panel de `RiskCardPanel` renderiza HTML dinámico con enlaces directos a los repositorios de GitHub encontrados. Si un enlace malicioso fuera inyectado mediante un repositorio manipulado, podría causar problemas de seguridad en el Webview.
- **Acción Correctora:** Aplicar una política estricta de seguridad de contenidos (`Content-Security-Policy` / CSP) en el Webview impidiendo scripts inline no autorizados (`nonce`) y restringiendo la apertura de enlaces externos exclusivamente a través de `vscode.env.openExternal`.

