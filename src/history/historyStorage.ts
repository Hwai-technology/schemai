/** Key under which the audit records are kept in `context.workspaceState`. */
export const HISTORY_STORAGE_KEY = 'schemaAI.auditHistory';

export type ReviewStatus = 'PENDING' | 'REVIEWED' | 'FALSE_POSITIVE';

/** One analysed alert in the audit history (README: `IAuditRecord`, plus its review status). */
export interface IAuditRecord {
  id: string;
  timestamp: number;
  filePath: string;
  sourceUrl?: string;
  license?: string;
  riskLevel: string;
  reason: string;
  reviewStatus: ReviewStatus;
}

/** The part of `vscode.Memento` (`context.workspaceState`) used here, so tests can inject a fake. */
export interface MementoLike {
  get<T>(key: string): T | undefined;
  update(key: string, value: unknown): Thenable<void>;
}

/** Persists the audit records in the workspace state, so they survive a window reload. */
export class HistoryStorage {
  constructor(private readonly memento: MementoLike) {}

  public getAll(): IAuditRecord[] {
    const stored = this.memento.get<IAuditRecord[]>(HISTORY_STORAGE_KEY);
    return Array.isArray(stored) ? stored.map((record) => ({ ...record })) : [];
  }

  public async add(record: IAuditRecord): Promise<void> {
    await this.memento.update(HISTORY_STORAGE_KEY, [...this.getAll(), record]);
  }

  /** Applies `changes` to the record with this id. Returns `false` (and writes nothing) if there is none. */
  public async update(id: string, changes: Partial<Omit<IAuditRecord, 'id'>>): Promise<boolean> {
    const records = this.getAll();
    const index = records.findIndex((record) => record.id === id);
    if (index === -1) {
      return false;
    }
    records[index] = { ...records[index], ...changes };
    await this.memento.update(HISTORY_STORAGE_KEY, records);
    return true;
  }
}
