# دليل مهام يوسف — Yusuf (HU-02, HU-03, HU-13)

## 1. نطاق المسؤولية والمجلدات
- **المجلدات المخصصة**: `src/auth/`, `src/security/`, `src/history/`
- **قصص المستخدم (ClickUp HUs)**:
  - **HU-02**: مصادقة GitHub عبر VS Code Authentication API ومؤشر شريط الحالة (`AuthManager`, `AuthStatusBarItem`).
  - **HU-03**: التخزين الآمن للمفاتيح والرموز عبر `ExtensionContext.secrets` وترحيل الرموز النصية (`SecretStorageManager`).
  - **HU-13**: سجل التدقيق المحلي للعمليات وتتبع اللصق (`HistoryManager`, `HistoryStorage`).

---

## 2. حدود النطاق وتوجيهات Sprint 1
- **تنبيه هام (تعليمات الفريق)**: لوحة الشريط الجانبي التفاعلية والسجل الكامل (HU-16) تبقى في النموذج المبدئي فقط وليست جزءاً من Sprint 1.
- التركيز في `src/history/` ينصب على تخزين واسترجاع سجلات التحقق محلياً وتحديد الحالات الزائفة (False Positives) ووضع علامة المراجعة (Reviewed).

---

## 3. ملفات الكود المرجعي المنظمة في هذا المجلد
- `auth/authManager.ts`: إدارة جلسات GitHub، تسجيل الدخول والخروج وتبديل الحسابات.
- `auth/authStatusBar.ts`: عنصر شريط الحالة لعرض حالة الحساب والقائمة المنبثقة.
- `security/secretStorage.ts`: التخزين المشفر للرموز في نظام التشغيل وترحيل الرموز القديمة.
- `history/historyManager.ts`: تسجيل العمليات وعلامات المراجعة.
- `history/historyStorage.ts`: تخزين دائري محدود بـ 150 عنصراً في `workspaceState`.

---

## 4. خطة العمل وتطبيق الـ TDD (من يوم الإثنين)
1. إنشاء فرع للمهمة انطلاقاً من `ddevelop`:
   ```bash
   git checkout ddevelop
   git pull origin ddevelop
   git checkout -b feature/HU-02-T1  # أو HU-03 أو HU-13
   ```
2. كتابة اختبار الوحدة أولاً (Red Phase):
   - اختبار حفظ واسترجاع الرمز السري من `SecretStorage`.
   - اختبار إضافة سجلات التدقيق والتأكد من تحديد سقف السجلات بـ 150.
3. نقل الكود المرجعي إلى المجلدات المستهدفة (Green Phase).
4. تشغيل الاختبارات:
   ```bash
   npm test
   ```
5. فتح Pull Request إلى `ddevelop` وتعيين المراجع من علامة `rev-` في ClickUp.
