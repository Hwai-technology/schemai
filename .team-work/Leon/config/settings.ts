import * as vscode from 'vscode';

/**
 * Reference Code for Leon (HU-01)
 * Configuration wrapper for SchemAI settings.
 */
export class SettingsManager {
  private static readonly SECTION = 'schemaAI';

  public static getProjectLicense(): string {
    return vscode.workspace.getConfiguration(this.SECTION).get<string>('projectLicense', 'MIT');
  }

  public static async setProjectLicense(license: string): Promise<void> {
    await vscode.workspace.getConfiguration(this.SECTION).update(
      'projectLicense',
      license,
      vscode.ConfigurationTarget.Workspace
    );
  }
}
