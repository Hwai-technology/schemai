import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import type * as vscode from 'vscode';
import {
  AUTO_ANALYZE_SETTING,
  ConfigurationChangeSource,
  DEFAULT_AUTO_ANALYZE,
  DEFAULT_PROJECT_LICENSE,
  PROJECT_LICENSE_SETTING,
  SETTINGS_SECTION,
  SchemASettings,
  SettingsManager,
  SettingsWatcher
} from '../../config/settings';
import { PasteMonitor } from '../../analysis/pasteMonitor';

interface PackageJson {
  license?: string;
  contributes?: {
    configuration?: {
      properties?: Record<string, { type?: string; default?: unknown }>;
    };
  };
}

const readPackageJson = (): PackageJson =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')) as PackageJson;

const fakeConfiguration = (values: Record<string, unknown>): vscode.WorkspaceConfiguration =>
  ({
    get: <T>(key: string, defaultValue?: T): T | undefined =>
      Object.prototype.hasOwnProperty.call(values, key) ? (values[key] as T) : defaultValue
  } as unknown as vscode.WorkspaceConfiguration);

describe('SettingsManager (HU-01 T1)', () => {
  it('declares the project license in package.json with MIT as the default', () => {
    const packageJson = readPackageJson();
    const setting = packageJson.contributes?.configuration?.properties?.[
      `${SETTINGS_SECTION}.${PROJECT_LICENSE_SETTING}`
    ];

    assert.strictEqual(packageJson.license, 'MIT');
    assert.ok(setting, 'schemaAI.projectLicense must be contributed in package.json');
    assert.strictEqual(setting.default, DEFAULT_PROJECT_LICENSE);
  });

  it('reads the configured project license', () => {
    const configuration = fakeConfiguration({ [PROJECT_LICENSE_SETTING]: 'Apache-2.0' });

    assert.strictEqual(SettingsManager.getProjectLicense(configuration), 'Apache-2.0');
  });

  it('falls back to MIT when the setting is missing', () => {
    const configuration = fakeConfiguration({});

    assert.strictEqual(SettingsManager.getProjectLicense(configuration), 'MIT');
  });
});

describe('SettingsManager (HU-04 T1)', () => {
  it('declares schemaAI.autoAnalyze in package.json as a boolean enabled by default', () => {
    const packageJson = readPackageJson();
    const setting = packageJson.contributes?.configuration?.properties?.[
      `${SETTINGS_SECTION}.${AUTO_ANALYZE_SETTING}`
    ];

    assert.ok(setting, 'schemaAI.autoAnalyze must be contributed in package.json');
    assert.strictEqual(setting.type, 'boolean');
    assert.strictEqual(setting.default, DEFAULT_AUTO_ANALYZE);
    assert.strictEqual(DEFAULT_AUTO_ANALYZE, true);
  });

  it('enables automatic analysis when the setting is missing', () => {
    const configuration = fakeConfiguration({});

    assert.strictEqual(SettingsManager.isAutoAnalyzeEnabled(configuration), true);
  });

  it('honours an explicit true / false value', () => {
    assert.strictEqual(
      SettingsManager.isAutoAnalyzeEnabled(fakeConfiguration({ [AUTO_ANALYZE_SETTING]: true })),
      true
    );
    assert.strictEqual(
      SettingsManager.isAutoAnalyzeEnabled(fakeConfiguration({ [AUTO_ANALYZE_SETTING]: false })),
      false
    );
  });

  it('tells the paste monitor not to analyse when automatic analysis is disabled', async () => {
    const clipboardText = 'function add(a: number, b: number) {\n  return a + b;\n}\n';
    const detectedPastes: unknown[] = [];
    const configuration = fakeConfiguration({ [AUTO_ANALYZE_SETTING]: false });

    const monitor = new PasteMonitor(
      { readText: async () => clipboardText },
      (paste) => {
        detectedPastes.push(paste);
      },
      () => SettingsManager.isAutoAnalyzeEnabled(configuration)
    );

    await monitor.handleTextDocumentChange({
      document: {
        languageId: 'typescript',
        uri: { toString: () => 'file:///test.ts' }
      } as any,
      contentChanges: [
        {
          text: clipboardText,
          range: {} as any,
          rangeOffset: 0,
          rangeLength: 0
        }
      ],
      reason: undefined
    });

    assert.strictEqual(detectedPastes.length, 0);
  });

  it('lets the paste monitor analyse when automatic analysis is enabled', async () => {
    const clipboardText = 'function add(a: number, b: number) {\n  return a + b;\n}\n';
    const detectedPastes: unknown[] = [];
    const configuration = fakeConfiguration({ [AUTO_ANALYZE_SETTING]: true });

    const monitor = new PasteMonitor(
      { readText: async () => clipboardText },
      (paste) => {
        detectedPastes.push(paste);
      },
      () => SettingsManager.isAutoAnalyzeEnabled(configuration)
    );

    await monitor.handleTextDocumentChange({
      document: {
        languageId: 'typescript',
        uri: { toString: () => 'file:///test.ts' }
      } as any,
      contentChanges: [
        {
          text: clipboardText,
          range: {} as any,
          rangeOffset: 0,
          rangeLength: 0
        }
      ],
      reason: undefined
    });

    assert.strictEqual(detectedPastes.length, 1);
  });
});

interface FakeConfigurationChangeEvent {
  affectsConfiguration(section: string): boolean;
}

interface FakeConfigurationChangeSource {
  source: ConfigurationChangeSource;
  fire(section: string): void;
  listenerCount(): number;
}

const fakeConfigurationChangeSource = (): FakeConfigurationChangeSource => {
  const listeners = new Set<(event: FakeConfigurationChangeEvent) => unknown>();

  return {
    source: {
      onDidChangeConfiguration: (listener) => {
        listeners.add(listener);
        return { dispose: () => listeners.delete(listener) };
      }
    },
    fire: (section) => {
      for (const listener of listeners) {
        listener({ affectsConfiguration: (candidate) => candidate === section });
      }
    },
    listenerCount: () => listeners.size
  };
};

describe('SettingsWatcher (HU-04 T3)', () => {
  it('reloads the values when the schemaAI configuration changes', () => {
    const values: Record<string, unknown> = {
      [PROJECT_LICENSE_SETTING]: 'MIT',
      [AUTO_ANALYZE_SETTING]: true
    };
    const configuration = fakeConfiguration(values);
    const workspace = fakeConfigurationChangeSource();
    const reloads: SchemASettings[] = [];

    const watcher = new SettingsWatcher(
      workspace.source,
      () => configuration,
      (settings) => reloads.push(settings)
    );

    assert.deepStrictEqual(watcher.settings, {
      projectLicense: 'MIT',
      autoAnalyze: true
    });

    values[PROJECT_LICENSE_SETTING] = 'Apache-2.0';
    values[AUTO_ANALYZE_SETTING] = false;
    workspace.fire(SETTINGS_SECTION);

    assert.deepStrictEqual(watcher.settings, {
      projectLicense: 'Apache-2.0',
      autoAnalyze: false
    });
    assert.strictEqual(watcher.projectLicense, 'Apache-2.0');
    assert.strictEqual(watcher.autoAnalyze, false);
    assert.deepStrictEqual(reloads, [
      { projectLicense: 'Apache-2.0', autoAnalyze: false }
    ]);
  });

  it('falls back to the defaults when a setting is removed and the configuration changes', () => {
    const values: Record<string, unknown> = {
      [PROJECT_LICENSE_SETTING]: 'GPL-3.0',
      [AUTO_ANALYZE_SETTING]: false
    };
    const configuration = fakeConfiguration(values);
    const workspace = fakeConfigurationChangeSource();
    const watcher = new SettingsWatcher(workspace.source, () => configuration);

    delete values[PROJECT_LICENSE_SETTING];
    delete values[AUTO_ANALYZE_SETTING];
    workspace.fire(SETTINGS_SECTION);

    assert.deepStrictEqual(watcher.settings, {
      projectLicense: DEFAULT_PROJECT_LICENSE,
      autoAnalyze: DEFAULT_AUTO_ANALYZE
    });
  });

  it("ignores configuration changes that don't affect schemaAI", () => {
    const values: Record<string, unknown> = {
      [PROJECT_LICENSE_SETTING]: 'MIT',
      [AUTO_ANALYZE_SETTING]: true
    };
    let reads = 0;
    const configuration = fakeConfiguration(values);
    const workspace = fakeConfigurationChangeSource();
    const reloads: SchemASettings[] = [];

    const watcher = new SettingsWatcher(
      workspace.source,
      () => {
        reads += 1;
        return configuration;
      },
      (settings) => reloads.push(settings)
    );

    values[PROJECT_LICENSE_SETTING] = 'GPL-3.0';
    values[AUTO_ANALYZE_SETTING] = false;
    workspace.fire('someOtherExtension');

    assert.strictEqual(reads, 1, 'other extensions must not trigger a reload');
    assert.strictEqual(watcher.projectLicense, 'MIT');
    assert.strictEqual(watcher.autoAnalyze, true);
    assert.deepStrictEqual(reloads, []);
  });

  it('stops listening to configuration changes when disposed', () => {
    const values: Record<string, unknown> = {
      [PROJECT_LICENSE_SETTING]: 'MIT',
      [AUTO_ANALYZE_SETTING]: true
    };
    const configuration = fakeConfiguration(values);
    const workspace = fakeConfigurationChangeSource();
    const watcher = new SettingsWatcher(workspace.source, () => configuration);

    assert.strictEqual(workspace.listenerCount(), 1);

    watcher.dispose();
    values[PROJECT_LICENSE_SETTING] = 'Apache-2.0';
    workspace.fire(SETTINGS_SECTION);

    assert.strictEqual(workspace.listenerCount(), 0);
    assert.strictEqual(watcher.projectLicense, 'MIT');
  });
});
