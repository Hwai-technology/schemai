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

export interface AnalysisCompleteEvent {
  item: QueuedAnalysisItem;
  result: unknown;
}

export type AnalysisCompleteListener = (event: AnalysisCompleteEvent) => void;

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
  private listeners: AnalysisCompleteListener[] = [];

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

        let result: unknown;
        if (this.worker) {
          result = await this.worker(item);
          this.cacheResult(key, result ?? true);
        } else {
          result = true;
          this.cacheResult(key, true);
        }

        for (const listener of this.listeners) {
          try {
            listener({ item, result });
          } catch {
            // Ignore subscriber errors to preserve queue execution
          }
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

  public onAnalysisComplete(listener: AnalysisCompleteListener): { dispose(): void } {
    this.listeners.push(listener);
    return {
      dispose: () => {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
          this.listeners.splice(index, 1);
        }
      }
    };
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
    this.listeners = [];
  }
}

/**
 * Creates an event handler compatible with PasteMonitor that delegates
 * detected paste events into the asynchronous analysis queue.
 */
export function createPasteAnalysisHandler(
  queue: AnalysisQueue,
  generateFingerprint?: (text: string) => string
): (paste: { text: string; languageId: string; documentUri: unknown; range: unknown }) => void {
  let counter = 0;
  return (paste) => {
    const fingerprint = generateFingerprint ? generateFingerprint(paste.text) : paste.text.trim();
    queue.enqueue({
      id: `paste-${Date.now()}-${++counter}`,
      text: paste.text,
      fingerprint,
      fingerprintHash: fingerprint,
      languageId: paste.languageId,
      documentUri: paste.documentUri,
      range: paste.range
    });
  };
}
