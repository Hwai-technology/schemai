import type * as vscode from 'vscode';

/**
 * VS Code configuration section used by the extension.
 */
export const SETTINGS_SECTION = 'schemaAI';

/**
 * Setting that stores the SPDX identifier of the project license.
 */
export const PROJECT_LICENSE_SETTING = 'projectLicense';

/**
 * Setting that enables or disables the automatic analysis of pasted code.
 */
export const AUTO_ANALYZE_SETTING = 'autoAnalyze';

/**
 * License assumed when the workspace has not configured one.
 */
export const DEFAULT_PROJECT_LICENSE = 'MIT';

/**
 * Automatic analysis is opt-out: it runs unless the user disables it.
 */
export const DEFAULT_AUTO_ANALYZE = true;

/**
 * Minimal configuration surface required by {@link SettingsManager}.
 * Kept narrow so callers and tests can supply a fake configuration.
 */
export type ConfigurationReader = Pick<vscode.WorkspaceConfiguration, 'get'>;

/**
 * Reads the SchemAI settings from a VS Code workspace configuration.
 */
export class SettingsManager {
  public static getProjectLicense(configuration: ConfigurationReader): string {
    return configuration.get<string>(PROJECT_LICENSE_SETTING, DEFAULT_PROJECT_LICENSE);
  }

  /**
   * Tells the paste monitor whether it should analyze a detected paste.
   */
  public static isAutoAnalyzeEnabled(configuration: ConfigurationReader): boolean {
    return configuration.get<boolean>(AUTO_ANALYZE_SETTING, DEFAULT_AUTO_ANALYZE);
  }
}
