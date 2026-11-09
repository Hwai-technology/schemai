import * as vscode from 'vscode';
import { PasteAuditEntry } from './historyManager';

/**
 * Reference Code for Yusuf (HU-13)
 * Circular storage bounded to 150 entries in workspaceState.
 */
export class HistoryStorage {
  private static readonly STORAGE_KEY = 'schemaAI.workspaceAuditHistory';
  private static readonly MAX_ENTRIES = 150;
  private workspaceState: vscode.Memento;

  constructor(workspaceState: vscode.Memento) {
    this.workspaceState = workspaceState;
  }

  public getEntries(): PasteAuditEntry[] {
    const raw = this.workspaceState.get<PasteAuditEntry[]>(HistoryStorage.STORAGE_KEY);
    return Array.isArray(raw) ? raw : [];
  }

  public async addEntry(entry: PasteAuditEntry): Promise<void> {
    const entries = this.getEntries();
    entries.unshift(entry);

    if (entries.length > HistoryStorage.MAX_ENTRIES) {
      entries.length = HistoryStorage.MAX_ENTRIES;
    }

    await this.workspaceState.update(HistoryStorage.STORAGE_KEY, entries);
  }

  public async updateEntry(
    id: string,
    updates: Partial<PasteAuditEntry>
  ): Promise<boolean> {
    const entries = this.getEntries();
    const index = entries.findIndex(e => e.id === id);
    if (index === -1) return false;

    entries[index] = { ...entries[index], ...updates };
    await this.workspaceState.update(HistoryStorage.STORAGE_KEY, entries);
    return true;
  }

  public async clear(): Promise<void> {
    await this.workspaceState.update(HistoryStorage.STORAGE_KEY, []);
  }
}

