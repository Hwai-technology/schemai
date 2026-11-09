import * as vscode from 'vscode';

export interface QueuedAnalysisItem {
  id: string;
  text: string;
  fingerprint: string;
  fingerprintHash: string;
  languageId: string;
  documentUri: vscode.Uri;
  range?: vscode.Range;
  isManual?: boolean;
}

/**
 * Reference Code for Ahmet (HU-05)
 * Non-blocking asynchronous analysis queue with debouncing and memory cache.
 * Note: Decoupled from hardcoded policy (delegates policy to config module).
 */
export class AnalysisQueue {
  private static instance: AnalysisQueue;
  private queue: QueuedAnalysisItem[] = [];
  private isProcessing = false;
  private debounceTimer: NodeJS.Timeout | undefined;
  private currentCts: vscode.CancellationTokenSource | undefined;

  private resultCache = new Map<string, any>();
  private readonly maxCacheSize = 100;

  private onAnalysisCompleteEmitter = new vscode.EventEmitter<{
    item: QueuedAnalysisItem;
    result: any;
  }>();
  public readonly onAnalysisComplete = this.onAnalysisCompleteEmitter.event;

  private constructor() {}

  public static getInstance(): AnalysisQueue {
    if (!AnalysisQueue.instance) {
      AnalysisQueue.instance = new AnalysisQueue();
    }
    return AnalysisQueue.instance;
  }

  public enqueue(item: QueuedAnalysisItem, immediate = false): void {
    const cachedResult = this.resultCache.get(item.fingerprintHash);
    if (cachedResult && !item.isManual) {
      this.onAnalysisCompleteEmitter.fire({ item, result: cachedResult });
      return;
    }

    this.queue.push(item);

    if (immediate) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.processQueue();
    } else {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.processQueue();
      }, 350);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) continue;

        if (this.currentCts) {
          this.currentCts.cancel();
          this.currentCts.dispose();
        }
        this.currentCts = new vscode.CancellationTokenSource();
        const token = this.currentCts.token;

        if (token.isCancellationRequested) continue;

        // In Sprint 1 integration: invoke search and license evaluator
        // this.cacheResult(item.fingerprintHash, result);
        // this.onAnalysisCompleteEmitter.fire({ item, result });
      }
    } finally {
      this.isProcessing = false;
      if (this.currentCts) {
        this.currentCts.dispose();
        this.currentCts = undefined;
      }
    }
  }

  public clearCache(): void {
    this.resultCache.clear();
  }

  public dispose(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (this.currentCts) this.currentCts.dispose();
    this.onAnalysisCompleteEmitter.dispose();
  }
}

