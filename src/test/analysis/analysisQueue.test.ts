import 'mocha';
import * as assert from 'assert';
import {
  AnalysisQueue,
  QueuedAnalysisItem,
  createPasteAnalysisHandler
} from '../../analysis/analysisQueue';

const createItem = (id: string, fingerprint: string, text = 'const x = 1;'): QueuedAnalysisItem => ({
  id,
  text,
  fingerprint,
  fingerprintHash: fingerprint
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('AnalysisQueue (HU-05 T2)', () => {
  it('enqueue() returns immediately and does not wait for analysis', () => {
    let workerFinished = false;
    const queue = new AnalysisQueue({
      debounceMs: 20,
      worker: async () => {
        await sleep(50);
        workerFinished = true;
      }
    });

    const start = Date.now();
    queue.enqueue(createItem('item-1', 'fp-1'));
    const elapsed = Date.now() - start;

    assert.ok(elapsed < 20, `enqueue took ${elapsed}ms, should return immediately`);
    assert.strictEqual(workerFinished, false, 'worker must not complete before enqueue returns');

    queue.dispose();
  });

  it('merges pastes arriving within debounce window (debounce 500ms default)', async () => {
    const processedIds: string[] = [];
    // Using 60ms debounce for the test to keep test suite fast
    const queue = new AnalysisQueue({
      debounceMs: 60,
      worker: async (item: QueuedAnalysisItem) => {
        processedIds.push(item.id);
      }
    });

    queue.enqueue(createItem('item-1', 'fp-1'));
    await sleep(20);
    queue.enqueue(createItem('item-2', 'fp-2'));
    await sleep(20);
    queue.enqueue(createItem('item-3', 'fp-3'));

    // At t=40ms, debounce should not have fired yet
    assert.strictEqual(processedIds.length, 0, 'worker should not be called before debounce expires');

    // Wait for debounce window (60ms after last item, so around 80ms more)
    await sleep(90);

    assert.strictEqual(processedIds.length, 3, 'all items queued within debounce should be processed');
    assert.deepStrictEqual(processedIds, ['item-1', 'item-2', 'item-3']);

    queue.dispose();
  });

  it('default debounce configuration is 500 ms', () => {
    const queue = new AnalysisQueue();
    assert.strictEqual(queue.getDebounceMs(), 500, 'default debounce should be 500ms');
    queue.dispose();
  });

  it('does not analyse the same fingerprint twice (caching / deduplication)', async () => {
    let analyzeCalls = 0;
    const processedFingerprints: string[] = [];

    const queue = new AnalysisQueue({
      debounceMs: 20,
      worker: async (item: QueuedAnalysisItem) => {
        analyzeCalls++;
        processedFingerprints.push(item.fingerprint);
        return { analyzed: true };
      }
    });

    queue.enqueue(createItem('first', 'duplicate-fingerprint'));
    await sleep(50);

    assert.strictEqual(analyzeCalls, 1, 'first item should be analyzed');

    // Second paste with same fingerprint
    queue.enqueue(createItem('second', 'duplicate-fingerprint'));
    await sleep(50);

    assert.strictEqual(analyzeCalls, 1, 'second item with same fingerprint must not be analyzed again');

    queue.dispose();
  });

  it('deduplicates identical fingerprints pending in the queue during debounce', async () => {
    let analyzeCalls = 0;
    const queue = new AnalysisQueue({
      debounceMs: 40,
      worker: async () => {
        analyzeCalls++;
      }
    });

    queue.enqueue(createItem('p1', 'same-fp'));
    queue.enqueue(createItem('p2', 'same-fp'));
    queue.enqueue(createItem('p3', 'same-fp'));

    await sleep(80);

    assert.strictEqual(analyzeCalls, 1, 'identical fingerprints pending in queue should be analyzed only once');

    queue.dispose();
  });

  it('supports immediate processing when requested', async () => {
    let processed = false;
    const queue = new AnalysisQueue({
      debounceMs: 500,
      worker: async () => {
        processed = true;
      }
    });

    queue.enqueue(createItem('fast', 'fp-fast'), true);
    await sleep(20);

    assert.strictEqual(processed, true, 'immediate enqueue should not wait for debounce');
    queue.dispose();
  });

  it('dispose cancels pending debounce and clears queue', async () => {
    let called = false;
    const queue = new AnalysisQueue({
      debounceMs: 40,
      worker: async () => {
        called = true;
      }
    });

    queue.enqueue(createItem('canceled', 'fp-cancel'));
    queue.dispose();

    await sleep(70);
    assert.strictEqual(called, false, 'worker must not be called after dispose');
  });

  it('notifies onAnalysisComplete listeners when an item is processed', async () => {
    let eventReceived = false;
    let receivedItem: QueuedAnalysisItem | undefined;
    let receivedResult: unknown;

    const queue = new AnalysisQueue({
      debounceMs: 20,
      worker: async () => ({ score: 0.95 })
    });

    const subscription = queue.onAnalysisComplete(({ item, result }) => {
      eventReceived = true;
      receivedItem = item;
      receivedResult = result;
    });

    queue.enqueue(createItem('notify-1', 'fp-notify'));
    await sleep(50);

    assert.strictEqual(eventReceived, true);
    assert.strictEqual(receivedItem?.id, 'notify-1');
    assert.deepStrictEqual(receivedResult, { score: 0.95 });

    subscription.dispose();
    queue.dispose();
  });

  it('createPasteAnalysisHandler maps paste events and enqueues them', async () => {
    let processedText = '';
    const queue = new AnalysisQueue({
      debounceMs: 20,
      worker: async (item) => {
        processedText = item.text;
      }
    });

    const handler = createPasteAnalysisHandler(queue, (t) => `custom-fp:${t.length}`);
    handler({
      text: 'function add(a, b) { return a + b; }',
      languageId: 'typescript',
      documentUri: 'file:///test.ts',
      range: {}
    });

    await sleep(50);
    assert.strictEqual(processedText, 'function add(a, b) { return a + b; }');

    queue.dispose();
  });
});
