import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import {
  CodeFragment,
  LicenseInfo,
  NO_LICENSE,
  ProjectPolicy,
  RiskAssessment,
  SourceMatch
} from '../../types';

const fakeUri = { toString: () => 'file:///copied.ts' } as unknown as vscode.Uri;
const fakeRange = {} as vscode.Range;

const match: SourceMatch = {
  repository: 'torvalds/linux',
  url: 'https://github.com/torvalds/linux/blob/master/kernel/fork.c',
  path: 'kernel/fork.c',
  similarity: 0.87
};

describe('Shared domain contracts (COORD)', () => {
  it('CodeFragment keeps text, languageId, uri and range, with an optional fingerprint', () => {
    const fragment: CodeFragment = {
      text: 'const x = 1;\nconst y = 2;\n',
      languageId: 'typescript',
      uri: fakeUri,
      range: fakeRange
    };
    const fingerprinted: CodeFragment = { ...fragment, fingerprint: 'a1b2c3' };

    assert.strictEqual(fragment.text, 'const x = 1;\nconst y = 2;\n');
    assert.strictEqual(fragment.languageId, 'typescript');
    assert.strictEqual(fragment.uri, fakeUri);
    assert.strictEqual(fragment.range, fakeRange);
    assert.strictEqual(fragment.fingerprint, undefined);
    assert.strictEqual(fingerprinted.fingerprint, 'a1b2c3');
  });

  it('SourceMatch holds the repository, url, path and a similarity between 0 and 1', () => {
    assert.strictEqual(match.repository, 'torvalds/linux');
    assert.strictEqual(match.url, 'https://github.com/torvalds/linux/blob/master/kernel/fork.c');
    assert.strictEqual(match.path, 'kernel/fork.c');
    assert.ok(match.similarity >= 0 && match.similarity <= 1);
  });

  it('LicenseInfo accepts an SPDX id and NO_LICENSE', () => {
    const gpl: LicenseInfo = { spdxId: 'GPL-3.0', name: 'GNU General Public License v3.0' };
    const none: LicenseInfo = { spdxId: NO_LICENSE };

    assert.strictEqual(gpl.spdxId, 'GPL-3.0');
    assert.strictEqual(gpl.name, 'GNU General Public License v3.0');
    assert.strictEqual(NO_LICENSE, 'NONE');
    assert.strictEqual(none.spdxId, 'NONE');
    assert.strictEqual(none.name, undefined);
  });

  it('RiskAssessment combines severity, reason, license and match', () => {
    const license: LicenseInfo = { spdxId: 'GPL-3.0' };
    const assessment: RiskAssessment = {
      severity: 'high',
      reason: 'Copyleft license is not compatible with the project license',
      license,
      match
    };

    assert.strictEqual(assessment.severity, 'high');
    assert.strictEqual(assessment.reason, 'Copyleft license is not compatible with the project license');
    assert.strictEqual(assessment.license, license);
    assert.strictEqual(assessment.match, match);
  });

  it('ProjectPolicy holds the project license and the allowed and restricted lists', () => {
    const policy: ProjectPolicy = {
      projectLicense: 'MIT',
      allowedLicenses: ['MIT', 'Apache-2.0'],
      restrictedLicenses: ['GPL-3.0', 'AGPL-3.0']
    };

    assert.strictEqual(policy.projectLicense, 'MIT');
    assert.deepStrictEqual(policy.allowedLicenses, ['MIT', 'Apache-2.0']);
    assert.deepStrictEqual(policy.restrictedLicenses, ['GPL-3.0', 'AGPL-3.0']);
  });
});
