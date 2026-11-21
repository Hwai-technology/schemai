import type * as vscode from 'vscode';

/**
 * Value equivalent to vscode.ProgressLocation.Notification (15).
 */
export const PROGRESS_NOTIFICATION_LOCATION = 15;

export interface ProgressReport {
  message?: string;
  increment?: number;
}

export interface ProgressLike {
  report(value: ProgressReport): void;
}

export interface CancellationTokenLike {
  readonly isCancellationRequested: boolean;
  onCancellationRequested?(listener: () => unknown): { dispose(): void } | unknown;
}

export interface ProgressOptionsLike {
  location: unknown;
  title?: string;
  cancellable?: boolean;
}

export interface WindowWithProgress {
  withProgress<R>(
    options: ProgressOptionsLike,
    task: (progress: ProgressLike, token: CancellationTokenLike) => Thenable<R>
  ): Thenable<R>;
  showInformationMessage(message: string): unknown;
}

export interface ManualAnalysisResult {
  readonly completed: boolean;
  readonly cancelled: boolean;
  readonly analyzedCount: number;
  readonly totalCount: number;
  readonly summary: string;
}

export type SearchFunction = (
  fragment: string,
  token?: CancellationTokenLike
) => Promise<unknown> | unknown;

export interface ManualAnalysisRunOptions {
  title?: string;
}

/**
 * Executes manual code analysis inside a cancellable VS Code progress notification.
 */
export class ManualAnalysisRunner {
  constructor(private readonly window: WindowWithProgress) {}

  public static create(): ManualAnalysisRunner {
    // Loaded lazily because the real `vscode` module is only available inside the extension host.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vs = require('vscode') as typeof vscode;
    return new ManualAnalysisRunner(vs.window);
  }

  public async run(
    fragments: string[],
    searchFn: SearchFunction,
    options?: ManualAnalysisRunOptions
  ): Promise<ManualAnalysisResult> {
    const progressOptions: ProgressOptionsLike = {
      location: PROGRESS_NOTIFICATION_LOCATION,
      title: options?.title ?? 'SchemAI: Analyzing code...',
      cancellable: true
    };

    return await this.window.withProgress(progressOptions, async (progress, token) => {
      const total = fragments.length;
      let analyzedCount = 0;
      let wasCancelled = token.isCancellationRequested;

      if (total === 0) {
        const summary = 'SchemAI: Analysis complete. 0 fragments analyzed.';
        this.window.showInformationMessage(summary);
        return {
          completed: true,
          cancelled: false,
          analyzedCount: 0,
          totalCount: 0,
          summary
        };
      }

      for (let i = 0; i < total; i++) {
        if (token.isCancellationRequested) {
          wasCancelled = true;
          break;
        }

        const fragmentNumber = i + 1;
        progress.report({
          message: `Analyzing fragment ${fragmentNumber} of ${total}...`,
          increment: 100 / total
        });

        if (token.isCancellationRequested) {
          wasCancelled = true;
          break;
        }

        await searchFn(fragments[i], token);
        analyzedCount++;

        if (token.isCancellationRequested) {
          wasCancelled = true;
          break;
        }
      }

      if (wasCancelled) {
        const summary = `SchemAI: Analysis cancelled. ${analyzedCount} of ${total} fragments analyzed.`;
        this.window.showInformationMessage(summary);
        return {
          completed: false,
          cancelled: true,
          analyzedCount,
          totalCount: total,
          summary
        };
      }

      const summary = `SchemAI: Analysis complete. ${analyzedCount} fragment(s) analyzed.`;
      this.window.showInformationMessage(summary);
      return {
        completed: true,
        cancelled: false,
        analyzedCount,
        totalCount: total,
        summary
      };
    });
  }
}

/**
 * Convenience function to run manual analysis with progress and cancellation.
 */
export async function runManualAnalysis(
  window: WindowWithProgress,
  fragments: string[],
  searchFn: SearchFunction,
  options?: ManualAnalysisRunOptions
): Promise<ManualAnalysisResult> {
  const runner = new ManualAnalysisRunner(window);
  return await runner.run(fragments, searchFn, options);
}
