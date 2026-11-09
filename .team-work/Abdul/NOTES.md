# دليل مهام عبدول — Abdul (HU-11, HU-12)

## 1. نطاق المسؤولية والمجلدات
- **المجلد المخصص**: `src/alerts/`
- **قصص المستخدم (ClickUp HUs)**:
  - **HU-11**: تنبيهات المحرر والتشخيصات (`DiagnosticsManager`, `EditorDecorator`).
  - **HU-12**: موفر التمرير التفاعلي (`SchemAIHoverProvider`) وبطاقة عرض المخاطر (`RiskCardPanel`).

---

## 2. ملفات الكود المرجعي المنظمة في هذا المجلد
- `alerts/diagnosticsManager.ts`: إدارة تشخيصات VS Code (`vscode.DiagnosticCollection`) وعرض التحذيرات/الأخطاء تحت الأسطر المنسوخة.
- `alerts/editorDecorator.ts`: رسم الحدود المتوهجة (Glowing Code Box) والخط المتموج تحت الكود الخطر.
- `alerts/hoverProvider.ts`: تزويد نافذة التمرير التفاعلية بتفاصيل الرخصة وحالتها وروابط فتح المستودع.
- `alerts/riskCardPanel.ts`: بطاقة الويب التفاعلية (Webview Panel) لعرض مصفوفة التوافق وتفاصيل الرخصة.

---

## 3. خطة العمل وتطبيق الـ TDD (من يوم الإثنين)
1. إنشاء فرع للمهمة انطلاقاً من `ddevelop`:
   ```bash
   git checkout ddevelop
   git pull origin ddevelop
   git checkout -b feature/HU-11-T1
   ```
2. كتابة اختبار الوحدة أولاً (Red Phase):
   - التحقق من إضافة الـ Diagnostic في المجموعة عند ورود نتيجة FORBIDDEN أو HIGH.
   - التحقق من مسح التنبيه عند SAFE.
3. نقل وتنقيح الكود المرجعي إلى `src/alerts/` (Green Phase).
4. تشغيل الاختبارات:
   ```bash
   npm test
   ```
5. فتح Pull Request إلى `ddevelop` وتعيين المراجع من علامة `rev-` في ClickUp.
