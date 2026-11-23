# Práctica P9 — Preparación del Proyecto para Open Source
**Asignatura:** Gestión de Proyectos Software  
**Proyecto Real:** SchemAI — External Code & License Risk Analyzer (VS Code Extension)  
**Organización:** Hwai-technology / SchemAI Team  
**Fecha:** Noviembre 2026  

---

## 📋 Estructura de Equipos y Entregables (8 Personas en 4 Sub-equipos)

| Sub-equipo | Integrantes | Rol en el Proyecto | Entregable |
|---|---|---|---|
| **Equipo A** | **Ahmet** (Coord) & **Alexander** | Core / Analysis / Search API | [`open-source-strategy.md`](./open-source-strategy.md) |
| **Equipo B** | **Yusuf** & **Yunus** | Auth / Security / Network / CI | [`technical-readiness.md`](./technical-readiness.md) |
| **Equipo C** | **David** & **Abdul** | Licenses / Alerts / UI Diagnostics | [`community-readiness.md`](./community-readiness.md) |
| **Equipo D** | **Leon** & **Sergio** | Config / Policies / LLM / QuickFix | [`governance-and-sustainability.md`](./governance-and-sustainability.md) |
| **Todo el Grupo** | **Equipo Completo (8 personas)** | Dirección Conjunta | [`open-source-launch-plan.md`](./open-source-launch-plan.md) |

---

## 🎯 Índice de Documentos Entregables

1. [**Equipo A: Estrategia y Alcance (`open-source-strategy.md`)**](./open-source-strategy.md):
   - Justificación de la apertura de SchemAI.
   - Perfil de usuarios y colaboradores objetivo.
   - Delimitación de componentes públicos vs. retenidos.
   - Evaluación del estado de madurez.
   - Las tres prioridades críticas para el éxito de la apertura.

2. [**Equipo B: Preparación Técnica y Seguridad (`technical-readiness.md`)**](./technical-readiness.md):
   - Higienización del repositorio y auditoría de secretos (SecretStorage vs. tokens en git).
   - Revisión de dependencias de terceros y licencias.
   - Gestión de parámetros y configuración de VS Code.
   - Automatización de tests y CI/CD sin consumo de API en testing.
   - Tres riesgos técnicos prioritarios antes de publicar.

3. [**Equipo C: Licencia, Documentación y Colaboración (`community-readiness.md`)**](./community-readiness.md):
   - Elección y justificación de la licencia MIT.
   - Contenido mínimo del README orientado a adopción.
   - Procedimiento de reporte de incidencias y falsos positivos.
   - Normas de colaboración (TDD en PRs, branching model).
   - Adopción de Código de Conducta.
   - Selección de tres tareas categorizadas como *good first issue*.

4. [**Equipo D: Gobernanza y Sostenibilidad (`governance-and-sustainability.md`)**](./governance-and-sustainability.md):
   - Elección justificada del modelo de gobernanza (Steering Committee híbrido con Project Lead).
   - Matriz de CODEOWNERS y flujo de revisión de cambios.
   - Protocolo de resolución de conflictos y mitigación del factor de abandono (*Bus Factor*).
   - Tres riesgos de continuidad y planes de contingencia.
   - Modelo de sostenibilidad Open Core y donaciones.

5. [**Entregable Común: Plan de Lanzamiento Integrado (`open-source-launch-plan.md`)**](./open-source-launch-plan.md):
   - Actividad 1: Visión compartida del proyecto.
   - Roadmap de apertura (Antes de publicar, Primera publicación v0.1.0, Post-lanzamiento).
   - Cuatro indicadores de salud de la comunidad y actuaciones correctoras.
   - Actividad 4: Cierre con respuestas a las 4 preguntas críticas de viabilidad.

