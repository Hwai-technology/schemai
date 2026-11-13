import 'mocha';
import * as assert from 'assert';
import { AuthManager } from '../../auth/authManager';
import { AuthStatusBar } from '../../auth/authStatusBar';

/** Fake values only: never real tokens in tests. */
const FAKE_TOKEN = 'fake-github-token-for-tests';

type SessionsListener = (e: { provider: { id: string } }) => unknown;

/**
 * Fake `vscode.authentication`: the test decides whether VS Code has a GitHub
 * session and can fire `onDidChangeSessions` like VS Code does.
 */
function createFakeAuthentication(initialToken: string | undefined) {
  let token = initialToken;
  const listeners = new Set<SessionsListener>();
  const authentication = {
    getSession: async (
      _providerId: string,
      scopes: readonly string[],
      _options?: { createIfNone?: boolean; silent?: boolean }
    ) =>
      token === undefined
        ? undefined
        : { id: 'fake-session-id', accessToken: token, account: { id: 'fake', label: 'fake-user' }, scopes },
    onDidChangeSessions: (listener: SessionsListener) => {
      listeners.add(listener);
      return { dispose: () => listeners.delete(listener) };
    }
  };
  return {
    authentication,
    listeners,
    /** Simulates the user signing in or out of GitHub in VS Code's Accounts menu. */
    changeSession(newToken: string | undefined, providerId = 'github') {
      token = newToken;
      listeners.forEach((listener) => listener({ provider: { id: providerId } }));
    }
  };
}

/** Fake `vscode.StatusBarItem`. */
function createFakeItem() {
  return {
    text: '',
    tooltip: undefined as string | undefined,
    command: undefined as string | undefined,
    shown: false,
    disposed: false,
    show() {
      this.shown = true;
    },
    dispose() {
      this.disposed = true;
    }
  };
}

/** Lets pending async refreshes (fake getSession) finish. */
const settle = () => new Promise((resolve) => setImmediate(resolve));

async function setup(initialToken: string | undefined) {
  const auth = createFakeAuthentication(initialToken);
  const item = createFakeItem();
  const manager = new AuthManager({ authentication: auth.authentication });
  const statusBar = new AuthStatusBar(item, manager, auth.authentication);
  await statusBar.refresh();
  return { auth, item, manager, statusBar };
}

describe('AuthStatusBar (HU-02 T3)', () => {
  it('shows the GitHub account name when there is a session, and is visible', async () => {
    const { item } = await setup(FAKE_TOKEN);

    assert.strictEqual(item.text, 'GitHub: fake-user');
    assert.strictEqual(item.shown, true);
  });

  it('shows "GitHub: not connected" when there is no session', async () => {
    const { item } = await setup(undefined);

    assert.strictEqual(item.text, 'GitHub: not connected');
  });

  it('updates when the user signs in to GitHub in VS Code', async () => {
    const { auth, item } = await setup(undefined);

    auth.changeSession(FAKE_TOKEN);
    await settle();

    assert.strictEqual(item.text, 'GitHub: fake-user');
  });

  it('updates when the GitHub session is removed in VS Code', async () => {
    const { auth, item } = await setup(FAKE_TOKEN);

    auth.changeSession(undefined);
    await settle();

    assert.strictEqual(item.text, 'GitHub: not connected');
  });

  it('updates after SchemAI sign-out and sign-in', async () => {
    const { item, manager } = await setup(FAKE_TOKEN);

    manager.signOut();
    await settle();
    assert.strictEqual(item.text, 'GitHub: not connected');

    await manager.signIn();
    await settle();
    assert.strictEqual(item.text, 'GitHub: fake-user');
  });

  it('dispose() removes the item and stops listening to session changes', async () => {
    const { auth, item, statusBar } = await setup(FAKE_TOKEN);

    statusBar.dispose();

    assert.strictEqual(item.disposed, true);
    assert.strictEqual(auth.listeners.size, 0);
  });

  describe('click and tooltip (review on #26)', () => {
    it('without a session, clicking the item runs schemaAI.login', async () => {
      const { item } = await setup(undefined);

      assert.strictEqual(item.command, 'schemaAI.login');
    });

    it('with a session, clicking the item runs schemaAI.disconnect', async () => {
      const { item } = await setup(FAKE_TOKEN);

      assert.strictEqual(item.command, 'schemaAI.disconnect');
    });

    it('the click action follows the session when it changes', async () => {
      const { auth, item } = await setup(FAKE_TOKEN);

      auth.changeSession(undefined);
      await settle();

      assert.strictEqual(item.command, 'schemaAI.login');
    });

    it('the tooltip tells the user to click, not to run a Command Palette entry', async () => {
      const signedOut = await setup(undefined);
      const signedIn = await setup(FAKE_TOKEN);

      assert.match(signedOut.item.tooltip ?? '', /click to sign in/i);
      assert.match(signedIn.item.tooltip ?? '', /fake-user/);
      assert.match(signedIn.item.tooltip ?? '', /click to sign out/i);
      assert.doesNotMatch(signedOut.item.tooltip ?? '', /run "/i);
    });
  });
});
