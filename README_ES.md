# SchemAI - Analizador Inteligente de Código Externo y Riesgo de Licencias

🌐 **Language / اللغة / Idioma:**  
[🇬🇧 English](README.md) | [🇦🇪 العربية](README_AR.md) | [🇪🇸 Español](README_ES.md)

---

![SchemAI Team Logo & Banner](media/schema_ai_team_logo.jpg)

## 🧰 Stack Tecnológico y Compatibilidad

| Componente / Especificación | Versión / Detalles | Estado |
| :--- | :--- | :--- |
| **Motor de VS Code** | `^1.75.0+` | ![VS Code](https://img.shields.io/badge/VS_Code-1.75.0+-007ACC?logo=visualstudiocode) |
| **Entorno de Ejecución** | Node.js `18.x` / `20.x` / `22.x` | ![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs) |
| **Lenguaje y Compilador** | TypeScript `^4.9.5` | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript) |
| **Framework de Pruebas** | Mocha `^10.8.2` | ![Mocha](https://img.shields.io/badge/Mocha-10.8.2-8D6748?logo=mocha) |
| **Herramienta de Empaquetado** | VSCE `^4.0.0` | ![VSCE](https://img.shields.io/badge/VSCE-4.0.0-007ACC) |
| **Automatización CI/CD** | GitHub Actions Multi-Plataforma | ![CI](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions) |
| **Licencia** | Licencia MIT | ![License](https://img.shields.io/badge/License-MIT-green) |

### 🔤 Lenguajes Soportados y Activación Dinámica
La extensión se activa automáticamente al trabajar con:
* 🟨 **JavaScript** (`onLanguage:javascript`)
* 🟦 **TypeScript** (`onLanguage:typescript`)
* 🐍 **Python** (`onLanguage:python`)
* ☕ **Java** (`onLanguage:java`)
* 🟣 **C#** (`onLanguage:csharp`)
* 🐹 **Go** (`onLanguage:go`)
* ⚙️ **C++** (`onLanguage:cpp`)
* 🦀 **Rust** (`onLanguage:rust`)

---

## 📋 Sobre SchemAI
**SchemAI** es una extensión inteligente para **Visual Studio Code** diseñada para detectar, analizar y auditar código fuente pegado desde repositorios externos (como GitHub o Stack Overflow). Evalúa el riesgo legal y la compatibilidad de licencias (ej. GPL-3.0 copyleft estricto dentro de proyectos MIT permisivos), guiando al desarrollador para proteger su software de conflictos legales.

---

## 👥 Equipo de Trabajo (SchemAI Team)

* **Ahmet Asaad Hammoud**
* **Alexander Roldán Palomino**
* **David Vilaseca Pareja**
* **Abdul Rafey Hussain Parveen**
* **Sergio Bueno Gómez**
* **Leon Skalczynski**
* **Yunus Emre Köroğlu**
* **Yusuf Mahdy Mamdouh**

---

## 🖼️ Interfaz de Usuario y Vista Previa

![SchemAI Extension UI Mockup](media/schema_ai_ui_mockup.jpg)

---

## 📊 Arquitectura del Sistema y Flujo de Trabajo

### 1. Flujo de Captura y Análisis Asíncrono no Bloqueante

```mermaid
sequenceDiagram
    autonumber
    actor Developer as 🧑‍💻 Desarrollador
    participant Editor as 📝 Editor VS Code
    participant Monitor as ⚡ PasteMonitor & Queue
    participant Auth as 🔑 AuthManager
    participant GitHub as 🔍 API de GitHub
    participant Engine as 🛡️ RiskEngine
    participant UI as 🪟 Live Risk Card & Sidebar

    Developer->>Editor: Pegar fragmento de código (Copy / Paste)
    Editor->>Monitor: onDidChangeTextDocument (Captura Inmediata)
    Monitor->>Monitor: Filtrar Heurísticas y Descartar Código Propio
    Monitor->>Auth: Obtener Token de Sesión Personal
    Auth-->>Monitor: Bearer Token Autenticado
    Monitor->>GitHub: Buscar en Repositorios Públicos (Cola Asíncrona)
    GitHub-->>Monitor: Retornar Repositorio y Licencia Real (SPDX)
    Monitor->>Engine: Evaluar Licencia vs Política del Proyecto (MIT vs GPL)
    Engine-->>UI: Desplegar Tarjeta de Riesgo y Resaltado en Editor
    UI->>Editor: Diagnósticos en Problems Panel y Barra de Estado
```

---

### 2. Diagrama de Arquitectura Modular

```mermaid
graph TD
    A[🧑‍💻 Acción en el Editor] -->|Pegar / Clic Derecho| B[⚡ Núcleo SchemAI]

    subgraph Monitorización y Procesamiento
        B --> C[PasteMonitor]
        C --> D[AnalysisQueue & LRU Cache]
        D --> E[CodeAnalyzer & Fingerprinting]
    end

    subgraph Seguridad y Autenticación
        B --> F[AuthManager - GitHub OAuth Personal]
        B --> G[SecretStorage - Credenciales Cifradas]
        F --> H[Elemento de Barra de Estado]
    end

    subgraph Detección y Evaluación
        D --> I[SourceSearchEngine]
        I -->|GitHub API| J[Repositorios y Licencias Públicas]
        I --> K[RiskEngine - Evaluación por Evidencias]
    end

    subgraph Interfaz de Usuario y Auditoría
        K --> L[Live Risk Card Panel]
        K --> M[Panel Lateral Cyberpunk]
        K --> N[Diagnósticos y Resaltado Visual]
        K --> O[HistoryManager - Registro en Workspace]
    end
```

---

## 🚀 Características Principales

* **🔑 Autenticación Personal con GitHub:** Inicio de sesión independiente para cada usuario mediante la API oficial de VS Code (`vscode.authentication`). Sin tokens compartidos del desarrollador.
* **🛡️ Cola Asíncrona sin Bloqueo del Editor:** Análisis en segundo plano sin ralentizar la escritura, con debouncing y deduplicación de huellas SHA-256.
* **🪟 Tarjeta de Riesgo Interactiva en Vivo:** Panel flotante adyacente con degradado neón, detalles del repositorio de origen y Matriz de Compatibilidad de Licencias con código de colores.
* **📊 Panel Lateral Dashboard Cyberpunk:** Vista dedicada en el Activity Bar con estado del archivo actual, detecciones recientes, accesos de configuración y estadísticas.
* **🖱️ Menú Contextual del Editor (Clic Derecho):** Acciones directas integradas:
  * `SchemAI: Analyze Selected Code`
  * `SchemAI: Check Last Pasted Code Risk`
  * `SchemAI: View Paste & License History (Audit Log)`
* **📁 Historial Persistente de Auditoría:** Almacenamiento acotado en el Workspace para revisar análisis previos y marcar falsos positivos.
* **🔎 Detección de Licencias por Evidencias:** Consulta de licencias verificadas (`spdx_id`) evitando falsos positivos al copiar código propio.

---

## ⚙️ Compilación y Pruebas

### Ejecutar Pruebas Unitarias y Benchmarking
```bash
npm test
```

### Empaquetar Extensión (.vsix)
```bash
npm run package
```

### Publicación y Lanzamiento Automatizado
```bash
# Lanzamiento Minor (ej. 0.1.0 -> 0.2.0)
npm run release

# Lanzamiento Patch (ej. 0.1.0 -> 0.1.1)
npm run release:patch
```
