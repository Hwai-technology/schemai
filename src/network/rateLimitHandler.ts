export interface RateLimitResponse {
  statusCode: number;
  headers?: Record<string, string | undefined>;
}

export interface RateLimitResult {
  isRateLimited: boolean;
  message?: string;
  actions?: string[];
  resetTime?: Date;
}

export interface RateLimitHandlerOptions {
  baseDelayMs?: number;
  maxRetries?: number;
}

export class RateLimitHandler {
  private readonly baseDelayMs: number;
  private readonly maxRetries: number;

  constructor(options: RateLimitHandlerOptions = {}) {
    this.baseDelayMs = options.baseDelayMs ?? 1000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  public isRateLimited(statusCode: number, headers?: Record<string, string | undefined>): boolean {
    if (statusCode === 429) {
      return true;
    }
    if (statusCode === 403) {
      const remaining = headers?.['x-ratelimit-remaining'] ?? headers?.['X-RateLimit-Remaining'];
      return remaining === '0';
    }
    return false;
  }

  public async handleRateLimit(response: RateLimitResponse): Promise<RateLimitResult> {
    if (!this.isRateLimited(response.statusCode, response.headers)) {
      return { isRateLimited: false };
    }

    const resetHeader =
      response.headers?.['x-ratelimit-reset'] ?? response.headers?.['X-RateLimit-Reset'];
    const resetTimestamp = resetHeader ? parseInt(resetHeader, 10) : NaN;
    const resetTime = !isNaN(resetTimestamp) ? new Date(resetTimestamp * 1000) : undefined;
    const resetText = resetTime ? resetTime.toISOString() : 'shortly';

    return {
      isRateLimited: true,
      message: `GitHub API rate limit exceeded. Limit resets at ${resetText}.`,
      actions: ['Retry', 'Dismiss'],
      resetTime
    };
  }

  public async executeWithRetry<T extends RateLimitResponse>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    let attempt = 0;
    let lastResponse = await requestFn();

    while (lastResponse.statusCode === 429 && attempt < this.maxRetries) {
      const delay = this.baseDelayMs * Math.pow(2, attempt);
      await this.sleep(delay);
      attempt++;
      lastResponse = await requestFn();
    }

    return lastResponse;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
