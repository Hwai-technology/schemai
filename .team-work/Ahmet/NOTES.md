# دليل مهام أحمد — Ahmet (COORD, HU-05, HU-06)

## 1. نطاق المسؤولية والمجلدات
- **المجلدات المخصصة**: `src/core/` و `src/analysis/`
- **قصص المستخدم (ClickUp HUs)**:
  - **COORD**: تنسيق دورة حياة الإضافة، هيكل `extension.ts` المشترك، تعريف الواجهات المشتركة `types.ts`.
  - **HU-05**: مراقبة اللصق غير المتزامن (`PasteMonitor`) وطابور التحليل غير المحظور (`AnalysisQueue`).
  - **HU-06**: الأوامر اليدوية (`schemaAI.analyzeSelection`, `schemaAI.checkLastPasted`).

---

## 2. ملفات الكود المرجعي المنظمة في هذا المجلد
- `analysis/codeAnalyzer.ts`: فحص الكود، توليد البصمات (Fingerprinting)، تجريد التعليقات والفراغات، وحساب تشابه الرموز.
- `analysis/pasteMonitor.ts`: الاستماع لأحداث لصق النصوص وتحديد الأجزاء المشبوهة.
- `analysis/analysisQueue.ts`: طابور معالجة غير متزامن مع تفريغ وإلغاء الطلبات المتكررة (Debounce & Cancellation).
- `core/coordinator.ts`: نموذج تسجيل الأوامر والربط مع الإضافة.

---

## 3. خطة العمل وتطبيق الـ TDD (من يوم الإثنين)
1. إنشاء فرع للمهمة انطلاقاً من `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-05-T1
   ```
2. كتابة اختبار الوحدة أولاً (Red Phase):
   - اختبار كشف أحداث اللصق وتوليد البصمة.
   - التحقق من عدم حظر واجهة المستخدم.
3. نقل وتنقيح الكود المرجعي من هذا المجلد إلى `src/analysis/` أو `src/core/` (Green Phase).
4. تشغيل الاختبارات والتأكد من نجاحها بالكامل:
   ```bash
   npm test
   ```
5. رفع الفرع وفتح Pull Request إلى `develop`، وتعيين المراجع من علامة `rev-` في ClickUp.
