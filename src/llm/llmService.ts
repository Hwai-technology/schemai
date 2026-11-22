import * as http from 'http';
import * as https from 'https';
import type * as vscode from 'vscode';
import { getFixedLicenseSummary } from './fixedSummaries';
import { buildExplanationPrompt } from './prompts';

function getVscode(): typeof vscode | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('vscode') as typeof vscode;
  } catch {
    return undefined;
  }
}

export type LLMProviderType = 'local' | 'openai' | 'custom';

export interface LLMConfig {
  readonly provider: LLMProviderType;
  readonly endpoint: string;
  readonly model: string;
  readonly locale: string;
}

export interface ExplanationResult {
  readonly text: string;
  readonly provider: string;
  readonly model: string;
  readonly isFallback: boolean;
  readonly timestamp: number;
}

export interface SecretReader {
  getSecret?(key: string): Promise<string | undefined>;
  get?(key: string): Promise<string | undefined>;
}

function makeHttpRequest(
  urlStr: string,
  bodyJson: string,
  headers: Record<string, string>,
  timeoutMs = 6000
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(urlStr);
      const isHttps = parsedUrl.protocol === 'https:';
      const transport = isHttps ? https : http;

      const req = transport.request(
        parsedUrl,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Length': Buffer.byteLength(bodyJson)
          },
          timeout: timeoutMs
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(`HTTP ${res.statusCode ?? 'unknown'}: ${data}`));
            }
          });
        }
      );

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });

      req.write(bodyJson);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Service orchestrating AI explanations for detected license risks.
 * Supports both Local LLMs (Ollama, LM Studio) and Cloud APIs (OpenAI),
 * with robust fallback to structured offline legal summaries.
 */
export class LLMService {
  public constructor(private readonly secrets?: SecretReader) {}

  public async explainRisk(
    snippet: string,
    detectedLicense: string,
    projectLicense = 'MIT'
  ): Promise<ExplanationResult> {
    const config = this.readConfig();
    const vs = getVscode();
    const resolvedLocale =
      config.locale === 'auto' ? (vs?.env?.language ?? 'en') : config.locale;

    const prompt = buildExplanationPrompt({
      snippet,
      detectedLicense,
      projectLicense,
      locale: resolvedLocale
    });

    // 1. Local LLM Execution (e.g. Ollama or LM Studio)
    if (config.provider === 'local') {
      try {
        const payload = JSON.stringify({
          model: config.model || 'llama3',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in software licensing compliance and open-source legal risk analysis.'
            },
            { role: 'user', content: prompt }
          ],
          stream: false
        });

        const rawResponse = await makeHttpRequest(
          config.endpoint,
          payload,
          { 'Content-Type': 'application/json' },
          7000
        );

        const parsed = JSON.parse(rawResponse) as {
          choices?: Array<{ message?: { content?: string } }>;
          response?: string;
        };

        const generatedText =
          parsed.choices?.[0]?.message?.content || parsed.response;

        if (generatedText && generatedText.trim().length > 0) {
          return {
            text: generatedText.trim(),
            provider: 'Local LLM (Ollama / LocalAI)',
            model: config.model,
            isFallback: false,
            timestamp: Date.now()
          };
        }
      } catch {
        // Fall through to structured expert fallback if local LLM is offline
      }

      const fallback = getFixedLicenseSummary(detectedLicense);
      const note = `[Local LLM Mode Active]\nVerified legal summary (Offline mode - start your local server at ${config.endpoint} for live model reasoning):\n\n${fallback}`;
      return {
        text: note,
        provider: 'Local LLM (Offline Fallback)',
        model: config.model,
        isFallback: true,
        timestamp: Date.now()
      };
    }

    // 2. Cloud API Execution (OpenAI or Custom API)
    if (config.provider === 'openai' || config.provider === 'custom') {
      try {
        const getSecretFn = this.secrets?.getSecret ?? this.secrets?.get;
        const apiKey = getSecretFn
          ? (await getSecretFn.call(this.secrets, 'schemaAI.llmApiKey')) ||
            (await getSecretFn.call(this.secrets, 'schemaAI.openaiKey'))
          : undefined;

        if (!apiKey && config.provider === 'openai') {
          const fallback = getFixedLicenseSummary(detectedLicense);
          return {
            text: `[Cloud API Mode]\nNo OpenAI API key found in SecretStorage. Using verified offline legal summary:\n\n${fallback}`,
            provider: 'OpenAI API (Offline Fallback)',
            model: config.model,
            isFallback: true,
            timestamp: Date.now()
          };
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const payload = JSON.stringify({
          model: config.model || (config.provider === 'openai' ? 'gpt-4o-mini' : 'custom-model'),
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in software licensing compliance and open-source legal risk analysis.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2
        });

        const rawResponse = await makeHttpRequest(config.endpoint, payload, headers, 9000);
        const parsed = JSON.parse(rawResponse) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const generatedText = parsed.choices?.[0]?.message?.content;
        if (generatedText && generatedText.trim().length > 0) {
          return {
            text: generatedText.trim(),
            provider: config.provider === 'openai' ? 'OpenAI Cloud API' : 'Custom Cloud API',
            model: config.model,
            isFallback: false,
            timestamp: Date.now()
          };
        }
      } catch {
        // Fall through to fallback
      }
    }

    // Universal fallback
    const fallbackText = getFixedLicenseSummary(detectedLicense);
    return {
      text: fallbackText,
      provider: 'Offline Expert Summary',
      model: 'Rule-Based Engine',
      isFallback: true,
      timestamp: Date.now()
    };
  }

  public readConfig(): LLMConfig {
    const vs = getVscode();
    if (!vs?.workspace?.getConfiguration) {
      return {
        provider: 'local',
        endpoint: 'http://localhost:11434/v1/chat/completions',
        model: 'llama3',
        locale: 'auto'
      };
    }
    const cfg = vs.workspace.getConfiguration('schemaAI');
    return {
      provider: cfg.get<LLMProviderType>('llmProvider', 'local'),
      endpoint: cfg.get<string>(
        'llmEndpoint',
        'http://localhost:11434/v1/chat/completions'
      ),
      model: cfg.get<string>('llmModel', 'llama3'),
      locale: cfg.get<string>('llmLocale', 'auto')
    };
  }
}
