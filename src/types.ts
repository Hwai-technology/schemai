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

