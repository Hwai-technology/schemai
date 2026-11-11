const LLM_TOKEN_KEY = 'schemaAI.llmToken';
const LLM_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const FALLBACK_EXPLANATION = 'Unable to generate an explanation at this time.';

export interface LLMHttpRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

export interface LLMHttpClient {
  post(request: LLMHttpRequest): Promise<{ text: string }>;
}

export interface LLMTokenStore {
  get(key: string): Promise<string | undefined>;
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
    private readonly tokenStore: LLMTokenStore
  ) {}

  public async explain(
    snippet: string,
    riskData: LLMRiskData
  ): Promise<string> {
    try {
      const token = await this.tokenStore.get(LLM_TOKEN_KEY);
      if (!token) {
        return FALLBACK_EXPLANATION;
      }

      const response = await this.httpClient.post({
        url: LLM_ENDPOINT,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ snippet, riskData }),
      });

      return response.text;
    } catch {
      return FALLBACK_EXPLANATION;
    }
  }
}
