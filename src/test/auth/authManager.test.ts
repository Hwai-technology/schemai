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
