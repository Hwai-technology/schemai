import type * as vscode from 'vscode';
import type { AlertInput, DiagnosticsManager } from '../alerts/diagnosticsManager';
import type { HistoryStorage, IAuditRecord } from './historyStorage';

/** The alerts API (`src/alerts/`) used to show and hide diagnostics. */
export type AlertsPort = Pick<DiagnosticsManager, 'report' | 'clear'>;

/**
 * Keeps the audit history of alerts and lets the user mark them as reviewed or false positive.
 */
export class HistoryManager {
  /** Alerts reported in this session that are still shown, by record id. */
  private readonly activeAlerts = new Map<string, AlertInput>();
  /** Alerts marked as false positive in this session, kept so they can be shown again on restore. */
  private readonly ignoredAlerts = new Map<string, AlertInput>();

  constructor(
    private readonly storage: HistoryStorage,
    private readonly alerts: AlertsPort
  ) {}

  /** Adds a reported alert to the history as pending. */
  public async record(alert: AlertInput): Promise<IAuditRecord> {
    const record: IAuditRecord = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      filePath: alert.uri.toString(),
      sourceUrl: alert.sourceRepo,
      license: alert.license,
      riskLevel: alert.severity,
      reason: alert.reason,
      reviewStatus: 'PENDING'
    };
    await this.storage.add(record);
    this.activeAlerts.set(record.id, alert);
    return record;
  }

  public getRecords(): IAuditRecord[] {
    return this.storage.getAll();
  }

  /** The user has seen the alert and it is a real risk: persist the flag, keep the diagnostic. */
  public markReviewed(id: string): Promise<boolean> {
    return this.storage.update(id, { reviewStatus: 'REVIEWED' });
  }

  /** The alert is wrong: persist it and remove its diagnostic, keeping the other alerts of the document. */
  public async markFalsePositive(id: string): Promise<boolean> {
    const updated = await this.storage.update(id, { reviewStatus: 'FALSE_POSITIVE' });
    const alert = this.activeAlerts.get(id);
    if (updated && alert) {
      this.activeAlerts.delete(id);
      this.ignoredAlerts.set(id, alert);
      this.redrawDocument(alert.uri);
    }
    return updated;
  }

  /** Alerts the user marked as false positive (also those from previous sessions). */
  public getIgnored(): IAuditRecord[] {
    return this.getRecords().filter((record) => record.reviewStatus === 'FALSE_POSITIVE');
  }

  /**
   * Undoes a false positive: the record is pending again and its diagnostic is shown again.
   * Returns `false` (and changes nothing) if the alert is not ignored.
   *
   * An alert ignored in a previous session has no live document data any more, so only its
   * status changes; the diagnostic comes back the next time that code is analysed.
   */
  public async restore(id: string): Promise<boolean> {
    if (!this.getIgnored().some((record) => record.id === id)) {
      return false;
    }
    await this.storage.update(id, { reviewStatus: 'PENDING' });

    const alert = this.ignoredAlerts.get(id);
    if (alert) {
      this.ignoredAlerts.delete(id);
      this.activeAlerts.set(id, alert);
      this.alerts.report(alert);
    }
    return true;
  }

  /**
   * The alerts API can only clear a whole document, so clear it and report again
   * the alerts of that document that are still active.
   */
  private redrawDocument(uri: vscode.Uri): void {
    this.alerts.clear(uri);
    for (const alert of this.activeAlerts.values()) {
      if (alert.uri.toString() === uri.toString()) {
        this.alerts.report(alert);
      }
    }
  }
}
