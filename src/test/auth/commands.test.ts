import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { AuthManager } from '../../auth/authManager';
import { DISCONNECT_COMMAND, LOGIN_COMMAND, registerAuthCommands } from '../../auth/commands';

interface PackageJson {
  contributes?: {
    commands?: Array<{ command: string; title: string; category?: string }>;
  };
}

const readPackageJson = (): PackageJson =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')) as PackageJson;

/** Fake values only: never real tokens in tests. */
const FAKE_TOKEN = 'fake-github-token-for-tests';

interface GetSessionCall {
  providerId: string;
  options: { createIfNone?: boolean; silent?: boolean } | undefined;
}

/**
 * Fake `vscode.authentication`: the user is already signed in to GitHub in VS Code,
 * and `getSession` records how it was called.
 */
function createFakeAuthentication() {
  const calls: GetSessionCall[] = [];
  const authentication = {
    getSession: async (
      providerId: string,
      scopes: readonly string[],
      options?: { createIfNone?: boolean; silent?: boolean }
    ) => {
      calls.push({ providerId, options });
      return {
        id: 'fake-session-id',
        accessToken: FAKE_TOKEN,
        account: { id: 'fake-account-id', label: 'fake-user' },
        scopes
      };
    }
  };
  return { authentication, calls };
}

/** Fake `vscode.commands`: keeps the registered handlers so the test can run them. */
function createFakeCommands() {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  const commands = {
    registerCommand: (id: string, handler: (...args: unknown[]) => unknown) => {
      handlers.set(id, handler);
      return { dispose: () => handlers.delete(id) };
    }
  };
  return { commands, handlers };
}

function setup() {
  const auth = createFakeAuthentication();
  const cmds = createFakeCommands();
  const manager = new AuthManager({ authentication: auth.authentication });
  const disposables = registerAuthCommands(cmds.commands, manager);
  return { auth, cmds, manager, disposables };
}

describe('Auth commands (HU-02 T2)', () => {
  it('registers the schemaAI.login and schemaAI.disconnect commands', () => {
    const { cmds, disposables } = setup();

    assert.ok(cmds.handlers.has('schemaAI.login'));
    assert.ok(cmds.handlers.has('schemaAI.disconnect'));
    assert.strictEqual(disposables.length, 2);
  });

  it('sign-in calls getSession for GitHub with createIfNone: true', async () => {
    const { auth, cmds } = setup();

    await cmds.handlers.get('schemaAI.login')!();

    assert.strictEqual(auth.calls.length, 1);
    assert.strictEqual(auth.calls[0].providerId, 'github');
    assert.strictEqual(auth.calls[0].options?.createIfNone, true);
  });

  it('after sign-in the session token is available', async () => {
    const { cmds, manager } = setup();

    await cmds.handlers.get('schemaAI.login')!();

    assert.strictEqual(await manager.getAccessToken(), FAKE_TOKEN);
  });

  it('sign-out clears the session: no token afterwards, even though VS Code still has one', async () => {
    const { cmds, manager } = setup();
    await cmds.handlers.get('schemaAI.login')!();

    await cmds.handlers.get('schemaAI.disconnect')!();

    assert.strictEqual(await manager.getAccessToken(), undefined);
  });

  it('signing in again after sign-out restores the session', async () => {
    const { cmds, manager } = setup();
    await cmds.handlers.get('schemaAI.login')!();
    await cmds.handlers.get('schemaAI.disconnect')!();

    await cmds.handlers.get('schemaAI.login')!();

    assert.strictEqual(await manager.getAccessToken(), FAKE_TOKEN);
  });

  describe('declared in package.json (review on #26)', () => {
    for (const id of [LOGIN_COMMAND, DISCONNECT_COMMAND]) {
      it(`declares ${id} in contributes.commands with a title and the SchemAI category`, () => {
        const declared = readPackageJson().contributes?.commands?.find((c) => c.command === id);

        assert.ok(declared, `${id} is not declared in package.json contributes.commands`);
        assert.ok(declared.title.trim().length > 0, `${id} has no title`);
        assert.strictEqual(declared.category, 'SchemAI');
      });
    }

    it('the titles say what they do with GitHub', () => {
      const commands = readPackageJson().contributes?.commands ?? [];
      const title = (id: string) => commands.find((c) => c.command === id)?.title ?? '';

      assert.match(title(LOGIN_COMMAND), /sign in.*github/i);
      assert.match(title(DISCONNECT_COMMAND), /sign out.*github/i);
    });
  });
});
