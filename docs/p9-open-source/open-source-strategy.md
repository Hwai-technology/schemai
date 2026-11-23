# Plan de Apertura Open Source: Estrategia y Alcance
**Documento:** `open-source-strategy.md`  
**Equipo A:** Ahmet (Coordinador General & Análisis) y Alexander (Search API & Matching)  
**Proyecto:** SchemAI — External Code & License Risk Analyzer  
**Fecha:** Noviembre 2026  

---

## 1. Objetivo de Abrir el Proyecto y Beneficios Esperados

### 1.1. ¿Por qué abrir SchemAI?
SchemAI es una extensión de Visual Studio Code cuyo propósito es auditar código fuente pegado o seleccionado en tiempo real, contrastarlo con repositorios públicos de GitHub y evaluar el riesgo de incompatibilidad de licencias (especialmente contaminación por copyleft como GPL/AGPL frente a políticas permisivas como MIT o Apache-2.0).

En una herramienta de auditoría de código y cumplimiento legal, **la confianza es el factor determinante**:
1. **Auditoría de confianza:** Ningún desarrollador o empresa aceptaría instalar una extensión de código cerrado que analice los fragmentos de código que manipula en su editor sin poder verificar qué datos salen de su máquina. Abrir el código fuente demuestra que SchemAI únicamente extrae tokens sintácticos y que no transmite propiedad intelectual privada a servidores ajenos.
2. **Efecto de red en detección de licencias:** El ecosistema de licencias open source (SPDX, dual licensing, excepciones de classpath) es inmenso y evoluciona constantemente. Solo mediante una comunidad abierta de desarrolladores y juristas de software libre es posible mantener actualizadas las heurísticas y matrices de compatibilidad.

### 1.2. Beneficios Esperados
- **Validación comunitaria del motor de similitud:** Mejorar el algoritmo de tokenización y similitud Jaccard mediante retroalimentación de la comunidad en múltiples lenguajes (TypeScript, Python, Java, C++, Go, Rust).
- **Adopción orgánica:** Facilitar su distribución en el Marketplace oficial de VS Code y en Open VSX sin barreras de entrada.
- **Contribución en reglas legales:** Atraer a especialistas en licenciamiento open source para refinar la matriz de compatibilidad de licencias sin coste de consultoría legal directa.

---

## 2. Componentes que se Publican y Componentes que Quedan Fuera

| Componente | Estado de Publicación | Justificación Técnica y de Negocio |
|---|---|---|
| **Core & Coordinator (`src/core/`)** | **Se Publica** | Infraestructura base del ciclo de vida de la extensión y orquestación de servicios. Imprescindible para que funcione. |
| **Code Analyzer & Paste Monitor (`src/analysis/`)** | **Se Publica** | Algoritmos de extracción de tokens, cálculo de huella digital SHA-256 y listeners de eventos de editor (`onDidChangeTextDocument`). |
| **GitHub Search Client (`src/search/`)** | **Se Publica** | Conector con la API pública de GitHub Code Search y verificación de similitud auténtica (>= 70%). |
| **License Detector & Risk Engine (`src/licenses/`)** | **Se Publica** | Base de datos de identificadores SPDX y matriz de compatibilidad algorítmica. Debe ser auditable por la comunidad. |
| **Alerts & Diagnostics (`src/alerts/`)** | **Se Publica** | Renderizado de diagnósticos nativos, decoraciones visuales en el editor y la tarjeta interactiva Webview (`RiskCardPanel`). |
| **Config & Policy (`src/config/`)** | **Se Publica** | Lógica de detección automática de `LICENSE` en el workspace del usuario y configuración en `settings.json`. |
| **Auth & Security (`src/auth/`, `src/security/`)** | **Se Publica** | Integración nativa con `vscode.authentication` y `SecretStorage`. Esencial que la comunidad audite que no se filtran credenciales. |
| **Network Client (`src/network/`)** | **Se Publica** | Manejo de rate-limits (403/429) y políticas de reintento. |
| **Dashboard y Sidebar Completo (HU-16 / Prototipo)** | **QUEDA FUERA (Retenido)** | El dashboard interactivo estilo cyberpunk y el árbol de auditoría histórica global se mantienen en el prototipo experimental. No está estabilizado para Sprint 1 y añadiría deuda técnica innecesaria en el lanzamiento inicial. |
| **Firmas propietarias / Heurísticas de clientes corporativos** | **QUEDA FUERA (Retenido)** | Reglas de políticas exclusivas de empresas o firmas de bases de datos cerradas se reservan para una futura versión comercial (Open Core). |
| **Claves y Credenciales de Despliegue (`.env`, Release Tokens)** | **QUEDA FUERA (Excluido estrictamente)** | Tokens de publicación en Marketplace (`OVSX_PAT`, GitHub Release tokens) jamás deben formar parte del repositorio público. |

---

## 3. Identificación de Usuarios y Colaboradores Potenciales

### 3.1. Usuarios Objetivo
- **Desarrolladores Individuales / Freelancers:** Profesionales que integran bibliotecas o fragmentos de código de StackOverflow/GitHub y desean evitar infracciones involuntarias de copyright.
- **Tech Leads y Maintainers de Proyectos Open Source:** Líderes de proyectos permisivos (MIT/Apache) que necesitan asegurarse de que los Pull Requests recibidos de terceros no introduzcan código bajo licencias copyleft estrictas (GPL-3.0/AGPL).
- **Estudiantes y Entornos Académicos:** Alumnos de ingeniería de software que aprenden sobre propiedad intelectual y reutilización ética de código.

### 3.2. Colaboradores Potenciales
- **Especialistas en Licenciamiento y Legal Tech:** Personas interesadas en ampliar la taxonomía SPDX y casos límite de compatibilidad (ej. licencias débiles como MPL-2.0, LGPL-3.0).
- **Desarrolladores del Ecosistema VS Code / TypeScript:** Programadores que deseen optimizar el rendimiento del Webview o añadir soporte a nuevos lenguajes de programación.
- **Investigadores en Detección de Plagio de Código:** Académicos que puedan aportar heurísticas de detección más avanzadas (ej. normalización de AST frente a tokenización léxica).

---

## 4. Madurez del Proyecto y Funcionalidades no Preparadas

### 4.1. Evaluación del Estado Actual
El proyecto se encuentra en fase **Sprint 1 (pre-v0.1.0)**. Cuenta con un prototipo funcional validado en la rama `prototype` (`main`), pero la base de código para el lanzamiento oficial se ha reinicializado desde cero en la rama `develop` para garantizar trazabilidad, modularidad estricta y pruebas automáticas (TDD).

### 4.2. Funcionalidades NO Preparadas para Publicación
1. **Módulo de Explicaciones LLM (`src/llm/` / HU-14):**
   - *Estado:* En fase conceptual de prompt engineering.
   - *Motivo:* Requiere que el usuario proporcione su propia API key de OpenAI/Claude/Gemini o depender de un proxy centralizado que actualmente no tenemos desplegado. Publicarlo hoy generaría errores de ejecución y expectativas insatisfechas.
2. **Acciones Rápidas Automatizadas (`src/quickfix/` / HU-15):**
   - *Estado:* En diseño.
   - *Motivo:* La inserción automática de cabeceras de atribución en el código del usuario requiere pruebas exhaustivas de formato de comentarios para evitar corromper la sintaxis de ficheros en lenguajes complejos (ej. macros en C++ o decoradores en Python).
3. **Persistencia Histórica Avanzada (HU-16):**
   - *Estado:* Retenida en el prototipo.
   - *Motivo:* Puede causar sobrecarga en `workspaceState` si no se optimiza el límite circular de almacenamiento.

---

## 5. Tres Prioridades para que la Apertura Tenga Éxito

### Prioridad 1: Transparencia Radical en Privacidad y Telemetría
- **Acción:** Redactar y publicar en la raíz del repositorio un documento claro de **Declaración de Privacidad del Código** (`PRIVACY.md`) explicando que SchemAI nunca envía el contenido de los archivos del usuario a ningún servidor propio, y que solo se consultan identificadores sintácticos anonimizados contra la API pública de GitHub.

### Prioridad 2: Experiencia Out-of-the-Box Sin Fricción
- **Acción:** Garantizar que la extensión sea funcional de forma inmediata tras instalar el paquete `.vsix` sin exigir autenticación obligatoria con cuenta de GitHub. El modo anónimo debe operar con degradación elegante si se alcanza el límite de peticiones de GitHub (60 peticiones/hora).

### Prioridad 3: Estabilidad de Rendimiento y Cero Falsos Positivos Intrusivos
- **Acción:** Calibrar el umbral de similitud (estricto en >= 70%) y requerir al menos 4 identificadores distintivos de longitud >= 6 caracteres para evitar disparar alertas molestas ante código genérico (ej. bucles for o asignaciones de variables comunes).

---

## 6. Riesgos Identificados y Acciones Pendientes

| Riesgo Identificado | Impacto | Probabilidad | Acción Mitigadora Concreta |
|---|---|---|---|
| **R1. Rechazo por desconfianza en el análisis de código** | Alto | Media | Crear un modo offline explicativo y publicar en el README diagramas de flujo de datos auditables. |
| **R2. Agotamiento de cuota de GitHub API en usuarios anónimos** | Medio | Alta | Integrar aviso visual en la barra de estado que invite a conectar GitHub mediante VS Code Auth de un solo clic. |
| **R3. Fragmentación del proyecto por PRs descoordinados** | Medio | Media | Publicar un `CONTRIBUTING.md` riguroso que exija vincular cada PR a una issue preaprobada y pasar tests en CI. |

