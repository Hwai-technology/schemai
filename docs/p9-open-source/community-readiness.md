# Plan de Apertura Open Source: Licencia, Documentación y Comunidad
**Documento:** `community-readiness.md`  
**Equipo C:** David (Licenses & Risk Engine) y Abdul (Alerts & UI Diagnostics)  
**Proyecto:** SchemAI — External Code & License Risk Analyzer  
**Fecha:** Noviembre 2026  

---

## 1. Elección de la Licencia y Justificación

### 1.1. Licencia Seleccionada: **MIT License**
Se ha ratificado formalmente la adopción de la licencia **MIT** para el proyecto SchemAI, cuyo texto oficial se encuentra verificado en el archivo [`LICENSE`](../../LICENSE):

```text
MIT License
Copyright (c) 2026 SchemAI Team
...
```

### 1.2. Justificación de la Elección
1. **Coherencia con el Ecosistema:** Más del 85% de las extensiones populares del VS Code Marketplace se distribuyen bajo la licencia MIT. Adoptarla garantiza que los desarrolladores y las empresas puedan instalar y probar SchemAI en sus estaciones de trabajo corporativas sin temor a restricciones de uso.
2. **Máxima Adopción y Reutilización:** Dado que SchemAI es una herramienta que analiza la compatibilidad de licencias, resultaría contradictorio imponer una licencia restrictiva o con copyleft fuerte (como GPL-3.0) que disuadiera a equipos que desarrollan software privativo o bajo licencias permisivas de utilizar o contribuir a la herramienta.
3. **Simplicidad Legal:** La licencia MIT proporciona una exención de responsabilidad legal clara (*AS IS, WITHOUT WARRANTY OF ANY KIND*), protegiendo al equipo de estudiantes y desarrolladores frente a eventuales reclamaciones si una sugerencia de compatibilidad de licencias fuera inexacta.

---

## 2. Contenido Mínimo y Estructura del README.md

El archivo `README.md` principal en la raíz debe actuar como el escaparate del proyecto y debe estructurarse obligatoriamente con las siguientes secciones:

1. **Badges de Estado:** Estado de la build de GitHub Actions (CI), versión actual (v0.1.0), licencia (MIT) y compatibilidad de VS Code (`^1.75.0`).
2. **Propósito en 3 Líneas:** Descripción concisa del problema que resuelve: evitar la contaminación accidental de licencias al copiar código de terceros en el editor.
3. **Demostración Visual (GIF / Mockup):** Imagen o animación corta que muestre:
   - El evento de pegado de código.
   - El subrayado ondulado rojo y la caja de código parpadeante.
   - La ventana de información flotante (Hover) y la tarjeta interactiva de riesgo (`RiskCardPanel`).
4. **Instalación Rápida:**
   - Opción A: Desde VS Code Marketplace / Open VSX.
   - Opción B: Instalación manual del archivo `.vsix` desde los Releases de GitHub.
5. **Guía de Uso Rápido (3 Pasos):**
   - Paso 1: Abrir un archivo en VS Code.
   - Paso 2: Pegar un fragmento de código externo o seleccionarlo y pulsar `Ctrl+Shift+P` -> *SchemAI: Analyze Selected Code*.
   - Paso 3: Revisar la compatibilidad de la licencia detectada frente a la política de tu proyecto.
6. **Compromiso de Privacidad:** Explicación explícita de qué datos se procesan localmente y qué se consulta en GitHub.
7. **Enlaces a Recursos Comunitarios:** Enlaces directos a `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` y `CHANGELOG.md`.

---

## 3. Procedimiento para Reportar Bugs y Proponer Funcionalidades

Para estandarizar las aportaciones y evitar reportes incompletos, se implementan **Plantillas de GitHub Issues** (`.github/ISSUE_TEMPLATE/`):

### 3.1. Reporte de Errores (Bug Report Template)
Campos obligatorios:
- Descripción clara del comportamiento erróneo frente al esperado.
- Lenguaje del archivo analizado y fragmento de código mínimo que reproduce el fallo.
- Versión de VS Code y versión de la extensión SchemAI.
- Sistema operativo (Windows, macOS, Linux).
- Logs relevantes de la consola de desarrollo de VS Code (`Help > Toggle Developer Tools`).

### 3.2. Reporte Específico de Falsos Positivos (False Positive Report)
*Plantilla especializada esencial para el dominio de SchemAI:*
- Fragmento de código que generó una alerta indebida.
- Licencia erróneamente atribuida vs. licencia real esperada.
- Enlace al repositorio de origen si se conoce.

### 3.3. Propuesta de Funcionalidades (Feature Request Template)
- Problema o caso de uso que no está cubierto actualmente.
- Solución propuesta y posibles alternativas consideradas.
- Disposición del usuario a implementar la mejora mediante un Pull Request.

---

## 4. Normas para Pull Requests (CONTRIBUTING.md)

Para mantener la integridad y la calidad arquitectónica del proyecto, toda contribución debe respetar las siguientes normas:

1. **Flujo de Ramas:**
   - La rama base para cualquier aportación es obligatoriamente **`develop`**. Los PRs abiertos directamente contra `main` serán rechazados automáticamente.
   - El nombre de la rama de la feature debe seguir la convención: `feature/<issue-number>-<short-description>`.
2. **Metodología Test-Driven Development (TDD):**
   - El primer commit del PR debe contener la prueba unitaria que falla o demuestra la nueva funcionalidad (Fase Roja).
   - Los commits posteriores aportan la implementación mínima para hacer pasar la prueba (Fase Verde).
3. **Respeto a la Propiedad de Módulos (CODEOWNERS):**
   - Cada PR debe modificar únicamente el módulo relevante para su tarea.
   - Las modificaciones a los archivos de coordinación central (`src/types.ts` y `src/extension.ts`) requieren la aprobación explícita del Coordinador General (Ahmet).
4. **Verificación Automática:**
   - El PR debe superar la compilación estricta de TypeScript (`npm run compile`), el linter (`npm run lint`) y el 100% de los tests unitarios en la suite de CI de GitHub Actions.
   - Cobertura de tests: no se admiten cambios que reduzcan la cobertura global de pruebas.

---

## 5. Código de Conducta (Code of Conduct)

Se adopta formalmente el estándar de la industria **Contributor Covenant versión 2.1**:
- **Compromiso:** Fomentar un entorno abierto, acogedor, diverso e integrador para cualquier persona que participe en el proyecto, con independencia de su nivel de experiencia, género, identidad u origen.
- **Comportamientos Inaceptables:** Acoso, insultos descalificativos, lenguaje discriminatorio o publicación no consentida de información privada.
- **Canal de Denuncia y Moderación:** Para reportar incidencias de conducta que afecten al proyecto, se designa una dirección de contacto neutral gestionada por el Steering Committee: `conduct@schemai.org` (o reporte privado directo a los maintainers). Las resoluciones se comunicarán de forma confidencial en un plazo máximo de 48 horas.

---

## 6. Selección de Tres Tareas para "Good First Issue"

Para facilitar la incorporación de colaboradores externos noveles (*onboarding*), se han seleccionado y acotado tres tareas que no requieren un conocimiento profundo de la arquitectura global:

### Tarea 1: Añadir Identificadores SPDX para Licencias Débiles (MPL-2.0 y LGPL-3.0)
- **Módulo Afectado:** `src/licenses/`
- **Dificultad:** Baja (Ideal para principiantes).
- **Descripción:** Ampliar el conjunto de constantes en `compatibilityMatrix.ts` para reconocer formalmente los identificadores SPDX de Mozilla Public License 2.0 y GNU Lesser General Public License 3.0, clasificándolas como `COPYLEFT_WEAK`.
- **Criterio de Aceptación:** Añadir 4 casos de prueba en `riskEngine.test.ts` verificando que estas licencias emiten el aviso de riesgo `WARNING` cuando el proyecto es `MIT`.

### Tarea 2: Implementar Lista de Extensiones Ignoradas por Configuración
- **Módulo Afectado:** `src/config/` y `src/analysis/`
- **Dificultad:** Baja-Media.
- **Descripción:** Añadir una nueva propiedad en `package.json` (`schemaAI.ignoredExtensions`) con valor por defecto `[".min.js", ".bundle.js", ".map", ".lock"]`. Modificar `pasteMonitor.ts` para que omita el análisis de texto si el documento activo coincide con estas extensiones.
- **Criterio de Aceptación:** Prueba unitaria en `codeAnalyzer.test.ts` comprobando que los archivos ignorados no encolan peticiones en `analysisQueue`.

### Tarea 3: Añadir Botón "Copiar Atribución" en la Vista HTML de Risk Card
- **Módulo Afectado:** `src/alerts/riskCardPanel.ts`
- **Dificultad:** Baja (Enfocada en frontend / HTML / JS).
- **Descripción:** En la vista del Webview de la tarjeta de riesgo, incorporar un botón con icono de portapapeles que copie al portapapeles del sistema una cabecera de comentario con el autor, repositorio y licencia detectada.
- **Criterio de Aceptación:** Verificación visual en la vista Webview y prueba de llamada al comando nativo del portapapeles.

