import 'mocha';
import * as assert from 'assert';
import {
  ManualAnalysisRunner,
  runManualAnalysis,
  PROGRESS_NOTIFICATION_LOCATION,
  WindowWithProgress,
  ProgressLike,
  CancellationTokenLike,
  ProgressOptionsLike
} from '../../analysis/manualAnalysis';

class FakeWindow implements WindowWithProgress {
  public progressOptions?: ProgressOptionsLike;
  public progressReports: Array<{ message?: string; increment?: number }> = [];
  public infoMessages: string[] = [];

  constructor(private readonly tokenToProvide?: Partial<CancellationTokenLike>) {}

  public async withProgress<R>(
    options: ProgressOptionsLike,
    task: (progress: ProgressLike, token: CancellationTokenLike) => Thenable<R>
  ): Promise<R> {
    this.progressOptions = options;
    const progress: ProgressLike = {
      report: (value: { message?: string; increment?: number }) => {
        this.progressReports.push(value);
      }
    };
    const tokenToProvide = this.tokenToProvide;
    const token: CancellationTokenLike = {
      get isCancellationRequested(): boolean {
        return tokenToProvide?.isCancellationRequested ?? false;
      },
      onCancellationRequested: this.tokenToProvide?.onCancellationRequested
    };

    return await task(progress, token);
  }

  public showInformationMessage(message: string): void {
    this.infoMessages.push(message);
  }
}

describe('ManualAnalysis (HU-06 T2)', () => {
  it('runs inside a cancellable progress notification', async () => {
    const fakeWindow = new FakeWindow();
    const runner = new ManualAnalysisRunner(fakeWindow);

    await runner.run(['const x = 1;'], async () => {});

    assert.ok(fakeWindow.progressOptions, 'Expected withProgress to have been called');
    assert.strictEqual(
      fakeWindow.progressOptions?.location,
      PROGRESS_NOTIFICATION_LOCATION,
      'Progress location must be Notification'
    );
    assert.strictEqual(
      fakeWindow.progressOptions?.cancellable,
      true,
      'Progress must be cancellable'
    );
    assert.ok(
      fakeWindow.progressOptions?.title && fakeWindow.progressOptions.title.length > 0,
      'Progress should have a descriptive title'
    );
  });

  it('reports progress updates as fragments are processed', async () => {
    const fakeWindow = new FakeWindow();
    const runner = new ManualAnalysisRunner(fakeWindow);
    const fragments = ['snippet A', 'snippet B', 'snippet C'];

    await runner.run(fragments, async () => {});

    assert.ok(
      fakeWindow.progressReports.length >= fragments.length,
      'Expected at least one progress report per fragment'
    );
  });

  it('if the cancellation token is already cancelled, no search is started', async () => {
    const fakeWindow = new FakeWindow({ isCancellationRequested: true });
    const runner = new ManualAnalysisRunner(fakeWindow);
    let searchesCount = 0;

    const result = await runner.run(['const a = 1;', 'const b = 2;'], async () => {
      searchesCount++;
    });

    assert.strictEqual(searchesCount, 0, 'No search should start when cancelled');
    assert.strictEqual(result.cancelled, true, 'Result should mark operation as cancelled');
    assert.strictEqual(result.analyzedCount, 0, 'Analyzed count should be 0');
  });

  it('stops further searches immediately when cancellation token fires midway', async () => {
    let cancellationRequested = false;
    const tokenHolder: { isCancellationRequested: boolean } = {
      get isCancellationRequested() {
        return cancellationRequested;
      }
    };

    const fakeWindow = new FakeWindow(tokenHolder);
    const runner = new ManualAnalysisRunner(fakeWindow);
    let searchesCount = 0;

    const fragments = ['snippet 1', 'snippet 2', 'snippet 3'];
    const result = await runner.run(fragments, async () => {
      searchesCount++;
      // simulate user cancelling after the first search
      cancellationRequested = true;
    });

    assert.strictEqual(searchesCount, 1, 'Only one search should have been executed');
    assert.strictEqual(result.cancelled, true, 'Result should report cancelled');
    assert.strictEqual(result.analyzedCount, 1, 'Result should count 1 analyzed fragment');
  });

  it('displays a summary message with the number of fragments analysed when complete', async () => {
    const fakeWindow = new FakeWindow();
    const runner = new ManualAnalysisRunner(fakeWindow);
    const fragments = ['const x = 1;', 'const y = 2;'];

    const result = await runner.run(fragments, async () => {});

    assert.strictEqual(result.completed, true);
    assert.strictEqual(result.cancelled, false);
    assert.strictEqual(result.analyzedCount, 2);
    assert.strictEqual(result.totalCount, 2);

    assert.strictEqual(fakeWindow.infoMessages.length, 1, 'Expected one summary info message');
    assert.ok(
      fakeWindow.infoMessages[0].includes('2'),
      'Summary message should mention 2 fragments'
    );
  });

  it('displays a summary message when cancelled indicating how many were analysed', async () => {
    let cancelled = false;
    const fakeWindow = new FakeWindow({
      get isCancellationRequested() {
        return cancelled;
      }
    });

    const runner = new ManualAnalysisRunner(fakeWindow);
    await runner.run(['fragment 1', 'fragment 2', 'fragment 3'], async () => {
      cancelled = true;
    });

    assert.strictEqual(fakeWindow.infoMessages.length, 1);
    assert.ok(
      fakeWindow.infoMessages[0].toLowerCase().includes('cancel'),
      'Message should indicate cancellation'
    );
    assert.ok(
      fakeWindow.infoMessages[0].includes('1'),
      'Message should indicate that 1 fragment was analysed'
    );
  });

  it('convenience helper runManualAnalysis invokes runner and returns result', async () => {
    const fakeWindow = new FakeWindow();
    const result = await runManualAnalysis(fakeWindow, ['test fragment'], async () => {});

    assert.strictEqual(result.completed, true);
    assert.strictEqual(result.analyzedCount, 1);
  });
});
