import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { ConfigurationWriter } from '../../config/configManager';
import { PROJECT_LICENSE_SETTING } from '../../config/settings';
import {
  APPLY_DETECTED_LICENSE_ACTION,
  DISMISS_DETECTED_LICENSE_ACTION,
  LICENSE_FILE_CANDIDATES,
  WorkspaceLicenseDetector,
  detectLicenseFromText,
  detectWorkspaceLicense,
  proposeLicense,
  proposeWorkspaceLicense
} from '../../config/workspaceLicense';
import type {
  LicenseProposalDependencies,
  LicenseWorkspace
} from '../../config/workspaceLicense';

// vscode.ConfigurationTarget.Workspace; the real enum cannot be loaded by plain Mocha.
const WORKSPACE_TARGET = 2 as vscode.ConfigurationTarget;

const MIT_TEXT = `MIT License

Copyright (c) 2026 SchemAI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.`;

interface FakeWorkspace extends LicenseWorkspace {
  readonly reads: string[];
}

const fakeWorkspace = (files: Record<string, string>): FakeWorkspace => {
  const reads: string[] = [];
  return {
    workspaceFolders: [{ uri: '/workspace' }],
    joinPath: (root, name) => `${String(root)}/${name}`,
    fs: {
      readFile: async (uri) => {
        const path = String(uri);
        reads.push(path);
        const relative = path.replace(/^\/workspace\//, '');
        if (!Object.prototype.hasOwnProperty.call(files, relative)) {
          throw new Error(`ENOENT: ${path}`);
        }
        return Buffer.from(files[relative], 'utf8');
      }
    },
    reads
  };
};

interface UpdateCall {
  key: string;
  value: unknown;
  target: vscode.ConfigurationTarget | undefined;
}

interface FakeDependencies {
  dependencies: LicenseProposalDependencies;
  updates: UpdateCall[];
  messages: string[];
}

const fakeDependencies = (answer: string | undefined): FakeDependencies => {
  const updates: UpdateCall[] = [];
  const messages: string[] = [];
  const configuration = {
    get: <T>(_key: string, defaultValue?: T): T | undefined => defaultValue,
    update: async (
      key: string,
      value: unknown,
      target?: vscode.ConfigurationTarget
    ): Promise<void> => {
      updates.push({ key, value, target });
    }
  } as unknown as ConfigurationWriter;

  return {
    dependencies: {
      window: {
        showInformationMessage: async (message: string) => {
          messages.push(message);
          return answer;
        }
      },
      configuration,
      target: WORKSPACE_TARGET
    },
    updates,
    messages
  };
};

describe('workspace license detection (HU-01 T4)', () => {
  it('detects MIT from a LICENSE file with the MIT text', async () => {
    const license = await detectWorkspaceLicense(fakeWorkspace({ LICENSE: MIT_TEXT }));

    assert.strictEqual(license, 'MIT');
  });

  it('returns undefined when the workspace has no LICENSE file', async () => {
    const workspace = fakeWorkspace({ 'package.json': '{}' });

    assert.strictEqual(await detectWorkspaceLicense(workspace), undefined);
  });

  it('checks the documented candidate names in order', async () => {
    const workspace = fakeWorkspace({ 'LICENSE.md': MIT_TEXT });

    assert.strictEqual(await detectWorkspaceLicense(workspace), 'MIT');
    assert.deepStrictEqual(workspace.reads, ['/workspace/LICENSE', '/workspace/LICENSE.md']);
    assert.ok(LICENSE_FILE_CANDIDATES.indexOf('LICENSE') < LICENSE_FILE_CANDIDATES.indexOf('LICENSE.md'));
  });

  it('returns undefined when there is no open workspace folder', async () => {
    const workspace: LicenseWorkspace = {
      workspaceFolders: [],
      fs: { readFile: async () => Buffer.from(MIT_TEXT) }
    };

    assert.strictEqual(await detectWorkspaceLicense(workspace), undefined);
  });

  it('ignores an unrecognised license text instead of guessing', async () => {
    const workspace = fakeWorkspace({ LICENSE: 'All rights reserved. Proprietary software.' });

    assert.strictEqual(await detectWorkspaceLicense(workspace), undefined);
  });

  it('recognises other common licenses', () => {
    assert.strictEqual(
      detectLicenseFromText('Apache License\nVersion 2.0, January 2004'),
      'Apache-2.0'
    );
    assert.strictEqual(
      detectLicenseFromText('GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007'),
      'GPL-3.0'
    );
    assert.strictEqual(
      detectLicenseFromText('GNU AFFERO GENERAL PUBLIC LICENSE\nVersion 3'),
      'AGPL-3.0'
    );
    assert.strictEqual(detectLicenseFromText('SPDX-License-Identifier: BSD-3-Clause'), 'BSD-3-Clause');
    assert.strictEqual(detectLicenseFromText(''), undefined);
  });

  it('exposes the detector through the prototype-compatible class', async () => {
    const license = await WorkspaceLicenseDetector.detectWorkspaceLicense(
      fakeWorkspace({ LICENSE: MIT_TEXT })
    );

    assert.strictEqual(license, 'MIT');
  });
});

describe('workspace license proposal (HU-01 T4)', () => {
  it('does not save the license when the user dismisses the proposal', async () => {
    const workspace = fakeWorkspace({ LICENSE: MIT_TEXT });
    const { dependencies, updates, messages } = fakeDependencies(
      DISMISS_DETECTED_LICENSE_ACTION
    );

    const result = await proposeWorkspaceLicense(workspace, dependencies);

    assert.deepStrictEqual(result, { license: 'MIT', applied: false });
    assert.deepStrictEqual(updates, []);
    assert.strictEqual(messages.length, 1);
    assert.ok(messages[0].includes('MIT'));
  });

  it('does not save the license when the notification is closed', async () => {
    const { dependencies, updates } = fakeDependencies(undefined);

    const applied = await proposeLicense('MIT', dependencies);

    assert.strictEqual(applied, false);
    assert.deepStrictEqual(updates, []);
  });

  it('saves the accepted license to the workspace settings', async () => {
    const workspace = fakeWorkspace({ LICENSE: MIT_TEXT });
    const { dependencies, updates } = fakeDependencies(APPLY_DETECTED_LICENSE_ACTION);

    const result = await proposeWorkspaceLicense(workspace, dependencies);

    assert.deepStrictEqual(result, { license: 'MIT', applied: true });
    assert.deepStrictEqual(updates, [
      { key: PROJECT_LICENSE_SETTING, value: 'MIT', target: WORKSPACE_TARGET }
    ]);
  });

  it('does not propose anything when no license was detected', async () => {
    const workspace = fakeWorkspace({});
    const { dependencies, updates, messages } = fakeDependencies(
      APPLY_DETECTED_LICENSE_ACTION
    );

    const result = await proposeWorkspaceLicense(workspace, dependencies);

    assert.strictEqual(result, undefined);
    assert.deepStrictEqual(updates, []);
    assert.deepStrictEqual(messages, []);
  });

  it('detection alone never writes the configuration', async () => {
    const workspace = fakeWorkspace({ LICENSE: MIT_TEXT });
    const { dependencies, updates } = fakeDependencies(
      APPLY_DETECTED_LICENSE_ACTION
    );

    await detectWorkspaceLicense(workspace);

    assert.deepStrictEqual(updates, []);
    assert.ok(dependencies);
  });
});
