import * as https from 'https';

/**
 * Reference Code for Yunus (HU-10)
 * Extracted from prototype `sourceSearch.ts`.
 * Resilient HTTP transport client with timeout handling and clean error recovery.
 */
export class HttpClient {
  public static httpGetJson<T>(
    url: string,
    headers: Record<string, string>,
    timeoutMs = 6000
  ): Promise<{ status: number; data: T | null } | null> {
    return new Promise(resolve => {
      const req = https.get(url, { headers, timeout: timeoutMs }, res => {
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode || 200, data: parsed });
          } catch {
            resolve({ status: res.statusCode || 200, data: null });
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  public static httpGetText(
    url: string,
    headers: Record<string, string>,
    timeoutMs = 6000
  ): Promise<string | null> {
    return new Promise(resolve => {
      const req = https.get(url, { headers, timeout: timeoutMs }, res => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => resolve(rawData));
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }
}
