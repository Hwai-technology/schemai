# Asignación de Tareas: Práctica P9 — Preparación del Proyecto para Open Source

**Asignatura:** Gestión de Proyectos Software  
**Proyecto:** SchemAI — External Code & License Risk Analyzer (Extensión VS Code)  
**Entorno de Trabajo:** `.team-work/`  
**Directorio de Informes Oficiales:** [`docs/p9-open-source/`](../docs/p9-open-source/)  

---

## 👥 Organización de Sub-equipos (4 Equipos de 2 Personas)

Los 8 integrantes del equipo se organizan en 4 sub-equipos de trabajo basados en sus áreas de responsabilidad técnica en SchemAI:

### 1. Equipo A: Estrategia y Alcance
- **Integrantes:** **Ahmet** (Coordinador General) y **Alexander**
- **Módulos Técnicos en `.team-work/`:** `src/core/`, `src/analysis/`, `src/search/`
- **Entregable Oficial:** [`docs/p9-open-source/open-source-strategy.md`](../docs/p9-open-source/open-source-strategy.md)
- **Responsabilidades en P9:**
  - Definir el objetivo estratégico de abrir SchemAI y los beneficios de transparencia y confianza.
  - Decidir qué componentes se publican en v0.1.0 y cuáles quedan retenidos (excluir dashboard experimental HU-16 y claves de despliegue).
  - Identificar perfiles de usuarios (desarrolladores individuales, maintainers de OSS) y colaboradores.
  - Evaluar la madurez actual del software y establecer las 3 prioridades críticas de apertura.

---

### 2. Equipo B: Preparación Técnica y Seguridad
- **Integrantes:** **Yusuf** y **Yunus**
- **Módulos Técnicos en `.team-work/`:** `src/auth/`, `src/security/`, `src/history/`, `src/network/`, `src/test/`
- **Entregable Oficial:** [`docs/p9-open-source/technical-readiness.md`](../docs/p9-open-source/technical-readiness.md)
- **Responsabilidades en P9:**
  - Auditar la estructura y modularidad del repositorio.
  - Higienizar secretos y credenciales (verificar que `.env` esté fuera del historial y emplear `SecretStorage`).
  - Revisar dependencias de terceros y verificar la ausencia de licencias incompatibles en `package.json`.
  - Definir la configuración segura de parámetros y automatización de CI/CD con mocks de red.
  - Mitigar los 3 riesgos técnicos críticos (Rate-limiting de GitHub API, bloqueo de UI en archivos grandes, CSP en Webviews).

---

### 3. Equipo C: Licencia, Documentación y Colaboración
- **Integrantes:** **David** y **Abdul**
- **Módulos Técnicos en `.team-work/`:** `src/licenses/`, `src/alerts/`
- **Entregable Oficial:** [`docs/p9-open-source/community-readiness.md`](../docs/p9-open-source/community-readiness.md)
- **Responsabilidades en P9:**
  - Ratificar y justificar la elección de la **Licencia MIT**.
  - Diseñar el contenido mínimo y la estructura visual del `README.md`.
  - Establecer el procedimiento de reporte de bugs, nuevas funciones y falsos positivos en GitHub Issues.
  - Redactar las normas de contribución (`CONTRIBUTING.md`) exigiendo TDD y flujo de ramas desde `develop`.
  - Proponer el Código de Conducta (Contributor Covenant v2.1) y seleccionar 3 tareas accesibles para *good first issue*.

---

### 4. Equipo D: Gobernanza y Sostenibilidad
- **Integrantes:** **Leon** y **Sergio**
- **Módulos Técnicos en `.team-work/`:** `src/config/`, `src/llm/`, `src/quickfix/`
- **Entregable Oficial:** [`docs/p9-open-source/governance-and-sustainability.md`](../docs/p9-open-source/governance-and-sustainability.md)
- **Responsabilidades en P9:**
  - Diseñar y justificar el modelo de gobernanza (**Steering Committee Híbrido** con Ahmet como Project Lead).
  - Formalizar la matriz de CODEOWNERS y el proceso de revisión y aprobación de Pull Requests.
  - Establecer el protocolo de resolución de desacuerdos técnicos y mitigación del factor de abandono (*Bus Factor*).
  - Identificar 3 riesgos de continuidad y proponer el modelo de sostenibilidad (Open Core y Donaciones/Sponsors).

---

## 🌐 Entregable Común: Plan de Lanzamiento Integrado
- **Participantes:** Todo el equipo conjuntamente (8 desarrolladores)
- **Entregable Oficial:** [`docs/p9-open-source/open-source-launch-plan.md`](../docs/p9-open-source/open-source-launch-plan.md)
- **Contenido Integrado:**
  - **Actividad 1:** Visión compartida del proyecto y alcance de la apertura.
  - **Actividad 3:** Roadmap oficial de apertura (Antes de publicar, Primera publicación v0.1.0, Post-lanzamiento) y 4 indicadores clave de salud comunitaria.
  - **Actividad 4:** Respuestas conjuntas y fundamentadas a las 4 preguntas críticas de viabilidad y cierre.
