# 🚀 دليل الفريق: دورة العمل، البناء، والنشر التلقائي (Team Workflow & CI/CD Guide)

هذا الدليل مخصص لفريق تطوير **SchemAI** لشرح كيفية بناء حزمة الإضافة (`.vsix`) محلياً، وكيف تعمل أتمتة النشر التلقائي عبر **GitHub Actions**، وكيفية إعداد المفاتيح للرفع التلقائي إلى المتاجر الرسمية.

---

## 📌 الفهرس
1. [متطلبات بيئة العمل (Prerequisites)](#1-متطلبات-بيئة-العمل-prerequisites)
2. [تحليل وحل خطأ: `styleText is not a function`](#2-تحليل-وحل-خطأ-styletext-is-not-a-function)
3. [كيفية البناء والتجربة محلياً (Local Build & Test)](#3-كيفية-البناء-والتجربة-محليا-local-build--test)
4. [كيفية إصدار نسخة جديدة (Creating a New Release)](#4-كيفية-إصدار-نسخة-جديدة-creating-a-new-release)
5. [كيف يعمل النشر التلقائي في GitHub Actions (Automated CI/CD Workflow)](#5-كيف-يعمل-النشر-التلقائي-في-github-actions-automated-cicd-workflow)
6. [إعداد أسرار المستودع للنشر (Repository Secrets Setup)](#6-إعداد-أسرار-المستودع-للنشر-repository-secrets-setup)
7. [استكشاف الأخطاء وحلها (Troubleshooting)](#7-استكشاف-الأخطاء-وحلها-troubleshooting)

---

## 1. متطلبات بيئة العمل (Prerequisites)

* **Node.js**: الإصدار **20.x LTS** أو **22.x** (تنبيه: لا تستخدم Node 18، لأن أدوات `@vscode/vsce` الحديثة تتطلب Node 20+).
* **Git**: مثبت ومُعدّ.
* **VS Code**: الإصدار 1.85.0 فما فوق.

---

## 2. تحليل وحل خطأ: `styleText is not a function`

* **سبب الخطأ**: أداة `@vscode/vsce` (الإصدار 3 فما فوق) تستخدم دالة `util.styleText` من مكتبة Node الداخلية، والتي أضيفت في **Node.js 20.12.0**. في الإصدار Node 18 هذه الدالة غير موجودة، مما يسبب `TypeError`.
* **الحل**: تم تحديث `.github/workflows/ci-matrix.yml` لاختبار إصدارات **Node 20 و 22** المدعومة فقط على كل من Windows و Linux و macOS.

---

## 3. كيفية البناء والتجربة محلياً (Local Build & Test)

```bash
# 1. تثبيت الحزم والمكتبات
npm install

# 2. تجميع ملفات TypeScript
npm run compile

# 3. تشغيل الاختبارات الآلية والتحقق من الأداء
npm test

# 4. بناء ملف الحزمة (.vsix) محلياً
npm run package
```

بعد تشغيل أمر `npm run package`، سيظهر ملف الحزمة في المجلد الرئيسي باسم:
`schema-ai-X.Y.Z.vsix`

### لتثبيته وتجربته فوراً في بيئة العمل (VS Code أو Antigravity):

#### الخيار 1: عبر سطر الأوامر (Terminal)
* **في VS Code:**
  ```bash
  code --install-extension schema-ai-0.1.1.vsix --force
  ```
* **في Antigravity IDE:**
  ```bash
  antigravity --install-extension schema-ai-0.1.1.vsix --force
  ```
* **في VSCodium أو Cursor:**
  ```bash
  codium --install-extension schema-ai-0.1.1.vsix --force
  # أو
  cursor --install-extension schema-ai-0.1.1.vsix --force
  ```

#### الخيار 2: عبر واجهة البرنامج (GUI)
1. افتح **VS Code** أو **Antigravity**.
2. افتح تبويب الإضافات (`Extensions`) عبر الاختصار `Ctrl+Shift+X`.
3. اضغط على القائمة ثلاثية النقاط **`...`** في أعلى تبويب الإضافات.
4. اختر **`Install from VSIX...`**.
5. حدد ملف الحزمة `schema-ai-0.1.1.vsix` وسيتم تفعيل الإضافة فوراً!

---

## 4. كيفية إصدار نسخة جديدة (Creating a New Release)

```bash
# لإصدار تصحيح أخطاء (Patch):
./release.sh patch

# أو لإصدار ميزة جديدة (Minor):
./release.sh minor
```

---

## 5. كيف يعمل النشر التلقائي في GitHub Actions (Automated CI/CD Workflow)

بمجرد دفع التاغ `v*` (أو عند دمج كود في `main`)، يبدأ مسار العمل المؤتمت في `.github/workflows/release.yml`:
1. تشغيل الاختبارات والتجميع.
2. بناء ملف `schema-ai-X.Y.Z.vsix`.
3. إنشاء GitHub Release رسمي وربط الملف به.
4. النشر الآلي إلى **Open VSX Registry** و **VS Code Marketplace**.
5. يستلم المستخدمون حول العالم التحديث تلقائياً في الخلفية.

---

## 6. إعداد أسرار المستودع للنشر (Repository Secrets Setup)

في إعدادات المستودع: **Settings ➡️ Secrets and variables ➡️ Actions ➡️ New repository secret**

| اسم المفتاح (Secret Name) | الغرض منه | من أين تحصل عليه؟ |
| :--- | :--- | :--- |
| `OVSX_PAT` | مفتاح الوصول لمتجر **Open VSX** | [open-vsx.org](https://open-vsx.org/user-settings/tokens) |
| `VSCE_PAT` | مفتاح متجر **VS Code Marketplace** | [Azure DevOps](https://dev.azure.com) |

---

## 7. استكشاف الأخطاء وحلها (Troubleshooting)

* **لتشغيل الإضافة في وضع التطوير المباشر والتنقيح**: اضغط **`F5`** داخل VS Code لفتح نافذة **Extension Development Host**.

---
**فريق SchemAI 🛡️**

