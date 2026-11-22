import 'mocha';
import * as assert from 'assert';
import type * as vscode from 'vscode';
import type { RiskSeverity } from '../../types';
import { AlertInput, DiagnosticPort, DiagnosticsManager } from '../../alerts/diagnosticsManager';
import { HistoryManager } from '../../history/historyManager';
import { HistoryStorage, HISTORY_STORAGE_KEY } from '../../history/historyStorage';

/** Fake `context.workspaceState` (vscode.Memento). Values are stored as JSON, like VS Code does. */
class FakeMemento {
  public readonly data = new Map<string, string>();

  get<T>(key: string): T | undefined {
    const raw = this.data.get(key);
    return raw === undefined ? undefined : (JSON.parse(raw) as T);
  }

  async update(key: string, value: unknown): Promise<void> {
    this.data.set(key, JSON.stringify(value));
  }
}

/** Fake diagnostic collection behind the real DiagnosticsManager (alerts API, HU-11 T1). */
class FakeDiagnosticPort implements DiagnosticPort {
  public readonly entries = new Map<string, readonly vscode.Diagnostic[]>();
  get(uri: vscode.Uri) {
    return this.entries.get(uri.toString());
  }
  set(uri: vscode.Uri, diagnostics: readonly vscode.Diagnostic[]) {
    this.entries.set(uri.toString(), diagnostics);
  }
  delete(uri: vscode.Uri) {
    this.entries.delete(uri.toString());
  }
  clear() {
    this.entries.clear();
  }
  dispose() {
    this.entries.clear();
  }
}

const fakeUri = (path: string): vscode.Uri => ({ toString: () => path } as any);
const fakeRange = (line: number): vscode.Range =>
  ({ start: { line, character: 0 }, end: { line, character: 10 } } as any);

const alert = (severity: RiskSeverity, line: number, reason: string): AlertInput => ({
  uri: fakeUri('file:///copied.ts'),
  range: fakeRange(line),
  severity,
  license: 'GPL-3.0',
  sourceRepo: 'example/repo',
  reason
});

function setup(memento = new FakeMemento()) {
  const port = new FakeDiagnosticPort();
  const alerts = new DiagnosticsManager(port, (range, message, severity) => ({ range, message, severity } as any));
  const history = new HistoryManager(new HistoryStorage(memento), alerts);
  /** Messages of the diagnostics currently shown for the test document. */
  const shown = () => (port.entries.get('file:///copied.ts') ?? []).map((d) => d.message);
  return { memento, port, alerts, history, shown };
}

/** Records an alert the way the analysis will: report it and keep it in the history. */
async function reportAndRecord(ctx: ReturnType<typeof setup>, input: AlertInput) {
  ctx.alerts.report(input);
  return ctx.history.record(input);
}

describe('HistoryManager (HU-13 T1)', () => {
  it('records a new alert as pending in workspaceState', async () => {
    const ctx = setup();

    const record = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));

    const stored = ctx.memento.get<{ id: string; reviewStatus: string }[]>(HISTORY_STORAGE_KEY);
    assert.strictEqual(stored?.length, 1);
    assert.strictEqual(stored[0].id, record.id);
    assert.strictEqual(stored[0].reviewStatus, 'PENDING');
  });

  describe('false positive', () => {
    it('marking an alert as false positive stores it in workspaceState', async () => {
      const ctx = setup();
      const record = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));

      const ok = await ctx.history.markFalsePositive(record.id);

      assert.strictEqual(ok, true);
      const stored = ctx.memento.get<{ id: string; reviewStatus: string }[]>(HISTORY_STORAGE_KEY);
      assert.strictEqual(stored?.find((r) => r.id === record.id)?.reviewStatus, 'FALSE_POSITIVE');
    });

    it('removes its diagnostic through the alerts API', async () => {
      const ctx = setup();
      const record = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
      assert.strictEqual(ctx.shown().length, 1);

      await ctx.history.markFalsePositive(record.id);

      assert.deepStrictEqual(ctx.shown(), []);
    });

    it('keeps the other alerts of the same document visible', async () => {
      const ctx = setup();
      const falsePositive = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
      await reportAndRecord(ctx, alert('medium', 5, 'copied MPL code'));

      await ctx.history.markFalsePositive(falsePositive.id);

      assert.strictEqual(ctx.shown().length, 1);
      assert.match(ctx.shown()[0], /copied MPL code/);
    });
  });

  describe('reviewed', () => {
    it('the "reviewed" flag is persisted in workspaceState', async () => {
      const ctx = setup();
      const record = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));

      const ok = await ctx.history.markReviewed(record.id);

      assert.strictEqual(ok, true);
      const stored = ctx.memento.get<{ id: string; reviewStatus: string }[]>(HISTORY_STORAGE_KEY);
      assert.strictEqual(stored?.find((r) => r.id === record.id)?.reviewStatus, 'REVIEWED');
    });

    it('the flag survives a restart (a new HistoryManager over the same workspaceState)', async () => {
      const first = setup();
      const record = await reportAndRecord(first, alert('high', 1, 'copied GPL code'));
      await first.history.markReviewed(record.id);

      const afterRestart = setup(first.memento);

      assert.strictEqual(
        afterRestart.history.getRecords().find((r) => r.id === record.id)?.reviewStatus,
        'REVIEWED'
      );
    });

    it('a reviewed alert keeps its diagnostic (it is a real risk the user has seen)', async () => {
      const ctx = setup();
      const record = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));

      await ctx.history.markReviewed(record.id);

      assert.strictEqual(ctx.shown().length, 1);
    });
  });

  it('marking an unknown id returns false and changes nothing', async () => {
    const ctx = setup();
    await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
    const before = ctx.memento.data.get(HISTORY_STORAGE_KEY);

    assert.strictEqual(await ctx.history.markFalsePositive('unknown-id'), false);
    assert.strictEqual(await ctx.history.markReviewed('unknown-id'), false);
    assert.strictEqual(ctx.memento.data.get(HISTORY_STORAGE_KEY), before);
    assert.strictEqual(ctx.shown().length, 1);
  });
});

describe('HistoryManager ignored alerts (HU-13 T2)', () => {
  it('lists only the alerts marked as false positive', async () => {
    const ctx = setup();
    const ignored = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
    const reviewed = await reportAndRecord(ctx, alert('medium', 5, 'copied MPL code'));
    await reportAndRecord(ctx, alert('high', 9, 'copied AGPL code'));
    await ctx.history.markFalsePositive(ignored.id);
    await ctx.history.markReviewed(reviewed.id);

    const list = ctx.history.getIgnored();

    assert.deepStrictEqual(list.map((r) => r.id), [ignored.id]);
    assert.strictEqual(list[0].reason, 'copied GPL code');
  });

  it('the list of ignored alerts survives a restart', async () => {
    const first = setup();
    const ignored = await reportAndRecord(first, alert('high', 1, 'copied GPL code'));
    await first.history.markFalsePositive(ignored.id);

    const afterRestart = setup(first.memento);

    assert.deepStrictEqual(afterRestart.history.getIgnored().map((r) => r.id), [ignored.id]);
  });

  it('restoring an ignored alert makes its diagnostic appear again', async () => {
    const ctx = setup();
    const ignored = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
    await reportAndRecord(ctx, alert('medium', 5, 'copied MPL code'));
    await ctx.history.markFalsePositive(ignored.id);
    assert.strictEqual(ctx.shown().length, 1);

    const ok = await ctx.history.restore(ignored.id);

    assert.strictEqual(ok, true);
    assert.strictEqual(ctx.shown().length, 2);
    assert.ok(ctx.shown().some((m) => /copied GPL code/.test(m)));
  });

  it('a restored alert is pending again in workspaceState and leaves the ignored list', async () => {
    const ctx = setup();
    const ignored = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
    await ctx.history.markFalsePositive(ignored.id);

    await ctx.history.restore(ignored.id);

    const stored = ctx.memento.get<{ id: string; reviewStatus: string }[]>(HISTORY_STORAGE_KEY);
    assert.strictEqual(stored?.find((r) => r.id === ignored.id)?.reviewStatus, 'PENDING');
    assert.deepStrictEqual(ctx.history.getIgnored(), []);
  });

  it('a restored alert can be ignored again', async () => {
    const ctx = setup();
    const ignored = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
    await ctx.history.markFalsePositive(ignored.id);
    await ctx.history.restore(ignored.id);

    await ctx.history.markFalsePositive(ignored.id);

    assert.deepStrictEqual(ctx.shown(), []);
    assert.deepStrictEqual(ctx.history.getIgnored().map((r) => r.id), [ignored.id]);
  });

  it('restoring an alert that is not ignored, or an unknown id, returns false and changes nothing', async () => {
    const ctx = setup();
    const pending = await reportAndRecord(ctx, alert('high', 1, 'copied GPL code'));
    const before = ctx.memento.data.get(HISTORY_STORAGE_KEY);

    assert.strictEqual(await ctx.history.restore(pending.id), false);
    assert.strictEqual(await ctx.history.restore('unknown-id'), false);
    assert.strictEqual(ctx.memento.data.get(HISTORY_STORAGE_KEY), before);
    assert.strictEqual(ctx.shown().length, 1);
  });
});
