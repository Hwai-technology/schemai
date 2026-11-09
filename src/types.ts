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
