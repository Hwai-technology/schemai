import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import type * as vscode from 'vscode';

// Setup module interception so lazy require('vscode') resolves to our fake in testing
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require('module');
const originalLoad = Module._load;

interface PackageJson {
  contributes?: {
    commands?: Array<{
      command: string;
      title: string;
      category?: string;
    }>;
  };
}

const readPackageJson = (): PackageJson =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')) as PackageJson;

describe('Smoke Test & Module Integration (COORD)', () => {
  const registeredCommands = new Map<string, (...args: unknown[]) => unknown>();
  let fakeContext: vscode.ExtensionContext;
  let fakeVsCode: any;

  before(() => {
    registeredCommands.clear();

    const mockDiagnosticCollection = {
      name: 'schemai',
      get: () => [],
      set: () => {},
      delete: () => {},
      clear: () => {},
      dispose: () => {}
    };

    const mockStatusBarItem = {
      text: '',
      tooltip: '',
      command: '',
      show: () => {},
      hide: () => {},
      dispose: () => {}
    };

    fakeVsCode = {
      commands: {
        registerCommand: (id: string, handler: (...args: unknown[]) => unknown) => {
          registeredCommands.set(id, handler);
          return { dispose: () => registeredCommands.delete(id) };
        }
      },
      languages: {
        createDiagnosticCollection: () => mockDiagnosticCollection,
        registerHoverProvider: () => ({ dispose: () => {} }),
        registerCodeActionsProvider: () => ({ dispose: () => {} })
      },
      window: {
        activeTextEditor: undefined,
        showInformationMessage: async () => undefined,
        showWarningMessage: async () => undefined,
        showQuickPick: async () => undefined,
        createStatusBarItem: () => mockStatusBarItem,
        createTextEditorDecorationType: () => ({ key: 'test', dispose: () => {} }),
        createWebviewPanel: () => ({
          webview: { html: '', onDidReceiveMessage: () => ({ dispose: () => {} }) },
          reveal: () => {},
          onDidDispose: () => ({ dispose: () => {} }),
          dispose: () => {}
        }),
        registerWebviewViewProvider: () => ({ dispose: () => {} }),
        registerTreeDataProvider: () => ({ dispose: () => {} }),
        withProgress: async (_opts: any, task: any) => task({ report: () => {} }, { isCancellationRequested: false })
      },
      workspace: {
        workspaceFolders: [],
        onDidChangeTextDocument: () => ({ dispose: () => {} }),
        onDidCloseTextDocument: () => ({ dispose: () => {} }),
        getConfiguration: () => ({
          get: (_key: string, defaultVal: unknown) => defaultVal,
          update: async () => {}
        })
      },
      authentication: {
        getSession: async () => undefined,
        onDidChangeSessions: () => ({ dispose: () => {} })
      },
      env: {
        clipboard: {
          readText: async () => ''
        }
      },
      Diagnostic: class {
        source?: string;
        constructor(public range: any, public message: string, public severity: any) {}
      },
      DiagnosticSeverity: {
        Error: 0,
        Warning: 1,
        Information: 2,
        Hint: 3
      },
      Range: class {
        constructor(public start: any, public end: any) {}
      },
      Position: class {
        constructor(public line: number, public character: number) {}
      },
      Uri: {
        file: (p: string) => ({ toString: () => `file://${p}`, fsPath: p }),
        parse: (u: string) => ({ toString: () => u }),
        joinPath: (base: any, ...segments: string[]) => ({
          toString: () => `${base.toString()}/${segments.join('/')}`,
          fsPath: `${base.fsPath || base.toString()}/${segments.join('/')}`
        })
      },
      CodeAction: class {
        constructor(public title: string, public kind: any) {}
      },
      CodeActionKind: {
        QuickFix: 'quickfix'
      },
      WorkspaceEdit: class {
        insert() {}
      },
      StatusBarAlignment: {
        Left: 1,
        Right: 2
      },
      TreeItem: class {
        constructor(public label?: string, public collapsibleState?: any) {}
      },
      TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
      },
      ThemeIcon: class {
        constructor(public id: string, public color?: any) {}
      },
      ThemeColor: class {
        constructor(public id: string) {}
      },
      MarkdownString: class {
        constructor(public value: string = '') {}
      },
      EventEmitter: class {
        private listeners: Array<(data?: any) => void> = [];
        fire(data?: any) {
          for (const l of this.listeners) {
            l(data);
          }
        }
        event = (listener: (data?: any) => void) => {
          this.listeners.push(listener);
          return {
            dispose: () => {
              const idx = this.listeners.indexOf(listener);
              if (idx >= 0) this.listeners.splice(idx, 1);
            }
          };
        };
      }
    };

    Module._load = function (request: string, parent: unknown, isMain: boolean) {
      if (request === 'vscode') {
        return fakeVsCode;
      }
      return originalLoad.apply(this, [request, parent, isMain]);
    };

    const secretsMap = new Map<string, string>();
    const workspaceStateMap = new Map<string, unknown>();

    fakeContext = {
      subscriptions: [],
      secrets: {
        get: async (key: string) => secretsMap.get(key),
        store: async (key: string, val: string) => { secretsMap.set(key, val); },
        delete: async (key: string) => { secretsMap.delete(key); },
        onDidChange: () => ({ dispose: () => {} })
      },
      workspaceState: {
        get: (key: string, defaultVal?: unknown) => workspaceStateMap.get(key) ?? defaultVal,
        update: async (key: string, val: unknown) => { workspaceStateMap.set(key, val); },
        keys: () => Array.from(workspaceStateMap.keys())
      }
    } as unknown as vscode.ExtensionContext;
  });

  after(() => {
    Module._load = originalLoad;
  });

  it('registers every command contributed in package.json in activate()', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const extension = require('../../extension');
    extension.activate(fakeContext, fakeVsCode);

    const pkg = readPackageJson();
    const contributedCommands = (pkg.contributes?.commands ?? []).map((c) => c.command);

    assert.ok(contributedCommands.length >= 4, 'package.json must declare at least 4 commands');
    for (const cmd of contributedCommands) {
      assert.ok(
        registeredCommands.has(cmd),
        `Command ${cmd} contributed in package.json was not registered during activate()`
      );
    }
  });

  it('registers internal quickfix ignore command schemaAI.ignoreAlert', () => {
    assert.ok(
      registeredCommands.has('schemaAI.ignoreAlert'),
      'schemaAI.ignoreAlert command must be registered'
    );
  });

  it('populates context.subscriptions with disposables during activate()', () => {
    assert.ok(
      fakeContext.subscriptions.length >= 7,
      `Expected multiple feature disposables in context.subscriptions, found ${fakeContext.subscriptions.length}`
    );
  });

  it('executes deactivate() cleanly without throwing', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const extension = require('../../extension');
    assert.doesNotThrow(() => {
      extension.deactivate();
    });
  });
});
