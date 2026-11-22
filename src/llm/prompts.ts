export interface ExplanationPromptInput {
  snippet: string;
  detectedLicense: string;
  projectLicense: string;
  locale: string;
}

/**
 * Builds the explanation prompt in the language selected by VS Code.
 */
export function buildExplanationPrompt({
  snippet,
  detectedLicense,
  projectLicense,
  locale
}: ExplanationPromptInput): string {
  const language = locale.toLowerCase().startsWith('es') ? 'es' : 'en';
  const code = snippet.substring(0, 300);

  if (language === 'es') {
    return `Eres un experto en licencias de software.
Un fragmento de código de origen tiene la licencia "${detectedLicense}" y se ha incluido en un proyecto con licencia "${projectLicense}".

Explica en español:
1. Si "${detectedLicense}" es compatible con "${projectLicense}".
2. Los riesgos y las obligaciones legales aplicables.
3. Las medidas prácticas que puede tomar el desarrollador, como atribución, licencia dual o reescritura.

Fragmento de código:
${code}`;
  }

  return `You are a software licensing expert.
A source code snippet licensed under "${detectedLicense}" has been included in a project licensed under "${projectLicense}".

Explain in English:
1. Whether "${detectedLicense}" is compatible with "${projectLicense}".
2. The applicable risks and legal obligations.
3. Practical steps the developer can take, such as attribution, dual licensing, or rewriting.

Code snippet:
${code}`;
}
