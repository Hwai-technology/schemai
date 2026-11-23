# Plan de Apertura Open Source: Gobernanza y Sostenibilidad
**Documento:** `governance-and-sustainability.md`  
**Equipo D:** Leon (Config & Policies) y Sergio (LLM Reasoning & QuickFix)  
**Proyecto:** SchemAI — External Code & License Risk Analyzer  
**Fecha:** Noviembre 2026  

---

## 1. Modelo de Gobernanza y Justificación

### 1.1. Modelo Elegido: **Steering Committee Híbrido con Coordinador Técnico (Project Lead)**
Para SchemAI se descarta tanto el modelo de Dictador Benevolente Vitalicio (BDFL) —inadecuado para un equipo universitario horizontal de 8 ingenieros— como el modelo puramente asambleario directo —que suele desembocar en parálisis por análisis ante decisiones técnicas complejas—.

Se establece un **Comité Directivo (Steering Committee)** de 4 miembros representativos de las cuatro áreas clave del sistema, complementado con un **Project Lead** (Ahmet) que actúa como coordinador y árbitro en caso de empate:
- **Lead / Coordinador General:** Ahmet (Representando Core & Arquitectura).
- **Vocal de Análisis y Búsqueda:** Alexander.
- **Vocal de Seguridad y Calidad:** Yusuf o Yunus.
- **Vocal de Experiencia de Usuario y Reglas:** Leon o David.

### 1.2. Justificación
Este modelo equilibra la agilidad técnica diaria con la representación democrática de todo el equipo de desarrollo. Permite que los responsables de módulo tomen decisiones autónomas en su ámbito, mientras que las modificaciones que afectan a la arquitectura global (`types.ts`, `extension.ts`) requieren deliberación y consenso en el comité.

---

## 2. Flujo de Revisión y Aceptación de Cambios

La revisión de código se formaliza mediante el archivo de control de propietarios de código (`.github/CODEOWNERS`):

| Dominio del Código | Propietarios Principales (CODEOWNERS) | Revisión Obligatoria para Merge |
|---|---|---|
| `src/core/`, `src/extension.ts`, `src/types.ts` | **Ahmet** | Aprobación de Ahmet + 1 miembro del comité |
| `src/analysis/` | **Ahmet** | Aprobación de Ahmet |
| `src/search/` | **Alexander** | Aprobación de Alexander |
| `src/licenses/` | **David** | Aprobación de David |
| `src/alerts/` | **Abdul** | Aprobación de Abdul |
| `src/config/` | **Leon** | Aprobación de Leon |
| `src/auth/`, `src/security/`, `src/history/` | **Yusuf** | Aprobación de Yusuf |
| `src/llm/`, `src/quickfix/` | **Sergio** | Aprobación de Sergio |
| `src/network/`, `src/test/`, `.github/` | **Yunus** | Aprobación de Yunus |

**Reglas de Merge:**
- Para integrar un Pull Request en `develop` se exige:
  1. Mínimo **1 revisión aprobada** del CODEOWNER del módulo afectado.
  2. Todos los checks de CI en verde (compilación, linter, tests).
  3. Cero comentarios de revisión pendientes de resolución.
  4. Los administradores no pueden eludir (*bypass*) estas reglas.

---

## 3. Resolución de Desacuerdos Técnicos

Cuando surja una discrepancia técnica (ej. inclusión de una nueva dependencia, cambio en el umbral de similitud o modificación de la matriz de licencias), se sigue el siguiente protocolo formal de resolución escalonada:

1. **Debate Técnico Abierto (Plazo: 5 días hábiles):**
   - El desacuerdo se debate públicamente en la Issue o PR correspondiente aportando métricas, prototipos comparativos o benchmarks de rendimiento.
2. **Votación en el Steering Committee:**
   - Si no se alcanza consenso por debate, el tema se eleva al Comité Directivo. Cada uno de los 4 representantes emite 1 voto razonado. La decisión se adopta por mayoría simple (3 de 4).
3. **Voto de Calidad del Project Lead:**
   - En caso de empate estricto (2 votos a favor y 2 en contra), el **Project Lead** (Ahmet) dispone del voto de calidad definitivo. El criterio rector para el desempate debe priorizar siempre la estabilidad del usuario final y el menor acoplamiento arquitectónico.

---

## 4. Gestión del Abandono de Desarrolladores Principales (*Bus Factor*)

Uno de los mayores riesgos en proyectos originados en el ámbito académico es que el equipo original se desvincule tras finalizar el periodo lectivo. Para mitigar un *Bus Factor* crítico de 1:

1. **Esquema de Parejas / Shadowing:** Cada módulo cuenta con un segundo desarrollador asignado que conoce el código y puede asumir la titularidad inmediatamente:
   - Core & Analysis: Ahmet (Titular) <-> Alexander (Suplente).
   - Licenses & Alerts: David (Titular) <-> Abdul (Suplente).
   - Auth & Network/CI: Yusuf (Titular) <-> Yunus (Suplente).
   - Config & LLM: Leon (Titular) <-> Sergio (Suplente).
2. **Propiedad Organizacional Colectiva:**
   - El repositorio no reside en una cuenta personal de un estudiante, sino en la organización de GitHub **`Hwai-technology`**.
   - Al menos 3 miembros del equipo poseen rol de *Owner* con privilegios administrativos para evitar bloqueos por pérdida de contraseñas o abandono.
3. **Documentación Arquitectónica Viva:** Toda decisión de diseño o contrato de interfaz queda registrada de forma obligatoria en `FEATURES.md` y en los `README.md` de cada módulo, garantizando que el conocimiento no resida únicamente en la memoria de una persona.

---

## 5. Tres Riesgos de Continuidad y Planes de Mitigación

### Riesgo 1: Abandono Post-Asignatura (Pérdida de Mantenimiento Activo)
- **Probabilidad:** Alta | **Impacto:** Crítico
- **Mitigación:** 
  - Estabilizar una versión 1.0.0 antes del cierre del semestre académico con cero bugs abiertos de severidad alta.
  - Publicar un llamamiento explícito en el README buscando co-mantenedores de la comunidad externa.
  - Establecer un rol de mantenedor rotatorio mensual durante los primeros 6 meses tras la entrega de la asignatura.

### Riesgo 2: Cambios Rompientes en la API de GitHub o Aumento del Bloqueo por Rate-Limit
- **Probabilidad:** Media | **Impacto:** Alto
- **Mitigación:** 
  - Diseñar una interfaz abstracta para el motor de búsqueda (`ISearchProvider`), desacoplando el código de la implementación concreta de GitHub Code Search API.
  - Evaluar la incorporación de proveedores de búsqueda alternativos o locales (ej. motores basados en Searchcode o indexadores locales de repositorios).

### Riesgo 3: Sobrecarga por Soporte Técnico de Falsos Positivos
- **Probabilidad:** Alta | **Impacto:** Medio
- **Mitigación:** 
  - Desarrollar un comando nativo en la extensión (*"Mark as False Positive"*) que permita al usuario ignorar localmente alertas recurrentes y exportar un fichero de excepciones (`.schemaiignore`).
  - Habilitar GitHub Discussions para que la comunidad resuelva dudas comunes sobre interpretación de licencias sin saturar el issue tracker de bugs.

---

## 6. Modelo de Sostenibilidad

Para garantizar que SchemAI sea viable en el tiempo sin generar costes insostenibles para los desarrolladores originales, se define una estrategia en dos etapas:

### 6.1. Etapa Inicial: Modelo Comunitario y Patrocinios (Donaciones / Grants)
- **GitHub Sponsors / Open Collective:** Activar un botón de patrocinio en el repositorio para sufragar costes menores de infraestructura (ej. dominios web para documentación, cuentas de prueba y herramientas de empaquetado).
- **Proyectos de Software Libre:** Solicitar becas o *grants* para herramientas de código abierto (ej. Open Source Security Foundation - OpenSSF o GitHub Grants para extensiones orientadas a seguridad).

### 6.2. Etapa de Evolución: Modelo Open Core / SchemAI Enterprise
- **Núcleo Comunitario (100% Open Source bajo licencia MIT):**
  - La extensión completa de VS Code, detección de licencias en local, conexión con GitHub pública y diagnósticos en tiempo real siempre serán libres y gratuitos.
- **Servicios de Valor Añadido para Empresas (Futuro Open Core):**
  - *SchemAI CI Action:* GitHub Action / GitLab CI para auditar el cumplimiento de licencias automáticamente en los Pull Requests de repositorios empresariales.
  - *Enterprise Policy Dashboard:* Consola web para que los directores de seguridad de empresas configuren centralizadamente políticas de licenciamiento para todos sus desarrolladores.

