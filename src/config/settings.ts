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
 * Returns the configuration object to read. A function (instead of the object
 * itself) is used so a change can re-read the settings with `getConfiguration`.
 */
export type ConfigurationProvider = () => ConfigurationReader;

/**
 * Minimal workspace surface required to observe configuration changes.
 * Kept narrow so callers and tests can supply a fake event source.
 */
export interface ConfigurationChangeSource {
  onDidChangeConfiguration(
    listener: (event: vscode.ConfigurationChangeEvent) => unknown
  ): vscode.Disposable;
}

/**
 * Snapshot of the SchemAI settings currently in effect.
 */
export interface SchemASettings {
  readonly projectLicense: string;
  readonly autoAnalyze: boolean;
}

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
   * Reads every setting managed by this module at once.
   */
  public static readSettings(configuration: ConfigurationReader): SchemASettings {
    return {
      projectLicense: SettingsManager.getProjectLicense(configuration),
      autoAnalyze: SettingsManager.isAutoAnalyzeEnabled(configuration)
    };
  }

  /**
   * Creates a watcher that keeps a settings snapshot up to date when the
   * `schemaAI` section changes. Changes from other extensions are ignored.
   */
  public static watch(
    source: ConfigurationChangeSource,
    configuration: ConfigurationProvider,
    onChange?: (settings: SchemASettings) => void
  ): SettingsWatcher {
    return new SettingsWatcher(source, configuration, onChange);
  }
}

/**
 * Keeps a snapshot of the SchemAI settings in sync with VS Code.
 *
 * VS Code does not reload an extension when its configuration changes, so
 * consumers (the paste monitor, the analysis pipeline…) can read this snapshot
 * and be notified through `onChange` instead of asking the user to reload the
 * window.
 */
export class SettingsWatcher {
  private current: SchemASettings;
  private readonly subscription: vscode.Disposable;

  public constructor(
    source: ConfigurationChangeSource,
    private readonly configuration: ConfigurationProvider,
    private readonly onChange?: (settings: SchemASettings) => void
  ) {
    this.current = SettingsManager.readSettings(configuration());
    this.subscription = source.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(SETTINGS_SECTION)) {
        this.reload();
      }
    });
  }

  /** Settings currently in effect. */
  public get settings(): SchemASettings {
    return this.current;
  }

  public get projectLicense(): string {
    return this.current.projectLicense;
  }

  public get autoAnalyze(): boolean {
    return this.current.autoAnalyze;
  }

  /**
   * Re-reads the configuration and notifies the listener. Called automatically
   * when VS Code reports a change that affects the `schemaAI` section.
   */
  public reload(): SchemASettings {
    this.current = SettingsManager.readSettings(this.configuration());
    this.onChange?.(this.current);
    return this.current;
  }

  /** Stops listening to configuration changes. */
  public dispose(): void {
    this.subscription.dispose();
  }
}
