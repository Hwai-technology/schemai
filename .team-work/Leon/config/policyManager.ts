import * as vscode from 'vscode';

export interface ProjectPolicy {
  projectLicense: string;
  allowedLicenses: string[];
  restrictedLicenses: string[];
}

/**
 * Reference Code for Leon (HU-01)
 * Moved out of prototype `analysisQueue.ts` and `extension.ts`.
 * Centralizes policy management, license rules, and workspace defaults.
 */
export class PolicyManager {
  private static readonly DEFAULT_ALLOWED = [
    'MIT',
    'APACHE-2.0',
    'BSD-2-CLAUSE',
    'BSD-3-CLAUSE',
    'ISC'
  ];

  private static readonly DEFAULT_RESTRICTED = [
    'GPL-3.0',
    'AGPL-3.0',
    'GPL-2.0',
    'AGPL-1.0',
    'SSPL'
  ];

  public static getActivePolicy(): ProjectPolicy {
    const config = vscode.workspace.getConfiguration('schemaAI');
    const projectLicense = config.get<string>('projectLicense') || 'MIT';

    return {
      projectLicense,
      allowedLicenses: [...this.DEFAULT_ALLOWED],
      restrictedLicenses: [...this.DEFAULT_RESTRICTED]
    };
  }
}
