export interface QueuedAnalysisItem {
  id: string;
  text: string;
  fingerprint: string;
  fingerprintHash?: string;
  languageId?: string;
  documentUri?: unknown;
  range?: unknown;
  isManual?: boolean;
}

export type AnalysisWorker = (item: QueuedAnalysisItem) => Promise<unknown> | unknown;

export interface AnalysisQueueOptions {
  debounceMs?: number;
  worker?: AnalysisWorker;
  maxCacheSize?: number;
}

/**
 * Non-blocking asynchronous analysis queue with debouncing and memory caching.
 * Debounces rapid paste events (default: 500ms) and prevents duplicate analysis
 * of identical snippets.
 */
export class AnalysisQueue {
  private static instance?: AnalysisQueue;
  private readonly debounceMs: number;
  private readonly worker?: AnalysisWorker;
  private readonly maxCacheSize: number;

  private queue: QueuedAnalysisItem[] = [];
  private isProcessing = false;
  private debounceTimer?: NodeJS.Timeout;
  private resultCache = new Map<string, unknown>();

  constructor(options?: AnalysisQueueOptions) {
    this.debounceMs = options?.debounceMs ?? 500;
    this.worker = options?.worker;
    this.maxCacheSize = options?.maxCacheSize ?? 100;
  }

  public static getInstance(): AnalysisQueue {
    if (!AnalysisQueue.instance) {
      AnalysisQueue.instance = new AnalysisQueue();
    }
    return AnalysisQueue.instance;
  }

  public getDebounceMs(): number {
    return this.debounceMs;
  }

  /**
   * Enqueues an item for analysis without blocking caller execution.
   */
  public enqueue(item: QueuedAnalysisItem, immediate = false): void {
    const key = item.fingerprintHash || item.fingerprint;
    if (this.resultCache.has(key) && !item.isManual) {
      return;
    }

    const existingIndex = this.queue.findIndex(
      q => (q.fingerprintHash || q.fingerprint) === key
    );
    if (existingIndex >= 0) {
      this.queue[existingIndex] = item;
    } else {
      this.queue.push(item);
    }

    if (immediate) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = undefined;
      }
      void this.processQueue();
    } else {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = undefined;
        void this.processQueue();
      }, this.debounceMs);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) {
          continue;
        }

        const key = item.fingerprintHash || item.fingerprint;
        if (this.resultCache.has(key) && !item.isManual) {
          continue;
        }

        if (this.worker) {
          const result = await this.worker(item);
          this.cacheResult(key, result ?? true);
        } else {
          this.cacheResult(key, true);
        }
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        void this.processQueue();
      }
    }
  }

  private cacheResult(key: string, result: unknown): void {
    if (this.resultCache.size >= this.maxCacheSize) {
      const oldestKey = this.resultCache.keys().next().value;
      if (oldestKey) {
        this.resultCache.delete(oldestKey);
      }
    }
    this.resultCache.set(key, result);
  }

  public clearCache(): void {
    this.resultCache.clear();
  }

  public dispose(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
    this.queue = [];
  }
}
