# دليل مهام ليون — Leon (HU-01, HU-04)

## 1. نطاق المسؤولية والمجلدات
- **المجلد المخصص**: `src/config/`
- **قصص المستخدم (ClickUp HUs)**:
  - **HU-01**: إعدادات الامتداد وإدارة سياسة التراخيص للمشروع (`PolicyManager`, `Settings`).
  - **HU-04**: الفحص التلقائي لملف `LICENSE` في جذر المشروع واستخلاص رخصة المستودع.

---

## 2. كيفية فصل الكود من النموذج المبدئي
1. **نقل السياسة الثابتة (Hardcoded Policy)**:
   - في النموذج المبدئي، كانت السياسة (`ProjectPolicy`) مدمجة بشكل ثابت داخل `analysisQueue.ts` و `extension.ts`:
     ```typescript
     allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'],
     restrictedLicenses: ['GPL-3.0', 'AGPL-3.0', 'GPL-2.0', 'AGPL-1.0', 'SSPL']
     ```
   - تم نقل هذا المنطق بالكامل ليصبح في `src/config/` ضمن مدير السياسات (`PolicyManager`).
2. **الكشف التلقائي عن رخصة المشروع**:
   - البحث عن ملفات `LICENSE`, `LICENSE.md`, `LICENSE.txt` في جذر المجلد المفتوح واستخراج نوع الرخصة تلقائياً.

---

## 3. ملفات الكود المرجعي المنظمة في هذا المجلد
- `config/policyManager.ts`: إدارة السياسات، الرخص المسموح بها والمحظورة، والتوافق الافتراضي.
- `config/licenseDetectorWorkspace.ts`: استكشاف وقراءة رخصة المشروع من مجلد الجذر.
- `config/settings.ts`: قراءة إعدادات VS Code الخاصة بـ `schemaAI.*` والتفاعل مع تغييراتها.

---

## 4. خطة العمل وتطبيق الـ TDD (من يوم الإثنين)
1. إنشاء فرع للمهمة انطلاقاً من `ddevelop`:
   ```bash
   git checkout ddevelop
   git pull origin ddevelop
   git checkout -b feature/HU-01-T1
   ```
2. كتابة اختبار الوحدة أولاً (Red Phase):
   - اختبار قراءة الإعدادات الافتراضية.
   - اختبار استخراج رخصة MIT من ملف LICENSE تجريبي.
3. نقل الكود المرجعي إلى `src/config/` (Green Phase).
4. تشغيل الاختبارات:
   ```bash
   npm test
   ```
5. فتح Pull Request إلى `ddevelop` وتعيين المراجع من علامة `rev-` في ClickUp.
