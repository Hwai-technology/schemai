import * as vscode from 'vscode';
import { CodeAnalyzer } from './codeAnalyzer';
import { SourceSearchEngine } from './sourceSearch';
import { RiskEngine } from './riskEngine';
import { AnalysisResult, ProjectPolicy } from './types';

export function activate(context: vscode.ExtensionContext) {
  console.log('SchemAI extension activated.');

  // Listen to document changes (detect paste or multi-character addition)
  let disposableListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
    if (event.contentChanges.length === 0) return;

    for (const change of event.contentChanges) {
      const insertedText = change.text;

      // Detect pasted code or multi-line/multi-character code insertion (10+ characters)
      if (insertedText.length >= 10 && CodeAnalyzer.isLikelyCode(insertedText)) {
        await processCodeSnippet(insertedText, event.document.languageId);
      }
    }
  });

  // Manual Command: Analyze Selection
  let disposableCommand = vscode.commands.registerCommand('schemaAI.analyzeSelection', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor found.');
      return;
    }

    const selectionText = editor.document.getText(editor.selection);
    if (!selectionText) {
      vscode.window.showInformationMessage('Please select some code to analyze.');
      return;
    }

    await processCodeSnippet(selectionText, editor.document.languageId, true);
  });

  context.subscriptions.push(disposableListener, disposableCommand);
}

async function processCodeSnippet(text: string, languageId: string, isManual = false) {
  const config = vscode.workspace.getConfiguration('schemaAI');
  const projectLicense = config.get<string>('projectLicense') || 'MIT';

  const policy: ProjectPolicy = {
    projectLicense: projectLicense,
    allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause'],
    restrictedLicenses: ['GPL-3.0', 'AGPL-3.0']
  };

  const fingerprint = CodeAnalyzer.generateFingerprint(text);
  const sourceMatch = await SourceSearchEngine.searchSource(fingerprint, languageId);
  const risk = RiskEngine.evaluateRisk(sourceMatch, policy);

  if (risk.riskLevel === 'HIGH' || risk.riskLevel === 'MEDIUM' || isManual) {
    displayResultNotification(sourceMatch, risk.riskLevel, risk.reason, projectLicense);
  }
}

function displayResultNotification(
  sourceMatch: any,
  riskLevel: string,
  reason: string,
  projectLicense: string
) {
  const message = `[SchemAI] Risk Level: ${riskLevel} | ${reason}`;
  
  if (riskLevel === 'HIGH') {
    vscode.window.showErrorMessage(message, 'View Details').then(selection => {
      if (selection === 'View Details' && sourceMatch) {
        vscode.env.openExternal(vscode.Uri.parse(sourceMatch.url));
      }
    });
  } else if (riskLevel === 'MEDIUM' || riskLevel === 'UNKNOWN') {
    vscode.window.showWarningMessage(message, 'View Details').then(selection => {
      if (selection === 'View Details' && sourceMatch) {
        vscode.env.openExternal(vscode.Uri.parse(sourceMatch.url));
      }
    });
  } else {
    vscode.window.showInformationMessage(`[SchemAI] Risk: LOW - Code appears compatible with ${projectLicense}.`);
  }
}

export function deactivate() {}