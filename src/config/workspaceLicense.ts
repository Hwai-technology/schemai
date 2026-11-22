import type * as vscode from 'vscode';
import type { SpdxLicenseId } from '../types';
import { ConfigManager } from './configManager';
import type { ConfigurationWriter } from './configManager';
import { SETTINGS_SECTION } from './settings';

/**
 * File names checked, in order, when looking for the workspace license.
 * The list includes the mixed-case names used by most projects and the
 * lowercase variants allowed by case-sensitive file systems.
 */
export const LICENSE_FILE_CANDIDATES: readonly string[] = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.txt',
  'license',
  'license.md',
  'license.txt',
  'LICENCE',
  'LICENCE.md',
  'LICENCE.txt',
  'COPYING',
  'COPYING.md',
  'COPYING.txt'
];

/**
 * Minimal file system surface required to read the license file.
 */
export interface LicenseFileSystem {
  readFile(uri: unknown): PromiseLike<Uint8Array> | Uint8Array;
}

/**
 * Minimal workspace surface used by the detector.
 *
 * Only the first workspace folder is inspected, which mirrors the prototype:
 * a multi-root workspace has no single "project license" by default.
 */
export interface LicenseWorkspace {
  readonly workspaceFolders?: readonly { readonly uri: unknown }[] | undefined;
  readonly fs: LicenseFileSystem;
  /**
   * Joins a file name to a folder URI. The real extension uses
   * `vscode.Uri.joinPath`; tests can supply a simpler implementation.
   */
  readonly joinPath?: (root: unknown, name: string) => unknown;
}

/**
 * Prompt surface required to propose the detected license to the user.
 */
export interface LicenseProposalWindow {
  showInformationMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined> | string | undefined;
}

/**
 * Collaborators needed to propose, and optionally save, a license.
 */
export interface LicenseProposalDependencies {
  readonly window: LicenseProposalWindow;
  readonly configuration: ConfigurationWriter;
  readonly target: vscode.ConfigurationTarget;
}

/**
 * Result of inspecting the workspace and asking the user about the license.
 */
export interface WorkspaceLicenseProposal {
  readonly license: SpdxLicenseId;
  /** `true` only when the user accepted the proposal and the value was saved. */
  readonly applied: boolean;
}

/**
 * Button the user presses to accept the detected license.
 */
export const APPLY_DETECTED_LICENSE_ACTION = 'Use this license';

/**
 * Button the user presses to keep the current setting.
 */
export const DISMISS_DETECTED_LICENSE_ACTION = 'Not now';

const SPDX_ALIASES: Readonly<Record<string, SpdxLicenseId>> = {
  mit: 'MIT',
  'apache-2.0': 'Apache-2.0',
  'bsd-2-clause': 'BSD-2-Clause',
  'bsd-3-clause': 'BSD-3-Clause',
  isc: 'ISC',
  'mpl-2.0': 'MPL-2.0',
  'lgpl-3.0': 'LGPL-3.0',
  'lgpl-3.0-only': 'LGPL-3.0',
  'gpl-2.0': 'GPL-2.0',
  'gpl-2.0-only': 'GPL-2.0',
  'gpl-3.0': 'GPL-3.0',
  'gpl-3.0-only': 'GPL-3.0',
  'agpl-3.0': 'AGPL-3.0',
  'agpl-3.0-only': 'AGPL-3.0'
};

/**
 * Identifies the SPDX license described by a LICENSE file.
 *
 * The matcher intentionally looks for a few distinctive sentences instead of
 * trying to be a full license parser. It returns `undefined` when the text is
 * unknown, so an unrecognised license is never guessed.
 */
export function detectLicenseFromText(text: string): SpdxLicenseId | undefined {
  if (!text || text.trim().length === 0) {
    return undefined;
  }

  const normalized = text.toLowerCase().replace(/\s+/g, ' ');

  // Some repositories only keep an SPDX header in the file.
  const spdxHeader = normalized.match(/spdx-license-identifier:\s*([a-z0-9.+-]+)/);
  if (spdxHeader) {
    const identified = SPDX_ALIASES[spdxHeader[1]];
    if (identified) {
      return identified;
    }
  }

  if (normalized.includes('gnu affero general public license')) {
    return 'AGPL-3.0';
  }

  if (normalized.includes('gnu lesser general public license')) {
    return 'LGPL-3.0';
  }

  if (normalized.includes('gnu general public license')) {
    return normalized.includes('version 2') ? 'GPL-2.0' : 'GPL-3.0';
  }

  if (normalized.includes('mozilla public license') && normalized.includes('2.0')) {
    return 'MPL-2.0';
  }

  if (normalized.includes('apache license') && normalized.includes('version 2.0')) {
    return 'Apache-2.0';
  }

  if (
    normalized.includes('mit license') ||
    normalized.includes('permission is hereby granted, free of charge')
  ) {
    return 'MIT';
  }

  if (normalized.includes('redistribution and use in source and binary forms')) {
    const isThreeClause =
      normalized.includes('neither the name') || normalized.includes('endorse or promote');
    return isThreeClause ? 'BSD-3-Clause' : 'BSD-2-Clause';
  }

  if (
    normalized.includes('isc license') ||
    normalized.includes('permission to use, copy, modify, and/or distribute this software')
  ) {
    return 'ISC';
  }

  return undefined;
}

function joinFileUri(workspace: LicenseWorkspace, root: unknown, name: string): unknown {
  if (workspace.joinPath) {
    return workspace.joinPath(root, name);
  }

  // Loaded lazily because the real `vscode` module is only available inside the extension host.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vs = require('vscode') as typeof vscode;
  return vs.Uri.joinPath(root as vscode.Uri, name);
}

function readUtf8(data: Uint8Array): string {
  return Buffer.from(data).toString('utf8');
}

/**
 * Inspects the workspace root and returns the license found in its LICENSE
 * file, or `undefined` when the file is missing or not recognised.
 *
 * This function only reads: it never writes the setting. Use
 * {@link proposeWorkspaceLicense} to ask the user before applying a value.
 */
export async function detectWorkspaceLicense(
  workspace: LicenseWorkspace = getVsCodeWorkspace()
): Promise<SpdxLicenseId | undefined> {
  const folders = workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return undefined;
  }

  const rootUri = folders[0].uri;

  for (const fileName of LICENSE_FILE_CANDIDATES) {
    try {
      const fileUri = joinFileUri(workspace, rootUri, fileName);
      const data = await workspace.fs.readFile(fileUri);
      const license = detectLicenseFromText(readUtf8(data));
      if (license) {
        return license;
      }
    } catch {
      // The file does not exist (or cannot be read): try the next candidate.
    }
  }

  return undefined;
}

/**
 * Asks the user whether the detected license should become the project
 * license. The setting is written only after the user accepts.
 */
export async function proposeLicense(
  license: SpdxLicenseId,
  dependencies: LicenseProposalDependencies
): Promise<boolean> {
  const answer = await dependencies.window.showInformationMessage(
    `SchemAI detected "${license}" in the workspace LICENSE file. Use it as the project license?`,
    APPLY_DETECTED_LICENSE_ACTION,
    DISMISS_DETECTED_LICENSE_ACTION
  );

  if (answer !== APPLY_DETECTED_LICENSE_ACTION) {
    return false;
  }

  await ConfigManager.saveProjectLicense(
    dependencies.configuration,
    license,
    dependencies.target
  );
  return true;
}

/**
 * Detects the workspace license and proposes it to the user.
 * Returns `undefined` when no license could be detected.
 */
export async function proposeWorkspaceLicense(
  workspace: LicenseWorkspace,
  dependencies: LicenseProposalDependencies
): Promise<WorkspaceLicenseProposal | undefined> {
  const license = await detectWorkspaceLicense(workspace);
  if (!license) {
    return undefined;
  }

  const applied = await proposeLicense(license, dependencies);
  return { license, applied };
}

/**
 * Loads the real VS Code workspace. Kept lazy so unit tests can run without
 * the extension host.
 */
export function getVsCodeWorkspace(): LicenseWorkspace {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vs = require('vscode') as typeof vscode;
  return vs.workspace as unknown as LicenseWorkspace;
}

/**
 * Builds the real VS Code collaborators used to propose a license.
 */
export function createVsCodeProposalDependencies(): LicenseProposalDependencies {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vs = require('vscode') as typeof vscode;
  return {
    window: vs.window,
    configuration: vs.workspace.getConfiguration(SETTINGS_SECTION),
    target: vs.ConfigurationTarget.Workspace
  };
}

/**
 * Object-oriented entry point kept for compatibility with the prototype.
 */
export class WorkspaceLicenseDetector {
  public static detectLicense(text: string): SpdxLicenseId | undefined {
    return detectLicenseFromText(text);
  }

  public static async detectWorkspaceLicense(
    workspace: LicenseWorkspace = getVsCodeWorkspace()
  ): Promise<SpdxLicenseId | undefined> {
    return detectWorkspaceLicense(workspace);
  }

  public static async proposeLicense(
    license: SpdxLicenseId,
    dependencies: LicenseProposalDependencies
  ): Promise<boolean> {
    return proposeLicense(license, dependencies);
  }

  public static async proposeWorkspaceLicense(
    workspace: LicenseWorkspace,
    dependencies: LicenseProposalDependencies
  ): Promise<WorkspaceLicenseProposal | undefined> {
    return proposeWorkspaceLicense(workspace, dependencies);
  }
}
