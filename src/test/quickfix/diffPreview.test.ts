import 'mocha';
import * as assert from 'assert';
import { DiffPreview } from '../../quickfix/diffPreview';

interface DiffPreviewHost {
  showDiff(before: string, after: string): Promise<boolean>;
  apply(after: string): Promise<void>;
}

class FakeDiffPreviewHost implements DiffPreviewHost {
  public before?: string;
  public after?: string;
  public applied?: string;
  public confirmation: Promise<boolean>;
  private resolveConfirmation!: (confirmed: boolean) => void;

  public constructor() {
    this.confirmation = new Promise<boolean>((resolve) => {
      this.resolveConfirmation = resolve;
    });
  }

  public showDiff(before: string, after: string): Promise<boolean> {
    this.before = before;
    this.after = after;
    return this.confirmation;
  }

  public async apply(after: string): Promise<void> {
    this.applied = after;
  }

  public confirm(confirmed: boolean): void {
    this.resolveConfirmation(confirmed);
  }
}

describe('DiffPreview (HU-15 T2)', () => {
  it('shows the code before and after the proposed fix', async () => {
    const host = new FakeDiffPreviewHost();
    const preview = new DiffPreview(host);
    const result = preview.show('const value = 1;', 'const value = 2;');

    await Promise.resolve();

    assert.strictEqual(host.before, 'const value = 1;');
    assert.strictEqual(host.after, 'const value = 2;');

    host.confirm(true);
    assert.strictEqual(await result, true);
  });

  it('does not apply the fix until the user confirms it', async () => {
    const host = new FakeDiffPreviewHost();
    const preview = new DiffPreview(host);
    const result = preview.show('const value = 1;', 'const value = 2;');

    await Promise.resolve();
    assert.strictEqual(host.applied, undefined);

    host.confirm(true);
    assert.strictEqual(await result, true);
    assert.strictEqual(host.applied, 'const value = 2;');
  });

  it('does not apply the fix when the user rejects the preview', async () => {
    const host = new FakeDiffPreviewHost();
    const preview = new DiffPreview(host);

    const result = preview.show('const value = 1;', 'const value = 2;');
    host.confirm(false);

    assert.strictEqual(await result, false);
    assert.strictEqual(host.applied, undefined);
  });
});
