import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import type * as vscode from 'vscode';
import {
  DEFAULT_PROJECT_LICENSE,
  PROJECT_LICENSE_SETTING,
  SETTINGS_SECTION,
  SettingsManager
} from '../../config/settings';

interface PackageJson {
  license?: string;
  contributes?: {
    configuration?: {
      properties?: Record<string, { default?: unknown }>;
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
