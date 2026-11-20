import 'mocha';
import * as assert from 'assert';
import { RateLimitHandler } from '../../network/rateLimitHandler';

describe('HU-10-T2: Read GitHub Rate-Limit Headers and Offer a Retry', () => {
  it('should detect 403 with x-ratelimit-remaining: 0, format reset time message, and offer a Retry option', async () => {
    const resetTimestamp = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
    const handler = new RateLimitHandler();

    const result = await handler.handleRateLimit({
      statusCode: 403,
      headers: {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(resetTimestamp)
      }
    });

    assert.strictEqual(result.isRateLimited, true, 'Should detect 403 rate limit when remaining is 0');
    assert.ok(result.message && result.message.length > 0, 'Should include a message with the reset time');
    assert.ok(Array.isArray(result.actions) && result.actions.includes('Retry'), 'Should offer a "Retry" option');
  });

  it('should perform exponential back-off and retry up to 3 times on HTTP 429', async () => {
    const handler = new RateLimitHandler({ baseDelayMs: 1 });
    let attemptCount = 0;

    const result = await handler.executeWithRetry(async () => {
      attemptCount++;
      return { statusCode: 429, headers: {} };
    });

    // Initial attempt (1) + up to 3 retries = 4 total calls
    assert.strictEqual(attemptCount, 4, 'Should retry up to 3 times after initial 429 response');
    assert.strictEqual(result.statusCode, 429, 'Should return final 429 response after exhausting retries');
  });
});
