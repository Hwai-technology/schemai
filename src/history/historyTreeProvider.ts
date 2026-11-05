import * as vscode from 'vscode';
import { HistoryManager } from './historyManager';
import { PasteAuditEntry } from '../types';

export class PasteAuditTreeItem extends vscode.TreeItem {
  constructor(public readonly entry: PasteAuditEntry) {
    super(
      `[${entry.sourceMatch?.license || 'UNKNOWN'}] ${entry.fileName}`,
      vscode.TreeItemCollapsibleState.None
    );

    const dateStr = new Date(entry.timestamp).toLocaleTimeString();
    this.description = `${dateStr} · ${entry.riskLevel} (${entry.reviewStatus})`;

    this.tooltip = new vscode.MarkdownString(
      `### SchemAI Audit Detail\n\n` +
      `- **File:** \`${entry.fileName}\`\n` +
      `- **Risk Level:** **${entry.riskLevel}**\n` +
      `- **Detected License:** \`${entry.sourceMatch?.license || 'UNKNOWN'}\`\n` +
      `- **Source Repo:** [${entry.sourceMatch?.repository || 'None'}](${entry.sourceMatch?.url || '#'})\n` +
      `- **Status:** \`${entry.reviewStatus}\`\n` +
      `- **Reason:** ${entry.reason}\n\n` +
      `**Snippet Preview:**\n\`\`\`${entry.languageId}\n${entry.snippetPreview}\n\`\`\``
    );

    // Dynamic icon based on risk and review status
    if (entry.reviewStatus === 'FALSE_POSITIVE') {
      this.iconPath = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
    } else if (entry.riskLevel === 'FORBIDDEN' || entry.riskLevel === 'HIGH') {
      this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('errorForeground'));
    } else if (entry.riskLevel === 'WARNING' || entry.riskLevel === 'MEDIUM') {
      this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
    } else if (entry.riskLevel === 'UNKNOWN') {
      this.iconPath = new vscode.ThemeIcon('question', new vscode.ThemeColor('descriptionForeground'));
    } else {
      this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
    }

    this.command = {
      command: 'schemaAI.showAuditDetail',
      title: 'Show Audit Details',
      arguments: [entry]
    };

    this.contextValue = 'pasteAuditEntry';
  }
}

export class HistoryTreeProvider implements vscode.TreeDataProvider<PasteAuditTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PasteAuditTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private historyManager: HistoryManager;

  constructor(historyManager: HistoryManager) {
    this.historyManager = historyManager;

    this.historyManager.onHistoryChanged(() => {
      this._onDidChangeTreeData.fire();
    });
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: PasteAuditTreeItem): vscode.TreeItem {
    return element;
  }

  public getChildren(element?: PasteAuditTreeItem): Thenable<PasteAuditTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const entries = this.historyManager.getHistory();
    const items = entries.map(e => new PasteAuditTreeItem(e));
    return Promise.resolve(items);
  }
}

