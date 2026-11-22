import * as vscode from 'vscode';
import type { HistoryManager } from '../history/historyManager';
import type { IAuditRecord } from '../history/historyStorage';

// Safe base class fallback when executed in test environments without a full vscode runtime
const TreeItemBase = (vscode.TreeItem ?? class {
  public label?: string;
  public collapsibleState?: number;
  constructor(label?: string, collapsibleState?: number) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}) as typeof vscode.TreeItem;

export class PasteAuditTreeItem extends TreeItemBase {
  constructor(public readonly entry: IAuditRecord) {
    const fileName = entry.filePath.split(/[/\\]/).pop() || entry.filePath;
    super(
      `[${entry.license || 'UNKNOWN'}] ${fileName}`,
      vscode.TreeItemCollapsibleState?.None ?? 0
    );

    const dateStr = new Date(entry.timestamp).toLocaleTimeString();
    this.description = `${dateStr} · ${entry.riskLevel} (${entry.reviewStatus})`;

    if (vscode.MarkdownString) {
      this.tooltip = new vscode.MarkdownString(
        `### SchemAI Audit Detail\n\n` +
        `- **File:** \`${fileName}\`\n` +
        `- **Risk Level:** **${entry.riskLevel}**\n` +
        `- **Detected License:** \`${entry.license || 'UNKNOWN'}\`\n` +
        `- **Source Repo:** [${entry.sourceUrl || 'None'}](${entry.sourceUrl || '#'})\n` +
        `- **Status:** \`${entry.reviewStatus}\`\n` +
        `- **Reason:** ${entry.reason}\n`
      );
    } else {
      this.tooltip = `File: ${fileName} | Risk: ${entry.riskLevel} | License: ${entry.license || 'UNKNOWN'}`;
    }

    if (vscode.ThemeIcon) {
      if (entry.reviewStatus === 'FALSE_POSITIVE') {
        this.iconPath = new vscode.ThemeIcon(
          'pass-filled',
          vscode.ThemeColor ? new vscode.ThemeColor('testing.iconPassed') : undefined
        );
      } else if (
        entry.riskLevel === 'critical' ||
        entry.riskLevel === 'high' ||
        entry.riskLevel === 'CRITICAL' ||
        entry.riskLevel === 'HIGH'
      ) {
        this.iconPath = new vscode.ThemeIcon(
          'error',
          vscode.ThemeColor ? new vscode.ThemeColor('errorForeground') : undefined
        );
      } else if (
        entry.riskLevel === 'medium' ||
        entry.riskLevel === 'MEDIUM' ||
        entry.riskLevel === 'warning'
      ) {
        this.iconPath = new vscode.ThemeIcon(
          'warning',
          vscode.ThemeColor ? new vscode.ThemeColor('editorWarning.foreground') : undefined
        );
      } else {
        this.iconPath = new vscode.ThemeIcon(
          'check',
          vscode.ThemeColor ? new vscode.ThemeColor('testing.iconPassed') : undefined
        );
      }
    }

    this.contextValue = 'pasteAuditEntry';
  }
}

export class HistoryTreeProvider implements vscode.TreeDataProvider<PasteAuditTreeItem> {
  private _onDidChangeTreeData = vscode.EventEmitter
    ? new vscode.EventEmitter<PasteAuditTreeItem | undefined | null | void>()
    : undefined;
  readonly onDidChangeTreeData =
    this._onDidChangeTreeData?.event ?? (() => ({ dispose: () => {} }));

  constructor(private readonly historyManager: HistoryManager) {
    this.historyManager.onHistoryChanged(() => {
      this._onDidChangeTreeData?.fire();
    });
  }

  public refresh(): void {
    this._onDidChangeTreeData?.fire();
  }

  public getTreeItem(element: PasteAuditTreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: PasteAuditTreeItem): Thenable<PasteAuditTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const entries = this.historyManager.getRecords();
    const items = entries.map((e) => new PasteAuditTreeItem(e));
    return Promise.resolve(items);
  }
}
