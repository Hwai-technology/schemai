# دليل مهام ديفيد — David (HU-08, HU-09)

## 1. نطاق المسؤولية والمجلدات
- **المجلد المخصص**: `src/licenses/`
- **قصص المستخدم (ClickUp HUs)**:
  - **HU-08**: كاشف الرخص والـ SPDX ID (`LicenseDetector`) من رؤوس الملفات وميتاداتا GitHub.
  - **HU-09**: محرك تقييم المخاطر (`RiskEngine`) ومصفوفة توافق الرخص البرمجية مفتوحة المصدر.

---

## 2. كيفية فصل الكود من النموذج المبدئي
1. **تم استخراج منطق فحص الرخص من `sourceSearch.ts`**:
   - كشف إشعارات حقوق الملكية الصريحة المضمنة (GPL-3.0, MIT, Apache-2.0).
   - استخراج `spdx_id` من بيانات مستودع GitHub (`/repos/:owner/:repo`).
2. **محرك تقييم المخاطر `riskEngine.ts`**:
   - مطابقة الرخصة المكتشفة مع سياسة المشروع (`SAFE`, `WARNING`, `FORBIDDEN`, `UNKNOWN`).
   - تصنيف التراخيص الإلزامية الصارمة (Copyleft / AGPL / GPL).
3. **مصفوفة التوافق `compatibilityMatrix.ts`**: قواعد التوافق المتبادل بين الرخص.

---

## 3. ملفات الكود المرجعي المنظمة في هذا المجلد
- `licenses/licenseDetector.ts`: كشف الرخص القانونية من النصوص ومن استجابة الـ API.
- `licenses/riskEngine.ts`: تقييم درجة الخطورة والسبب المنطقي للتعارض.
- `licenses/compatibilityMatrix.ts`: مصفوفة التوافق بين مختلف الرخص (GPL, MIT, Apache, BSD, AGPL).

---

## 4. خطة العمل وتطبيق الـ TDD (من يوم الإثنين)
1. إنشاء فرع للمهمة انطلاقاً من `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-08-T1
   ```
2. كتابة اختبار الوحدة أولاً (Red Phase):
   - اختبار التعرف على نصوص رخصة GPL-3.0 المضمنة.
   - اختبار مصفوفة توافق MIT مع GPL ورفض التراخيص المحظورة كـ FORBIDDEN.
3. نقل الكود المرجعي المنظم إلى `src/licenses/` (Green Phase).
4. تشغيل الاختبارات:
   ```bash
   npm test
   ```
5. فتح Pull Request إلى `develop` وتعيين المراجع من علامة `rev-` في ClickUp.
