import * as vscode from 'vscode';
import { PasteAuditEntry } from '../types';

export class HistoryStorage {
  private static readonly STORAGE_KEY = 'schemaAI.workspaceAuditHistory';
  private static readonly MAX_ENTRIES = 150;
  private workspaceState: vscode.Memento;

  constructor(workspaceState: vscode.Memento) {
    this.workspaceState = workspaceState;
  }

  /**
   * Retrieves all stored audit entries from workspace state
   */
  public getEntries(): PasteAuditEntry[] {
    const raw = this.workspaceState.get<PasteAuditEntry[]>(HistoryStorage.STORAGE_KEY);
    return Array.isArray(raw) ? raw : [];
  }

  /**
   * Saves an entry into the bounded circular buffer
   */
  public async addEntry(entry: PasteAuditEntry): Promise<void> {
    const entries = this.getEntries();
    // Prepend new entry so newest is first
    entries.unshift(entry);

    // Bound array to MAX_ENTRIES to prevent unbounded storage growth
    if (entries.length > HistoryStorage.MAX_ENTRIES) {
      entries.length = HistoryStorage.MAX_ENTRIES;
    }

    await this.workspaceState.update(HistoryStorage.STORAGE_KEY, entries);
  }

  /**
   * Updates an existing entry (e.g. reviewStatus or reviewNotes)
   */
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

  /**
   * Clears the entire workspace history
   */
  public async clear(): Promise<void> {
    await this.workspaceState.update(HistoryStorage.STORAGE_KEY, []);
  }
}

