import 'mocha';
import * as assert from 'assert';
import { HistoryStorage } from '../history/historyStorage';
import { PasteAuditEntry } from '../types';

class MockMemento {
  private data = new Map<string, any>();

  get<T>(key: string, defaultValue?: T): T {
    const val = this.data.get(key);
    return val !== undefined ? val : (defaultValue as T);
  }

  update(key: string, value: any): Thenable<void> {
    this.data.set(key, value);
    return Promise.resolve();
  }

  keys(): readonly string[] {
    return Array.from(this.data.keys());
  }
}

describe('HistoryStorage & Audit Log Unit Tests', () => {
  let mockState: MockMemento;
  let storage: HistoryStorage;

  beforeEach(() => {
    mockState = new MockMemento();
    storage = new HistoryStorage(mockState as any);
  });

  it('should initialize with empty entries', () => {
    const entries = storage.getEntries();
    assert.deepStrictEqual(entries, []);
  });

  it('should store and retrieve audit entries in LIFO order', async () => {
    const entry1: PasteAuditEntry = {
      id: '1',
      timestamp: 1000,
      fileName: 'auth.ts',
      filePath: '/path/auth.ts',
      languageId: 'typescript',
      snippetPreview: 'function login() {}',
      fingerprintHash: 'hash1',
      riskLevel: 'FORBIDDEN',
      reason: 'GPL-3.0 incompatible with MIT',
      reviewStatus: 'PENDING'
    };

    const entry2: PasteAuditEntry = {
      id: '2',
      timestamp: 2000,
      fileName: 'utils.ts',
      filePath: '/path/utils.ts',
      languageId: 'typescript',
      snippetPreview: 'function helper() {}',
      fingerprintHash: 'hash2',
      riskLevel: 'SAFE',
      reason: 'MIT compatible',
      reviewStatus: 'PENDING'
    };

    await storage.addEntry(entry1);
    await storage.addEntry(entry2);

    const entries = storage.getEntries();
    assert.strictEqual(entries.length, 2);
    assert.strictEqual(entries[0].id, '2'); // newest first
    assert.strictEqual(entries[1].id, '1');
  });

  it('should update reviewStatus to FALSE_POSITIVE or REVIEWED', async () => {
    const entry: PasteAuditEntry = {
      id: 'test_entry',
      timestamp: Date.now(),
      fileName: 'test.ts',
      filePath: '/test.ts',
      languageId: 'typescript',
      snippetPreview: 'const x = 1;',
      fingerprintHash: 'hash',
      riskLevel: 'WARNING',
      reason: 'Check needed',
      reviewStatus: 'PENDING'
    };

    await storage.addEntry(entry);
    const updated = await storage.updateEntry('test_entry', {
      reviewStatus: 'FALSE_POSITIVE',
      reviewNotes: 'Verified internal code'
    });

    assert.strictEqual(updated, true);
    const entries = storage.getEntries();
    assert.strictEqual(entries[0].reviewStatus, 'FALSE_POSITIVE');
    assert.strictEqual(entries[0].reviewNotes, 'Verified internal code');
  });
});

