# SchemAI - Smart External Code & License Risk Analyzer

🌐 **Language / اللغة / Idioma:**  
[🇬🇧 English](README.md) | [🇦🇪 العربية](README_AR.md) | [🇪🇸 Español](README_ES.md)

---

![SchemAI Team Logo & Banner](media/schema_ai_team_logo.jpg)

## 🧰 Stack Tecnológico y Compatibilidad

| Componente / Especificación | Versión / Detalles | Estado |
| :--- | :--- | :--- |
| **Motor de VS Code** | `^1.75.0+` | ![VS Code](https://img.shields.io/badge/VS_Code-1.75.0+-007ACC?logo=visualstudiocode) |
| **Entorno de Ejecución** | Node.js `16.x` / `18.x` / `20.x` | ![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?logo=nodedotjs) |
| **Lenguaje y Compilador** | TypeScript `^4.9.5` | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript) |
| **Framework de Pruebas** | Mocha `^10.2.0` | ![Mocha](https://img.shields.io/badge/Mocha-10.2.0-8D6748?logo=mocha) |
| **Herramienta de Empaquetado** | VSCE `^4.0.0` | ![VSCE](https://img.shields.io/badge/VSCE-4.0.0-007ACC) |
| **Automatización CI/CD** | Flujo GitHub Actions | ![CI](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions) |
| **Licencia** | Licencia MIT | ![License](https://img.shields.io/badge/License-MIT-green) |

### 🔤 Lenguajes de Programación Soportados y Disparadores
La extensión se activa dinámicamente al trabajar con cualquiera de los siguientes lenguajes:
* 🟨 **JavaScript** (`onLanguage:javascript`)
* 🟦 **TypeScript** (`onLanguage:typescript`)
* 🐍 **Python** (`onLanguage:python`)
* ☕ **Java** (`onLanguage:java`)
* 🟣 **C#** (`onLanguage:csharp`)
* 🐹 **Go** (`onLanguage:go`)
* ⚙️ **C++** (`onLanguage:cpp`)
* 🦀 **Rust** (`onLanguage:rust`)

---

## 📋 Sobre el Proyecto (About SchemAI)
**SchemAI** es una extensión inteligente para **Visual Studio Code** diseñada para detectar y analizar código pegado desde fuentes externas (como GitHub o Stack Overflow), evaluando el riesgo legal y la compatibilidad de licencias para proteger los proyectos de software.

---

## 👥 Equipo de Trabajo (SchemAI Team)

* **Ahmet Asaad Hammoud**
* **Alexander Roldán Palomino**
* **David Vilaseca Pareja**
* **Abdul Rafey Hussain Parveen**
* **Sergio Bueno Gómez**
* **Suliman Mimon Youjili**
* **Leon Skalczynski**
* **Yunus Emre Köroğlu**
* **Yusuf Mahdy Mamdouh**

---

## 🖼️ Interfaz de Usuario y Vista Previa (UI & Visual Overview)

![SchemAI Extension UI Mockup](media/schema_ai_ui_mockup.jpg)

---

## 📊 Arquitectura y Diagramas (Architecture & Diagrams)

### 1. Flujo de Detección de Código Pegado (Paste Detection Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor Developer as 🧑‍💻 Desarrollador
    participant VSCode as 📝 Editor VS Code
    participant SchemAI as ⚡ Extensión SchemAI
    participant GitHub as 🔍 API de GitHub
    participant Engine as 🛡️ Motor de Riesgo

    Developer->>VSCode: Pegar fragmento de código (Copy / Paste)
    VSCode->>SchemAI: Captura de evento (onDidChangeTextDocument)
    SchemAI->>SchemAI: Extraer huella de código y estructura (AST)
    SchemAI->>GitHub: Buscar coincidencias en repositorios públicos
    GitHub-->>SchemAI: Retornar fuente y licencia (ej. GPL-3.0)
    SchemAI->>Engine: Evaluar licencia vs política del proyecto (MIT)
    Engine-->>SchemAI: Evaluación de riesgo (Incompatible / Alto Riesgo)
    SchemAI->>VSCode: Mostrar advertencia y resaltar código en el editor
```

---

### 2. Arquitectura del Sistema (System Architecture)

```mermaid
graph TD
    A[🧑‍💻 Acción de Código del Desarrollador] -->|Pegar / Seleccionar| B[⚡ Núcleo SchemAI VSCode]
    
    subgraph SchemAI Engine
        B --> C[🔍 Servicio de Análisis de Código]
        B --> D[🌐 Servicio de Búsqueda de Fuentes]
        B --> E[🛡️ Evaluador del Motor de Riesgo]
    end
    
    C -->|Extraer Tokens y AST| D
    D -->|API de Búsqueda de Código de GitHub| F[🐙 Repositorios de GitHub]
    F -->|Retornar Metadatos y Licencia| D
    D -->|Metadatos de la Fuente| E
    E -->|Evaluación de Matriz| G[📊 Informe y Puntuación de Riesgo]
    G -->|Diagnósticos Interactivos| H[💻 UI Diagnósticos de VS Code]
```

---

### 3. Matriz de Compatibilidad de Licencias (License Compatibility Matrix)

```mermaid
quadrantChart
    title Matriz de Compatibilidad de Licencias del Proyecto
    x-axis Riesgo Bajo --> Riesgo Alto
    y-axis Restricciones Bajas --> Restricciones Altas (Copyleft)
    quadrant-1 ❌ Incompatible (Strict Copyleft - GPL)
    quadrant-2 ⚠️ Requiere Revisión (Weak Copyleft - LGPL/MPL)
    quadrant-3 ✅ Totalmente Compatible (Permissive - MIT/Apache)
    quadrant-4 ℹ️ Requiere Atribución (BSD)
    MIT: [0.1, 0.2]
    Apache-2.0: [0.25, 0.3]
    BSD-3-Clause: [0.35, 0.4]
    LGPL-3.0: [0.65, 0.7]
    GPL-3.0: [0.9, 0.95]
```

---

## 🚀 Características Principales
* **Detección Automática:** Escaneo instantáneo de fragmentos pegados directamente en el editor.
* **Búsqueda de Fuentes:** Integración con la API pública de GitHub para identificar el origen del código.
* **Evaluación de Riesgos:** Comparación automática con las licencias del proyecto objetivo (ej. MIT, Apache, GPL).
* **Alertas Interactivas:** Diagnósticos integrados en el editor para guiar las decisiones del desarrollador.

---

## ⚙️ Compilación y Pruebas (Building & Testing)

### Ejecutar Pruebas Unitarias (Unit Tests)
```bash
npm test
```

### Compilar y Empaquetar Extensión (`.vsix`)
```bash
npm run package
```
