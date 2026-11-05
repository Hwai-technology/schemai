import * as vscode from 'vscode';
import { AnalysisResult, ProjectPolicy } from '../types';
import { SourceSearchEngine } from '../sourceSearch';
import { RiskEngine } from '../riskEngine';
import { CodeAnalyzer } from '../codeAnalyzer';

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

export class AnalysisQueue {
  private static instance: AnalysisQueue;
  private queue: QueuedAnalysisItem[] = [];
  private isProcessing = false;
  private debounceTimer: NodeJS.Timeout | undefined;
  private currentCts: vscode.CancellationTokenSource | undefined;

  // Cache: hash -> AnalysisResult (maximum 100 entries)
  private resultCache = new Map<string, AnalysisResult>();
  private readonly maxCacheSize = 100;

  private onAnalysisCompleteEmitter = new vscode.EventEmitter<{
    item: QueuedAnalysisItem;
    result: AnalysisResult;
  }>();
  public readonly onAnalysisComplete = this.onAnalysisCompleteEmitter.event;

  private constructor() {}

  public static getInstance(): AnalysisQueue {
    if (!AnalysisQueue.instance) {
      AnalysisQueue.instance = new AnalysisQueue();
    }
    return AnalysisQueue.instance;
  }

  /**
   * Enqueues an analysis request non-blockingly with debouncing
   */
  public enqueue(item: QueuedAnalysisItem, immediate = false): void {
    // Check if result is already in memory cache
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
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) continue;

        // Cancel any previous in-flight task
        if (this.currentCts) {
          this.currentCts.cancel();
          this.currentCts.dispose();
        }
        this.currentCts = new vscode.CancellationTokenSource();
        const token = this.currentCts.token;

        if (token.isCancellationRequested) continue;

        const result = await this.executeAnalysis(item, token);
        if (result && !token.isCancellationRequested) {
          // Cache the result
          this.cacheResult(item.fingerprintHash, result);
          this.onAnalysisCompleteEmitter.fire({ item, result });
        }
      }
    } finally {
      this.isProcessing = false;
      if (this.currentCts) {
        this.currentCts.dispose();
        this.currentCts = undefined;
      }
    }
  }

  private async executeAnalysis(
    item: QueuedAnalysisItem,
    token: vscode.CancellationToken
  ): Promise<AnalysisResult | undefined> {
    const config = vscode.workspace.getConfiguration('schemaAI');
    const projectLicense = config.get<string>('projectLicense') || 'MIT';

    const policy: ProjectPolicy = {
      projectLicense,
      allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC'],
      restrictedLicenses: ['GPL-3.0', 'AGPL-3.0', 'GPL-2.0', 'AGPL-1.0', 'SSPL']
    };

    if (token.isCancellationRequested) return undefined;

    // Search source via SourceSearchEngine
    const sourceMatch = await SourceSearchEngine.searchSource(
      item.fingerprint,
      item.languageId
    );

    if (token.isCancellationRequested) return undefined;

    const risk = RiskEngine.evaluateRisk(sourceMatch, policy);

    return {
      isCode: true,
      language: item.languageId,
      fingerprint: item.fingerprint,
      fingerprintHash: item.fingerprintHash,
      sourceMatch,
      projectPolicy: projectLicense,
      riskLevel: risk.riskLevel,
      reason: risk.reason,
      confidence: sourceMatch?.similarity ? sourceMatch.similarity / 100 : 0.95
    };
  }

  private cacheResult(hash: string, result: AnalysisResult): void {
    if (this.resultCache.size >= this.maxCacheSize) {
      const firstKey = this.resultCache.keys().next().value;
      if (firstKey) this.resultCache.delete(firstKey);
    }
    this.resultCache.set(hash, result);
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

