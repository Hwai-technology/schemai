import * as vscode from 'vscode';
import { HistoryManager } from '../history/historyManager';

export class SchemAIHoverProvider implements vscode.HoverProvider {
  private historyManager: HistoryManager;

  constructor(historyManager: HistoryManager) {
    this.historyManager = historyManager;
  }

  public register(context: vscode.ExtensionContext): void {
    const selector: vscode.DocumentSelector = [
      { scheme: 'file' },
      { scheme: 'untitled' }
    ];
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(selector, this)
    );
  }

  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const history = this.historyManager.getHistory();
    const docPath = document.uri.fsPath;

    // Find any audit entry matching this file and position
    const match = history.find(entry => {
      if (entry.filePath !== docPath) return false;
      if (!entry.lineRange) return false;
      return (
        position.line >= entry.lineRange.startLine &&
        position.line <= entry.lineRange.endLine
      );
    });

    if (!match || match.riskLevel === 'SAFE' || match.riskLevel === 'LOW') {
      return null;
    }

    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.appendMarkdown(`### 🛡️ SchemAI License Alert: **${match.riskLevel}**\n\n`);
    md.appendMarkdown(`- **Detected License:** \`${match.sourceMatch?.license || 'UNKNOWN'}\`\n`);
    md.appendMarkdown(`- **Source Repo:** [${match.sourceMatch?.repository || 'External'}](${match.sourceMatch?.url || '#'})\n`);
    md.appendMarkdown(`- **Risk Reason:** ${match.reason}\n`);
    md.appendMarkdown(`- **Review Status:** \`${match.reviewStatus}\`\n\n`);
    md.appendMarkdown(`[Inspect Audit Log](command:schemaAI.showAuditLog) | [Open Source URL](${match.sourceMatch?.url || '#'})`);

    return new vscode.Hover(md);
  }
}

