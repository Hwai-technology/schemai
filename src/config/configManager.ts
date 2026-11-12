import type * as vscode from 'vscode';
import { PROJECT_LICENSE_SETTING, SettingsManager } from './settings';
import type { ConfigurationReader } from './settings';

/**
 * Setting that stores the SPDX identifiers the project may use.
 */
export const ALLOWED_LICENSES_SETTING = 'allowedLicenses';

/**
 * Setting that stores the SPDX identifiers the project forbids.
 */
export const RESTRICTED_LICENSES_SETTING = 'restrictedLicenses';

/**
 * Licenses allowed by the prototype policy, now owned by `src/config/`.
 */
export const DEFAULT_ALLOWED_LICENSES: readonly string[] = [
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC'
];

/**
 * Licenses restricted by the prototype policy, now owned by `src/config/`.
 */
export const DEFAULT_RESTRICTED_LICENSES: readonly string[] = [
  'GPL-3.0',
  'AGPL-3.0',
  'GPL-2.0',
  'AGPL-1.0',
  'SSPL'
];

/**
 * License policy applied when analyzing pasted code.
 */
export interface ProjectPolicy {
  projectLicense: string;
  allowedLicenses: string[];
  restrictedLicenses: string[];
}

/**
 * Minimal configuration surface required to persist settings, kept narrow so
 * tests and callers can supply a fake.
 */
export type ConfigurationWriter = Pick<vscode.WorkspaceConfiguration, 'update'>;

/**
 * Reads and saves the SchemAI license policy.
 *
 * The policy used to be hard-coded in the prototype (`analysisQueue.ts` and
 * `extension.ts`); it now lives here so every feature reads the same values.
 */
export class ConfigManager {
  /**
   * Reads the project license and the allowed / restricted lists.
   * Each missing value falls back to its default.
   */
  public static getPolicy(configuration: ConfigurationReader): ProjectPolicy {
    const allowedLicenses = configuration.get<string[]>(ALLOWED_LICENSES_SETTING);
    const restrictedLicenses = configuration.get<string[]>(RESTRICTED_LICENSES_SETTING);

    return {
      projectLicense: SettingsManager.getProjectLicense(configuration),
      allowedLicenses: [...(allowedLicenses ?? DEFAULT_ALLOWED_LICENSES)],
      restrictedLicenses: [...(restrictedLicenses ?? DEFAULT_RESTRICTED_LICENSES)]
    };
  }

  /**
   * Saves the project license in the configuration store selected by `target`
   * (normally `vscode.ConfigurationTarget.Workspace`).
   */
  public static async saveProjectLicense(
    configuration: ConfigurationWriter,
    license: string,
    target: vscode.ConfigurationTarget
  ): Promise<void> {
    await configuration.update(PROJECT_LICENSE_SETTING, license, target);
  }
}
