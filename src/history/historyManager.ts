import * as vscode from 'vscode';
import { HistoryStorage } from './historyStorage';
import { PasteAuditEntry, AnalysisResult, ReviewStatus } from '../types';

export class HistoryManager {
  private static instance: HistoryManager;
  private storage: HistoryStorage;
  private onHistoryChangedEmitter = new vscode.EventEmitter<PasteAuditEntry[]>();
  public readonly onHistoryChanged = this.onHistoryChangedEmitter.event;

  private constructor(storage: HistoryStorage) {
    this.storage = storage;
  }

  public static initialize(workspaceState: vscode.Memento): HistoryManager {
    if (!HistoryManager.instance) {
      const storage = new HistoryStorage(workspaceState);
      HistoryManager.instance = new HistoryManager(storage);
    }
    return HistoryManager.instance;
  }

  public static getInstance(): HistoryManager {
    if (!HistoryManager.instance) {
      throw new Error('HistoryManager is not initialized.');
    }
    return HistoryManager.instance;
  }

  /**
   * Records a completed analysis into persistent history
   */
  public async recordAnalysis(
    result: AnalysisResult,
    fileName: string,
    filePath: string,
    rawText: string,
    lineRange?: { startLine: number; endLine: number }
  ): Promise<PasteAuditEntry> {
    const entry: PasteAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      fileName,
      filePath,
      languageId: result.language,
      lineRange,
      snippetPreview: rawText.substring(0, 180).replace(/\r?\n/g, ' '),
      fingerprintHash: result.fingerprintHash || '',
      sourceMatch: result.sourceMatch,
      riskLevel: result.riskLevel,
      reason: result.reason,
      reviewStatus: 'PENDING'
    };

    await this.storage.addEntry(entry);
    this.onHistoryChangedEmitter.fire(this.getHistory());
    return entry;
  }

  public getHistory(): PasteAuditEntry[] {
    return this.storage.getEntries();
  }

  public getLastEntry(): PasteAuditEntry | undefined {
    const entries = this.getHistory();
    return entries.length > 0 ? entries[0] : undefined;
  }

  /**
   * HU-13: Mark an alert as reviewed
   */
  public async markReviewed(id: string, notes?: string): Promise<boolean> {
    const success = await this.storage.updateEntry(id, {
      reviewStatus: 'REVIEWED',
      reviewNotes: notes
    });
    if (success) {
      this.onHistoryChangedEmitter.fire(this.getHistory());
    }
    return success;
  }

  /**
   * HU-13: Mark an alert as false positive
   */
  public async markFalsePositive(id: string, notes?: string): Promise<boolean> {
    const success = await this.storage.updateEntry(id, {
      reviewStatus: 'FALSE_POSITIVE',
      reviewNotes: notes || 'Marked as false positive by user'
    });
    if (success) {
      this.onHistoryChangedEmitter.fire(this.getHistory());
    }
    return success;
  }

  public async clearHistory(): Promise<void> {
    await this.storage.clear();
    this.onHistoryChangedEmitter.fire([]);
  }

  public dispose(): void {
    this.onHistoryChangedEmitter.dispose();
  }
}

