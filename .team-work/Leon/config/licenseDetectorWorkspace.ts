import * as vscode from 'vscode';

/**
 * Reference Code for Leon (HU-04)
 * Detects project license from the workspace root LICENSE file.
 */
export class WorkspaceLicenseDetector {
  public static async detectWorkspaceLicense(): Promise<string | undefined> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return undefined;

    const rootUri = folders[0].uri;
    const candidates = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license'];

    for (const name of candidates) {
      try {
        const fileUri = vscode.Uri.joinPath(rootUri, name);
        const data = await vscode.workspace.fs.readFile(fileUri);
        const content = Buffer.from(data).toString('utf-8').toLowerCase();

        if (content.includes('mit license') || content.includes('permission is hereby granted')) {
          return 'MIT';
        }
        if (content.includes('apache license') && content.includes('version 2.0')) {
          return 'Apache-2.0';
        }
        if (content.includes('gnu general public license')) {
          return 'GPL-3.0';
        }
      } catch {
        // File does not exist, check next candidate
      }
    }

    return undefined;
  }
}

