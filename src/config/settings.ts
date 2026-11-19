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
 * Setting that stores the minimum similarity (0–1) a source must reach to be
 * reported as a match.
 */
export const SIMILARITY_THRESHOLD_SETTING = 'similarityThreshold';

/**
 * Setting that stores the minimum number of lines a fragment must have to be
 * analysed.
 */
export const MIN_FRAGMENT_LINES_SETTING = 'minFragmentLines';

/**
 * License assumed when the workspace has not configured one.
 */
export const DEFAULT_PROJECT_LICENSE = 'MIT';

/**
 * Automatic analysis is opt-out: it runs unless the user disables it.
 */
export const DEFAULT_AUTO_ANALYZE = true;

/**
 * Matches below this token similarity are treated as unrelated sources.
 */
export const DEFAULT_SIMILARITY_THRESHOLD = 0.8;

/**
 * Fragments shorter than this are too generic to be worth searching for.
 */
export const DEFAULT_MIN_FRAGMENT_LINES = 3;

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

  /**
   * Reads the minimum similarity a source must reach to be reported.
   * Values outside 0–1 (or non-numeric values) are clamped or defaulted so the
   * search layer never receives an impossible threshold.
   */
  public static getSimilarityThreshold(configuration: ConfigurationReader): number {
    const configured = configuration.get<number>(
      SIMILARITY_THRESHOLD_SETTING,
      DEFAULT_SIMILARITY_THRESHOLD
    );

    if (typeof configured !== 'number' || !Number.isFinite(configured)) {
      return DEFAULT_SIMILARITY_THRESHOLD;
    }

    return Math.min(1, Math.max(0, configured));
  }

  /**
   * Reads the minimum number of lines a fragment must have to be analysed.
   * Values below one (or non-numeric values) fall back to a valid line count so
   * trivial fragments cannot be analysed by accident.
   */
  public static getMinFragmentLines(configuration: ConfigurationReader): number {
    const configured = configuration.get<number>(
      MIN_FRAGMENT_LINES_SETTING,
      DEFAULT_MIN_FRAGMENT_LINES
    );

    if (typeof configured !== 'number' || !Number.isFinite(configured)) {
      return DEFAULT_MIN_FRAGMENT_LINES;
    }

    return Math.max(1, Math.floor(configured));
  }
}
