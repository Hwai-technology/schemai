# SchemAI - Smart External Code & License Risk Analyzer

🌐 **Language / اللغة / Idioma:**  
[🇬🇧 English](README.md) | [🇦🇪 العربية](README_AR.md) | [🇪🇸 Español](README_ES.md)

---

![SchemAI Team Logo & Banner](media/schema_ai_team_logo.jpg)

## 🧰 التقنيات وبيئة التشغيل المدعومة (Tech Stack & Ecosystem)

| المكون / المواصفة | الإصدار / التفاصيل | الحالة |
| :--- | :--- | :--- |
| **مُحرك VS Code** | `^1.75.0+` | ![VS Code](https://img.shields.io/badge/VS_Code-1.75.0+-007ACC?logo=visualstudiocode) |
| **بيئة التشغيل (Runtime)** | Node.js `16.x` / `18.x` / `20.x` | ![Node.js](https://img.shields.io/badge/Node.js-16%2B-339933?logo=nodedotjs) |
| **اللغة والمترجم** | TypeScript `^4.9.5` | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript) |
| **إطار الاختبارات** | Mocha `^10.2.0` | ![Mocha](https://img.shields.io/badge/Mocha-10.2.0-8D6748?logo=mocha) |
| **أداة التجميع** | VSCE `^4.0.0` | ![VSCE](https://img.shields.io/badge/VSCE-4.0.0-007ACC) |
| **الأتمتة والتكامل المستمر** | GitHub Actions Workflow | ![CI](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions) |
| **الترخيص** | MIT License | ![License](https://img.shields.io/badge/License-MIT-green) |

### 🔤 لغات البرمجة المدعومة وأحداث التفعيل
يعمل الامتداد تلقائياً فور كتابة أو لصق كود في أي من اللغات التالية:
* 🟨 **JavaScript** (`onLanguage:javascript`)
* 🟦 **TypeScript** (`onLanguage:typescript`)
* 🐍 **Python** (`onLanguage:python`)
* ☕ **Java** (`onLanguage:java`)
* 🟣 **C#** (`onLanguage:csharp`)
* 🐹 **Go** (`onLanguage:go`)
* ⚙️ **C++** (`onLanguage:cpp`)
* 🦀 **Rust** (`onLanguage:rust`)

---

## 📋 حول المشروع (About SchemAI)
**SchemAI** هو امتداد ذكي لبيئة **Visual Studio Code** يهدف إلى تحليل واكتشاف الكود البرمجي الذي يتم نسخه ولصقه من مصادر خارجية (مثل GitHub و Stack Overflow)، وتقييم المخاطر القانونية وتوافق التراخيص لحماية المشاريع البرمجية.

---

## 👥 فريق العمل (SchemAI Team)

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

## 🖼️ واجهة الامتداد (UI & Visual Overview)

![SchemAI Extension UI Mockup](media/schema_ai_ui_mockup.jpg)

---

## 📊 دياجرامات ومخططات المعمارية (Architecture & Diagrams)

### 1. تدفق العمل الذكي عند اللصق (Paste Detection Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor Developer as 🧑‍💻 المطور
    participant VSCode as 📝 VS Code Editor
    participant SchemAI as ⚡ SchemAI Extension
    participant GitHub as 🔍 GitHub API
    participant Engine as 🛡️ Risk Engine

    Developer->>VSCode: لصق الكود (Copy / Paste)
    VSCode->>SchemAI: التقاط حدث التغيير (onDidChangeTextDocument)
    SchemAI->>SchemAI: تحليل خصائص الكود والتركيب (AST / Fingerprint)
    SchemAI->>GitHub: بحث عن المطابقات في المستودعات العامة
    GitHub-->>SchemAI: إرجاع المستودع والمصدر والترخيص (e.g. GPL-3.0)
    SchemAI->>Engine: مقارنة ترخيص المصدر مع ترخيص المشروع (MIT)
    Engine-->>SchemAI: تقييم المخاطر (High Risk / Incompatible)
    SchemAI->>VSCode: عرض تنبيه تفاعلي وتظليل الكود في المحرر
```

---

### 2. معمارية النظام (System Architecture)

```mermaid
graph TD
    A[🧑‍💻 Developer Code Action] -->|Paste / Select| B[⚡ SchemAI VSCode Core]
    
    subgraph SchemAI Engine
        B --> C[🔍 Code Analyzer Service]
        B --> D[🌐 Source Search Service]
        B --> E[🛡️ Risk Engine Evaluator]
    end
    
    C -->|Extract Tokens & AST| D
    D -->|GitHub Code Search API| F[🐙 GitHub Repositories]
    F -->|Return Meta & License| D
    D -->|Source Metadata| E
    E -->|Matrix Assessment| G[📊 Risk Score & Report]
    G -->|Interactive Diagnostics| H[💻 VS Code UI Diagnostics & Quick Fix]
```

---

### 3. مصفوفة توافق التراخيص (License Compatibility Matrix)

```mermaid
quadrantChart
    title مصفوفة توافق التراخيص للمشروع
    x-axis منخفض الخطورة --> مرتفع الخطورة
    y-axis قيود منخفضة --> قيود مرتفعة (Copyleft)
    quadrant-1 ❌ غير متوافق (Strict Copyleft - GPL)
    quadrant-2 ⚠️ يحتاج مراجعة (Weak Copyleft - LGPL/MPL)
    quadrant-3 ✅ متوافق كلياً (Permissive - MIT/Apache)
    quadrant-4 ℹ️ يحتاج نسب المصدر (Attribution - BSD)
    MIT: [0.1, 0.2]
    Apache-2.0: [0.25, 0.3]
    BSD-3-Clause: [0.35, 0.4]
    LGPL-3.0: [0.65, 0.7]
    GPL-3.0: [0.9, 0.95]
```

---

## 🚀 المميزات الرئيسية
* **اكتشاف تلقائي:** فحص الكود المنسوخ فوراً داخل المحرر.
* **البحث عن المصدر:** الربط مع مستودعات GitHub العامة لمطابقة المصدر.
* **تقييم المخاطر:** مقارنة ترخيص الكود المنسوخ مع ترخيص المشروع الحالي (مثل MIT, Apache, GPL).
* **تنبيهات تفاعلية:** عرض تفاصيل التراخيص والتوصيات المباشرة للمطور.

---

## ⚙️ التشغيل والاختبارات (Building & Testing)

### تشغيل وحدة الاختبارات (Unit Tests)
```bash
npm test
```

### تجميع الامتداد وبناء ملف `.vsix`
```bash
npm run package
```
