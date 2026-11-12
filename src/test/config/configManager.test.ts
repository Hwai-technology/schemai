import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import {
  ALLOWED_LICENSES_SETTING,
  ConfigManager,
  DEFAULT_ALLOWED_LICENSES,
  DEFAULT_RESTRICTED_LICENSES,
  RESTRICTED_LICENSES_SETTING
} from '../../config/configManager';
import { DEFAULT_PROJECT_LICENSE, PROJECT_LICENSE_SETTING } from '../../config/settings';

interface UpdateCall {
  key: string;
  value: unknown;
  target: vscode.ConfigurationTarget | undefined;
}

interface FakeConfiguration {
  configuration: vscode.WorkspaceConfiguration;
  updates: UpdateCall[];
}

const fakeConfiguration = (values: Record<string, unknown> = {}): FakeConfiguration => {
  const updates: UpdateCall[] = [];
  const configuration = {
    get: <T>(key: string, defaultValue?: T): T | undefined =>
      Object.prototype.hasOwnProperty.call(values, key) ? (values[key] as T) : defaultValue,
    update: async (
      key: string,
      value: unknown,
      target?: vscode.ConfigurationTarget
    ): Promise<void> => {
      updates.push({ key, value, target });
      values[key] = value;
    }
  } as unknown as vscode.WorkspaceConfiguration;

  return { configuration, updates };
};

// vscode.ConfigurationTarget.Workspace; the real enum cannot be loaded by plain Mocha.
const WORKSPACE_TARGET = 2 as vscode.ConfigurationTarget;

describe('ConfigManager (HU-01 T3)', () => {
  it('reads the project license and the allowed / restricted lists from settings', () => {
    const { configuration } = fakeConfiguration({
      [PROJECT_LICENSE_SETTING]: 'Apache-2.0',
      [ALLOWED_LICENSES_SETTING]: ['MIT', 'Apache-2.0'],
      [RESTRICTED_LICENSES_SETTING]: ['GPL-3.0']
    });

    assert.deepStrictEqual(ConfigManager.getPolicy(configuration), {
      projectLicense: 'Apache-2.0',
      allowedLicenses: ['MIT', 'Apache-2.0'],
      restrictedLicenses: ['GPL-3.0']
    });
  });

  it('uses the prototype defaults when no value is configured', () => {
    const { configuration } = fakeConfiguration();

    assert.deepStrictEqual(ConfigManager.getPolicy(configuration), {
      projectLicense: DEFAULT_PROJECT_LICENSE,
      allowedLicenses: [...DEFAULT_ALLOWED_LICENSES],
      restrictedLicenses: [...DEFAULT_RESTRICTED_LICENSES]
    });
  });

  it('uses the default of each missing value independently', () => {
    const { configuration } = fakeConfiguration({
      [PROJECT_LICENSE_SETTING]: 'GPL-3.0',
      [ALLOWED_LICENSES_SETTING]: ['GPL-3.0']
    });

    assert.deepStrictEqual(ConfigManager.getPolicy(configuration), {
      projectLicense: 'GPL-3.0',
      allowedLicenses: ['GPL-3.0'],
      restrictedLicenses: [...DEFAULT_RESTRICTED_LICENSES]
    });
  });

  it('returns copies so callers cannot mutate the defaults', () => {
    const { configuration } = fakeConfiguration();
    const policy = ConfigManager.getPolicy(configuration);

    policy.allowedLicenses.push('GPL-3.0');
    policy.restrictedLicenses.length = 0;

    assert.deepStrictEqual(
      ConfigManager.getPolicy(configuration).allowedLicenses,
      [...DEFAULT_ALLOWED_LICENSES]
    );
    assert.deepStrictEqual(
      ConfigManager.getPolicy(configuration).restrictedLicenses,
      [...DEFAULT_RESTRICTED_LICENSES]
    );
  });

  it('saves the project license to workspace settings and reads it back', async () => {
    const { configuration, updates } = fakeConfiguration();

    await ConfigManager.saveProjectLicense(configuration, 'Apache-2.0', WORKSPACE_TARGET);

    assert.deepStrictEqual(updates, [
      { key: PROJECT_LICENSE_SETTING, value: 'Apache-2.0', target: WORKSPACE_TARGET }
    ]);
    assert.strictEqual(ConfigManager.getPolicy(configuration).projectLicense, 'Apache-2.0');
  });
});
