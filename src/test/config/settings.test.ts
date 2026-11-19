import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import type * as vscode from 'vscode';
import {
  AUTO_ANALYZE_SETTING,
  DEFAULT_AUTO_ANALYZE,
  DEFAULT_MIN_FRAGMENT_LINES,
  DEFAULT_PROJECT_LICENSE,
  DEFAULT_SIMILARITY_THRESHOLD,
  MIN_FRAGMENT_LINES_SETTING,
  PROJECT_LICENSE_SETTING,
  SETTINGS_SECTION,
  SIMILARITY_THRESHOLD_SETTING,
  SettingsManager
} from '../../config/settings';
import { PasteMonitor } from '../../analysis/pasteMonitor';

interface PackageJson {
  license?: string;
  contributes?: {
    configuration?: {
      properties?: Record<
        string,
        { type?: string; default?: unknown; minimum?: number; maximum?: number }
      >;
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

describe('SettingsManager (HU-04 T2)', () => {
  it('declares the similarity threshold in package.json bounded to 0–1', () => {
    const packageJson = readPackageJson();
    const setting = packageJson.contributes?.configuration?.properties?.[
      `${SETTINGS_SECTION}.${SIMILARITY_THRESHOLD_SETTING}`
    ];

    assert.ok(setting, 'schemaAI.similarityThreshold must be contributed in package.json');
    assert.strictEqual(setting.type, 'number');
    assert.strictEqual(setting.default, DEFAULT_SIMILARITY_THRESHOLD);
    assert.strictEqual(setting.minimum, 0);
    assert.strictEqual(setting.maximum, 1);
  });

  it('declares the minimum fragment size in package.json as an integer line count', () => {
    const packageJson = readPackageJson();
    const setting = packageJson.contributes?.configuration?.properties?.[
      `${SETTINGS_SECTION}.${MIN_FRAGMENT_LINES_SETTING}`
    ];

    assert.ok(setting, 'schemaAI.minFragmentLines must be contributed in package.json');
    assert.strictEqual(setting.type, 'integer');
    assert.strictEqual(setting.default, DEFAULT_MIN_FRAGMENT_LINES);
    assert.strictEqual(setting.minimum, 1);
  });

  it('reads the configured similarity threshold and minimum fragment size', () => {
    const configuration = fakeConfiguration({
      [SIMILARITY_THRESHOLD_SETTING]: 0.65,
      [MIN_FRAGMENT_LINES_SETTING]: 7
    });

    assert.strictEqual(SettingsManager.getSimilarityThreshold(configuration), 0.65);
    assert.strictEqual(SettingsManager.getMinFragmentLines(configuration), 7);
  });

  it('falls back to the defaults when the settings are missing', () => {
    const configuration = fakeConfiguration({});

    assert.strictEqual(
      SettingsManager.getSimilarityThreshold(configuration),
      DEFAULT_SIMILARITY_THRESHOLD
    );
    assert.strictEqual(
      SettingsManager.getMinFragmentLines(configuration),
      DEFAULT_MIN_FRAGMENT_LINES
    );
  });

  it('clamps an out-of-range similarity threshold to the 0–1 interval', () => {
    assert.strictEqual(
      SettingsManager.getSimilarityThreshold(
        fakeConfiguration({ [SIMILARITY_THRESHOLD_SETTING]: -0.4 })
      ),
      0
    );
    assert.strictEqual(
      SettingsManager.getSimilarityThreshold(
        fakeConfiguration({ [SIMILARITY_THRESHOLD_SETTING]: 1.7 })
      ),
      1
    );
  });

  it('keeps boundary similarity threshold values unchanged', () => {
    assert.strictEqual(
      SettingsManager.getSimilarityThreshold(
        fakeConfiguration({ [SIMILARITY_THRESHOLD_SETTING]: 0 })
      ),
      0
    );
    assert.strictEqual(
      SettingsManager.getSimilarityThreshold(
        fakeConfiguration({ [SIMILARITY_THRESHOLD_SETTING]: 1 })
      ),
      1
    );
  });

  it('clamps the minimum fragment size to at least one whole line', () => {
    assert.strictEqual(
      SettingsManager.getMinFragmentLines(
        fakeConfiguration({ [MIN_FRAGMENT_LINES_SETTING]: 0 })
      ),
      1
    );
    assert.strictEqual(
      SettingsManager.getMinFragmentLines(
        fakeConfiguration({ [MIN_FRAGMENT_LINES_SETTING]: -4 })
      ),
      1
    );
    assert.strictEqual(
      SettingsManager.getMinFragmentLines(
        fakeConfiguration({ [MIN_FRAGMENT_LINES_SETTING]: 4.9 })
      ),
      4
    );
  });
});
