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
 * License assumed when the workspace has not configured one.
 */
export const DEFAULT_PROJECT_LICENSE = 'MIT';

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
}
