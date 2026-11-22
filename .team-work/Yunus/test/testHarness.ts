/**
 * Reference Code for Yunus (QA & CI)
 * Shared test mocks and helper utilities for Mocha test suites.
 */
export class TestHarness {
  public static createMockContext(): any {
    const subscriptions: { dispose: () => void }[] = [];
    const state = new Map<string, any>();

    return {
      subscriptions,
      workspaceState: {
        get: (key: string) => state.get(key),
        update: (key: string, value: any) => {
          state.set(key, value);
          return Promise.resolve();
        }
      },
      secrets: {
        get: () => Promise.resolve(undefined),
        store: () => Promise.resolve(),
        delete: () => Promise.resolve()
      }
    };
  }
}

