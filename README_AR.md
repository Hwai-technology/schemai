# SchemAI - محلل الأكواد الخارجية ومخاطر تراخيص البرمجيات الذكي

🌐 **Language / اللغة / Idioma:**  
[🇬🇧 English](README.md) | [🇦🇪 العربية](README_AR.md) | [🇪🇸 Español](README_ES.md)

---

![SchemAI Team Logo & Banner](media/schema_ai_team_logo.jpg)

## 🧰 الحزمة التقنية والتوافق البيئي

| المكون / المواصفة | الإصدار / التفاصيل | الحالة |
| :--- | :--- | :--- |
| **محرك VS Code** | `^1.75.0+` | ![VS Code](https://img.shields.io/badge/VS_Code-1.75.0+-007ACC?logo=visualstudiocode) |
| **بيئة التشغيل** | Node.js `18.x` / `20.x` / `22.x` | ![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs) |
| **لغة ومترجم المشروع** | TypeScript `^4.9.5` | ![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript) |
| **إطار عمل الاختبارات** | Mocha `^10.8.2` | ![Mocha](https://img.shields.io/badge/Mocha-10.8.2-8D6748?logo=mocha) |
| **أداة التحزيم** | VSCE `^4.0.0` | ![VSCE](https://img.shields.io/badge/VSCE-4.0.0-007ACC) |
| **الأتمتة و CI/CD** | GitHub Actions متعدد المنصات | ![CI](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=githubactions) |
| **الترخيص** | رخصة MIT | ![License](https://img.shields.io/badge/License-MIT-green) |

### 🔤 لغات البرمجة المدعومة
تعمل الإضافة وتتفعل تلقائياً عند التعامل مع أي من اللغات التالية:
* 🟨 **JavaScript** (`onLanguage:javascript`)
* 🟦 **TypeScript** (`onLanguage:typescript`)
* 🐍 **Python** (`onLanguage:python`)
* ☕ **Java** (`onLanguage:java`)
* 🟣 **C#** (`onLanguage:csharp`)
* 🐹 **Go** (`onLanguage:go`)
* ⚙️ **C++** (`onLanguage:cpp`)
* 🦀 **Rust** (`onLanguage:rust`)

---

## 📋 نبذة عن مشروع SchemAI
**SchemAI** هي إضافة ذكية لمحرر **Visual Studio Code** صُممت لرصد وتدقيق الأكواد المنسوخة والملصوقة من مستودعات ومصادر خارجية (مثل GitHub أو Stack Overflow)، مع تقييم المخاطر القانونية وتوافق الرخص (مثل خطر رخص GPL-3.0 المقيدة داخل مشاريع MIT المرنة)، وإرشاد المطور لحماية مشروعه من أي نزاعات ملكية فكرية.

---

## 👥 فريق عمل SchemAI

* **Ahmet Asaad Hammoud**
* **Alexander Roldán Palomino**
* **David Vilaseca Pareja**
* **Abdul Rafey Hussain Parveen**
* **Sergio Bueno Gómez**
* **Leon Skalczynski**
* **Yunus Emre Köroğlu**
* **Yusuf Mahdy Mamdouh**

---

## 🖼️ الواجهة المرئية ولوحة التحكم

![SchemAI Extension UI Mockup](media/schema_ai_ui_mockup.jpg)

---

## 📊 معمارية النظام ومسار العمل

### 1. مسار رصد اللصق والتحليل غير المعطل للمحرر

```mermaid
sequenceDiagram
    autonumber
    actor Developer as 🧑‍💻 المطور
    participant Editor as 📝 محرر VS Code
    participant Monitor as ⚡ PasteMonitor & Queue
    participant Auth as 🔑 AuthManager
    participant GitHub as 🔍 واجهة GitHub API
    participant Engine as 🛡️ محرك المخاطر RiskEngine
    participant UI as 🪟 البطاقة الحية واللوحة الجانبية

    Developer->>Editor: لصق كود في المحرر (Paste)
    Editor->>Monitor: onDidChangeTextDocument (التقاط فوري)
    Monitor->>Monitor: فحص الهيورستكس واستثناء الكود الداخلي
    Monitor->>Auth: جلب توكن الجلسة الشخصية للمستخدم
    Auth-->>Monitor: Bearer Token موثق
    Monitor->>GitHub: بحث في المستودعات العامة (طابور غير متزامن)
    GitHub-->>Monitor: إرجاع المستودع والرخصة الحقيقية (SPDX)
    Monitor->>Engine: تقييم الرخصة مقابل سياسة المشروع (MIT vs GPL)
    Engine-->>UI: فتح بطاقة المخاطر وتأطير الكود في المحرر
    UI->>Editor: تسجيل المشاكل في Problems Panel وتحديث شريط الحالة
```

---

### 2. المخطط المعماري للموديولات

```mermaid
graph TD
    A[🧑‍💻 تفاعل المطور في المحرر] -->|لصق / كليك يمين| B[⚡ نواة SchemAI]

    subgraph المراقبة والمعالجة
        B --> C[PasteMonitor]
        C --> D[AnalysisQueue & LRU Cache]
        D --> E[CodeAnalyzer والبصمات]
    end

    subgraph الأمان والمصادقة
        B --> F[AuthManager - تسجيل دخول GitHub الشخصي]
        B --> G[SecretStorage - التخزين المشفر]
        F --> H[شريط الحالة Status Bar]
    end

    subgraph الاستكشاف والتقييم
        D --> I[SourceSearchEngine]
        I -->|GitHub API| J[المستودعات والرخص العامة]
        I --> K[RiskEngine - التقييم بالأدلة]
    end

    subgraph الواجهات والتخزين المستمر
        K --> L[بطاقة المخاطر الحية Live Risk Card]
        K --> M[لوحة التحكم الجانبية Cyberpunk]
        K --> N[التشخيصات والتسطير في المحرر]
        K --> O[HistoryManager - سجل التدقيق في Workspace]
    end
```

---

## 🚀 أبرز الميزات والوظائف

* **🔑 تسجيل الدخول بحساب GitHub الشخصي:** تسجيل دخول مستقل لكل مستخدم عبر واجهة VS Code الرسمية (`vscode.authentication`) دون الحاجة لأي توكن مشترك.
* **🛡️ طابور معالجة غير متزامن بدون تعليق المحرر:** رصد اللصق في الخلفية بسرعة فائقة مع آلية Debounce وكاش SHA-256 لمنع الاستعلامات المكررة.
* **🪟 بطاقة فحص المخاطر الحية (Live Risk Card):** نافذة عائمة بجانب الكود تتميز بهيدر لوني متدرج، تفاصيل المستودع المصدر، ومصفوفة توافق الرخص بالألوان.
* **📊 لوحة التحكم الجانبية التفاعلية (Cyberpunk Dashboard):** في شريط الأدوات الجانبي لعرض حالة الملف، الاكتشافات الأخيرة، والعدادات الإحصائية.
* **🖱️ قائمة الزر الأيمن في المحرر (Context Menu):** خيارات مباشرة:
  * `SchemAI: Analyze Selected Code` (فحص الكود المحدد)
  * `SchemAI: Check Last Pasted Code Risk` (فحص وتدقيق آخر كود ملصوق)
  * `SchemAI: View Paste & License History (Audit Log)` (فتح سجل وتاريخ التتبع)
* **📁 سجل تدقيق دائم ومحلي:** حفظ أحدث التحليلات في الـ Workspace مع إمكانية تعليم التنبيهات كإنذار خاطئ (`False Positive`).
* **🔎 كشف الرخص بالدليل وتفادي الإنذار الخاطئ:** التحقق من رخصة المستودع المعتمدة (`spdx_id`) واستثناء الكود الداخلي للمشروع والمستودع الخاص.

---

## ⚙️ التجميع والاختبارات

### تشغيل اختبارات الوحدة والـ Benchmark
```bash
npm test
```

### بناء حزمة الإضافة الرسمية (.vsix)
```bash
npm run package
```

### النشر والأتمتة (Release)
```bash
# إصدار Minor جديد (مثلاً: 0.1.0 -> 0.2.0)
npm run release

# إصدار Patch تصحيحي (مثلاً: 0.1.0 -> 0.1.1)
npm run release:patch
```
