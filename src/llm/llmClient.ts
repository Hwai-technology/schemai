const LLM_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const FALLBACK_EXPLANATION = 'Unable to generate an explanation at this time.';
const DEFAULT_TIMEOUT_MS = 10_000;

export interface LLMHttpRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface LLMHttpClient {
  post(request: LLMHttpRequest): Promise<{ text: string }>;
}

export interface LLMTokenStore {
  getLlmApiKey(): Promise<string | undefined>;
}

export interface LLMRiskData {
  [key: string]: unknown;
}

/**
 * Sends license-risk data to the configured LLM provider.
 *
 * The token is only used to construct the authorization header and is never
 * written to logs or diagnostic messages.
 */
export class LLMClient {
  public constructor(
    private readonly httpClient: LLMHttpClient,
    private readonly tokenStore: LLMTokenStore,
    private readonly timeoutMs = DEFAULT_TIMEOUT_MS
  ) {}

  public async explain(
    snippet: string,
    riskData: LLMRiskData
  ): Promise<string> {
    try {
      const token = await this.tokenStore.getLlmApiKey();
      if (!token) {
        return FALLBACK_EXPLANATION;
      }

      const request = this.httpClient.post({
        url: LLM_ENDPOINT,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ snippet, riskData }),
      });
      let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timeoutHandle = setTimeout(
          () => reject(new Error('LLM request timed out')),
          this.timeoutMs
        );
      });
      try {
        const response = await Promise.race([request, timeout]);

        return response.text;
      } finally {
        if (timeoutHandle !== undefined) {
          clearTimeout(timeoutHandle);
        }
      }
    } catch {
      return FALLBACK_EXPLANATION;
    }
  }
}
