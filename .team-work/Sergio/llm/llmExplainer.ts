/**
 * Reference Code for Sergio (HU-14)
 * Formulates prompt templates and generates plain-language explanations of license risks.
 */
export class LLMExplainer {
  public static buildPrompt(snippet: string, detectedLicense: string, projectLicense: string): string {
    return `You are a software licensing expert. 
A developer pasted a code snippet in a project licensed under "${projectLicense}".
The detected origin snippet appears to be licensed under "${detectedLicense}".

Analyze the legal implications:
1. Is "${detectedLicense}" compatible with "${projectLicense}"?
2. Explain the risk in simple language.
3. What practical steps can the developer take (e.g. attribution, dual licensing, rewriting)?

Code snippet:
${snippet.substring(0, 300)}`;
  }
}
