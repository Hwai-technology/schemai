import * as vscode from 'vscode';

/**
 * Common disposable interface for managing extension resource lifecycle.
 */
export interface IDisposable {
    dispose(): void | Promise<void>;
}

/**
 * Standard feature registration function contract.
 * Every feature module must expose a function matching this signature.
 */
export type FeatureRegisterFn = (context: vscode.ExtensionContext) => void | Promise<void>;

/**
 * Standard feature module interface for lifecycle management.
 */
export interface IFeatureModule {
    readonly id: string;
    readonly name: string;
    register(context: vscode.ExtensionContext): void | Promise<void>;
}

/**
 * Severity level classification for detected code and license risks.
 */
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical' | 'none';

/**
 * Generic result wrapper for asynchronous operations across feature boundaries.
 */
export interface IOperationResult<T> {
    readonly success: boolean;
    readonly data?: T;
    readonly error?: Error;
}

/**
 * SPDX identifiers supported by the project license policy.
 */
export type SpdxLicenseId =
    | 'MIT'
    | 'Apache-2.0'
    | 'BSD-2-Clause'
    | 'BSD-3-Clause'
    | 'ISC'
    | 'GPL-2.0'
    | 'GPL-3.0'
    | 'AGPL-3.0'
    | 'LGPL-3.0'
    | 'MPL-2.0';

/**
 * Compatibility family of an SPDX license.
 */
export type SpdxLicenseCategory = 'permissive' | 'weak-copyleft' | 'strong-copyleft';

/**
 * Metadata for one supported SPDX license.
 */
export interface SpdxLicense {
    readonly id: SpdxLicenseId;
    readonly name: string;
    readonly category: SpdxLicenseCategory;
}

/** License id used when no license could be detected for the source. */
export const NO_LICENSE = 'NONE' as const;

/** Pasted code to analyse; maps 1:1 from DetectedPasteEvent (documentUri -> uri). */
export interface CodeFragment {
    readonly text: string;
    readonly languageId: string;
    readonly uri: vscode.Uri;
    readonly range: vscode.Range;
    readonly fingerprint?: string;
}

/** External source where the fragment was found, with a similarity from 0 to 1. */
export interface SourceMatch {
    readonly repository: string;
    readonly url: string;
    readonly path: string;
    readonly similarity: number;
}

/** License of a source: any SPDX id (not only SpdxLicenseId) or NO_LICENSE. */
export interface LicenseInfo {
    readonly spdxId: string;
    readonly name?: string;
}

/** Result of evaluating a source match against the project license policy. */
export interface RiskAssessment {
    readonly severity: RiskSeverity;
    readonly reason: string;
    readonly license: LicenseInfo;
    readonly match: SourceMatch;
}

/** Project license and the source licenses it allows or restricts. */
export interface ProjectPolicy {
    readonly projectLicense: string;
    readonly allowedLicenses: readonly string[];
    readonly restrictedLicenses: readonly string[];
}

