import 'mocha';
import * as assert from 'assert';
import { AuthManager } from '../../auth/authManager';

/** Fake values only: never real tokens in tests. */
const FAKE_TOKEN = 'fake-github-token-for-tests';

interface GetSessionCall {
  providerId: string;
  scopes: readonly string[];
  options: { createIfNone?: boolean; silent?: boolean } | undefined;
}

/**
 * Fake of the parts of the `vscode` API the AuthManager may touch:
 * `authentication.getSession` and `workspace.getConfiguration().update`.
 * Interactive prompts (createIfNone: true) are treated as a test failure
 * unless the fake session already exists.
 */
function createFakeVscode(existingToken: string | undefined) {
  const getSessionCalls: GetSessionCall[] = [];
  const settingsUpdates: { key: string; value: unknown }[] = [];

  const api = {
    authentication: {
      getSession: async (
        providerId: string,
        scopes: readonly string[],
        options?: { createIfNone?: boolean; silent?: boolean }
      ) => {
        getSessionCalls.push({ providerId, scopes, options });
        if (existingToken === undefined) {
          if (options?.createIfNone) {
            throw new Error('Test failure: the user was prompted to sign in.');
          }
          return undefined;
        }
        return {
          id: 'fake-session-id',
          accessToken: existingToken,
          account: { id: 'fake-account-id', label: 'fake-user' },
          scopes
        };
      }
    },
    workspace: {
      getConfiguration: (_section?: string) => ({
        get: (_key: string) => undefined,
        update: async (key: string, value: unknown) => {
          settingsUpdates.push({ key, value });
        }
      })
    }
  };

  return { api, getSessionCalls, settingsUpdates };
}

describe('AuthManager (HU-02 T1)', () => {
  it('returns the token of an existing GitHub session', async () => {
    const fake = createFakeVscode(FAKE_TOKEN);
    const manager = new AuthManager(fake.api);

    const token = await manager.getAccessToken();

    assert.strictEqual(token, FAKE_TOKEN);
    assert.strictEqual(fake.getSessionCalls.length, 1);
    assert.strictEqual(fake.getSessionCalls[0].providerId, 'github');
  });

  it('returns undefined when there is no session, without prompting the user', async () => {
    const fake = createFakeVscode(undefined);
    const manager = new AuthManager(fake.api);

    const token = await manager.getAccessToken();

    assert.strictEqual(token, undefined);
    assert.ok(fake.getSessionCalls.length > 0, 'getSession should be called');
    for (const call of fake.getSessionCalls) {
      assert.notStrictEqual(call.options?.createIfNone, true, 'must not prompt the user');
    }
  });

  it('never writes the token to settings', async () => {
    const fake = createFakeVscode(FAKE_TOKEN);
    const manager = new AuthManager(fake.api);

    await manager.getAccessToken();
    await manager.getAccessToken();

    assert.deepStrictEqual(fake.settingsUpdates, []);
  });
});

/**
 * Fake `vscode.window.showWarningMessage`: records each warning and answers with
 * the button the test chooses (`undefined` = the user closed the warning).
 */
function createFakeWindow(answer: string | undefined) {
  const warnings: { message: string; items: string[] }[] = [];
  const window = {
    showWarningMessage: async (message: string, ...items: string[]) => {
      warnings.push({ message, items });
      return answer;
    }
  };
  return { window, warnings };
}

describe('AuthManager.withSession (HU-02 T4)', () => {
  it('without a session, shows a warning with a "Sign in" button and does not search', async () => {
    const fake = createFakeVscode(undefined);
    const ui = createFakeWindow(undefined);
    const manager = new AuthManager({ ...fake.api, window: ui.window });
    let searches = 0;

    const result = await manager.withSession(async () => {
      searches++;
      return 'search results';
    });

    assert.strictEqual(result, undefined);
    assert.strictEqual(searches, 0);
    assert.strictEqual(ui.warnings.length, 1);
    assert.deepStrictEqual(ui.warnings[0].items, ['Sign in']);
  });

  it('clicking "Sign in" starts the GitHub sign-in, and a cancelled sign-in does not throw or search', async () => {
    const fake = createFakeVscode(undefined); // getSession({ createIfNone: true }) rejects, like a cancelled sign-in
    const ui = createFakeWindow('Sign in');
    const manager = new AuthManager({ ...fake.api, window: ui.window });
    let searches = 0;

    await assert.doesNotReject(() =>
      manager.withSession(async () => {
        searches++;
      })
    );

    assert.strictEqual(searches, 0);
    assert.ok(
      fake.getSessionCalls.some((call) => call.options?.createIfNone === true),
      'Sign in should call getSession with createIfNone: true'
    );
  });

  it('with a session, runs the search with the token and shows no warning', async () => {
    const fake = createFakeVscode(FAKE_TOKEN);
    const ui = createFakeWindow(undefined);
    const manager = new AuthManager({ ...fake.api, window: ui.window });
    const tokensUsed: string[] = [];

    const result = await manager.withSession(async (token) => {
      tokensUsed.push(token);
      return 'search results';
    });

    assert.strictEqual(result, 'search results');
    assert.deepStrictEqual(tokensUsed, [FAKE_TOKEN]);
    assert.strictEqual(ui.warnings.length, 0);
  });
});
