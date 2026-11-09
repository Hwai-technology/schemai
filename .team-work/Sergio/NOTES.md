# دليل مهام سيرجيو — Sergio (HU-14, HU-15)

## 1. نطاق المسؤولية والمجلدات
- **المجلدات المخصصة**: `src/llm/` و `src/quickfix/`
- **قصص المستخدم (ClickUp HUs)**:
  - **HU-14**: تكامل نماذج الذكاء الاصطناعي (LLM) وشرح المخاطر القانونية بلغة مفهومة.
  - **HU-15**: توفير الإصلاحات السريعة في المحرر (`vscode.CodeActionProvider`).

---

## 2. ملفات الكود المرجعي المنظمة في هذا المجلد
- `llm/llmExplainer.ts`: صياغة قوالب التوجيه (Prompts) واستدعاء مزودي الذكاء الاصطناعي لتفسير تعارض التراخيص وتقديم حلول بديلة للمطور.
- `quickfix/codeActionProvider.ts`: تسجيل الإجراءات السريعة (Code Actions) لإضافة ترويسة العزو القانوني (Attribution) أو استبدال الشيفرة المنسوخة تلقائياً.

---

## 3. خطة العمل وتطبيق الـ TDD (من يوم الإثنين)
1. إنشاء فرع للمهمة انطلاقاً من `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/HU-14-T1  # أو HU-15-T1
   ```
2. كتابة اختبار الوحدة أولاً (Red Phase):
   - اختبار تكوين رسالة الـ Prompt بناءً على بيانات الرخصة المكتشفة.
   - اختبار تسجيل CodeActions في قائمة VS Code عند وجود Diagnostic نشط.
3. نقل الكود المرجعي إلى `src/llm/` و `src/quickfix/` (Green Phase).
4. تشغيل الاختبارات:
   ```bash
   npm test
   ```
5. فتح Pull Request إلى `develop` وتعيين المراجع من علامة `rev-` في ClickUp.
