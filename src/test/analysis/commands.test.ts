import 'mocha';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  ANALYZE_FILE_COMMAND,
  ANALYZE_SELECTION_COMMAND,
  DocumentOpener,
  registerAnalysisCommands
} from '../../analysis/commands';

interface PackageJson {
  contributes?: {
    commands?: Array<{
      command: string;
      title: string;
      category?: string;
    }>;
    menus?: {
      'editor/context'?: Array<{ command: string; when?: string; group?: string }>;
      'explorer/context'?: Array<{ command: string; when?: string; group?: string }>;
      commandPalette?: Array<{ command: string; when?: string }>;
    };
  };
}

const readPackageJson = (): PackageJson =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../package.json'), 'utf8')) as PackageJson;

interface FakeEditorOptions {
  selectionText?: string;
  documentText?: string;
  isEmptySelection?: boolean;
  languageId?: string;
  uri?: unknown;
}

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

function createFakeWindow(editorOptions?: FakeEditorOptions) {
  const infoMessages: string[] = [];

  let activeTextEditor: any = undefined;
  if (editorOptions) {
    activeTextEditor = {
      selection: {
        isEmpty: editorOptions.isEmptySelection ?? false
      },
      document: {
        languageId: editorOptions.languageId ?? 'typescript',
        uri: editorOptions.uri ?? { toString: () => 'file:///test.ts' },
        getText: (range?: any) => {
          if (range) {
            return editorOptions.selectionText ?? '';
          }
          return editorOptions.documentText ?? '';
        }
      }
    };
  }

  const window = {
    activeTextEditor,
    showInformationMessage: (msg: string) => {
      infoMessages.push(msg);
      return Promise.resolve(undefined);
    }
  };

  return { window, infoMessages };
}

describe('Analysis commands (HU-06 T1)', () => {
  it('registers the schemaAI.analyzeSelection and schemaAI.analyzeFile commands', () => {
    const { commands, handlers } = createFakeCommands();
    const { window } = createFakeWindow();
    const disposables = registerAnalysisCommands(commands, window, () => {});

    assert.ok(handlers.has(ANALYZE_SELECTION_COMMAND));
    assert.ok(handlers.has(ANALYZE_FILE_COMMAND));
    assert.strictEqual(disposables.length, 2);
  });

  it('Analyze selection sends only the selected text', async () => {
    const { commands, handlers } = createFakeCommands();
    const selectedCode = 'function hello() { return "world"; }';
    const fullCode = '// license header\nfunction hello() { return "world"; }\nconsole.log(hello());';
    const { window, infoMessages } = createFakeWindow({
      selectionText: selectedCode,
      documentText: fullCode,
      isEmptySelection: false
    });

    const analyzed: string[] = [];
    registerAnalysisCommands(commands, window, (text: string) => {
      analyzed.push(text);
    });

    await handlers.get(ANALYZE_SELECTION_COMMAND)!();

    assert.strictEqual(analyzed.length, 1);
    assert.strictEqual(analyzed[0], selectedCode);
    assert.strictEqual(infoMessages.length, 0);
  });

  it('Analyze file sends the whole document text', async () => {
    const { commands, handlers } = createFakeCommands();
    const selectedCode = 'function hello() { return "world"; }';
    const fullCode = '// license header\nfunction hello() { return "world"; }\nconsole.log(hello());';
    const { window, infoMessages } = createFakeWindow({
      selectionText: selectedCode,
      documentText: fullCode,
      isEmptySelection: false
    });

    const analyzed: string[] = [];
    registerAnalysisCommands(commands, window, (text: string) => {
      analyzed.push(text);
    });

    await handlers.get(ANALYZE_FILE_COMMAND)!();

    assert.strictEqual(analyzed.length, 1);
    assert.strictEqual(analyzed[0], fullCode);
    assert.strictEqual(infoMessages.length, 0);
  });

  it('An empty selection shows an information message and does not analyse', async () => {
    const { commands, handlers } = createFakeCommands();
    const { window, infoMessages } = createFakeWindow({
      selectionText: '',
      documentText: 'some full code',
      isEmptySelection: true
    });

    const analyzed: string[] = [];
    registerAnalysisCommands(commands, window, (text: string) => {
      analyzed.push(text);
    });

    await handlers.get(ANALYZE_SELECTION_COMMAND)!();

    assert.strictEqual(analyzed.length, 0);
    assert.strictEqual(infoMessages.length, 1);
    assert.ok(infoMessages[0].toLowerCase().includes('select'));
  });

  it('shows an information message when analyzeSelection is run without an active editor', async () => {
    const { commands, handlers } = createFakeCommands();
    const { window, infoMessages } = createFakeWindow(undefined);

    const analyzed: string[] = [];
    registerAnalysisCommands(commands, window, (text: string) => {
      analyzed.push(text);
    });

    await handlers.get(ANALYZE_SELECTION_COMMAND)!();

    assert.strictEqual(analyzed.length, 0);
    assert.strictEqual(infoMessages.length, 1);
  });

  it('shows an information message when analyzeFile is run without an active editor', async () => {
    const { commands, handlers } = createFakeCommands();
    const { window, infoMessages } = createFakeWindow(undefined);

    const analyzed: string[] = [];
    registerAnalysisCommands(commands, window, (text: string) => {
      analyzed.push(text);
    });

    await handlers.get(ANALYZE_FILE_COMMAND)!();

    assert.strictEqual(analyzed.length, 0);
    assert.strictEqual(infoMessages.length, 1);
  });

  it('declares analyzeSelection and analyzeFile in package.json contributes.commands', () => {
    const pkg = readPackageJson();
    const commands = pkg.contributes?.commands ?? [];

    const selectionCmd = commands.find((c) => c.command === ANALYZE_SELECTION_COMMAND);
    const fileCmd = commands.find((c) => c.command === ANALYZE_FILE_COMMAND);

    assert.ok(selectionCmd, 'schemaAI.analyzeSelection must be in contributes.commands');
    assert.strictEqual(selectionCmd.title, 'Analyze Selection');
    assert.strictEqual(selectionCmd.category, 'SchemAI');

    assert.ok(fileCmd, 'schemaAI.analyzeFile must be in contributes.commands');
    assert.strictEqual(fileCmd.title, 'Analyze File');
    assert.strictEqual(fileCmd.category, 'SchemAI');
  });

  it('declares context menu entries in package.json contributes.menus', () => {
    const pkg = readPackageJson();
    const editorMenus = pkg.contributes?.menus?.['editor/context'] ?? [];
    const explorerMenus = pkg.contributes?.menus?.['explorer/context'] ?? [];

    const editorSelection = editorMenus.find((m) => m.command === ANALYZE_SELECTION_COMMAND);
    const editorFile = editorMenus.find((m) => m.command === ANALYZE_FILE_COMMAND);
    const explorerFile = explorerMenus.find((m) => m.command === ANALYZE_FILE_COMMAND);

    assert.ok(editorSelection, 'schemaAI.analyzeSelection must be in editor/context menu');
    assert.ok(editorFile, 'schemaAI.analyzeFile must be in editor/context menu');
    assert.ok(explorerFile, 'schemaAI.analyzeFile must be in explorer/context menu');
  });
});

/** Fake `vscode.workspace`: opens a document with the given content and records the requested Uris. */
function createFakeWorkspace(text: string, languageId = 'python') {
  const openedUris: unknown[] = [];
  const workspace: DocumentOpener = {
    openTextDocument: async (uri: unknown) => {
      openedUris.push(uri);
      return { getText: () => text, languageId, uri };
    }
  };
  return { workspace, openedUris };
}

describe('Analysis commands from the explorer (HU-06 T1b)', () => {
  it('analyzeFile with a Uri opens that document and analyses it, not the active editor', async () => {
    const { commands, handlers } = createFakeCommands();
    const { window, infoMessages } = createFakeWindow({ documentText: 'active editor content' });
    const { workspace, openedUris } = createFakeWorkspace('clicked file content');
    const clickedUri = { toString: () => 'file:///clicked.py' };

    const analyzed: { text: string; languageId?: string; uri?: unknown }[] = [];
    registerAnalysisCommands(
      commands,
      window,
      (text, metadata) => {
        analyzed.push({ text, ...metadata });
      },
      workspace
    );

    await handlers.get(ANALYZE_FILE_COMMAND)!(clickedUri);

    assert.deepStrictEqual(openedUris, [clickedUri]);
    assert.strictEqual(analyzed.length, 1);
    assert.strictEqual(analyzed[0].text, 'clicked file content');
    assert.strictEqual(analyzed[0].languageId, 'python');
    assert.strictEqual(analyzed[0].uri, clickedUri);
    assert.strictEqual(infoMessages.length, 0);
  });

  it('analyzeFile without a Uri still uses the active editor', async () => {
    const { commands, handlers } = createFakeCommands();
    const { window } = createFakeWindow({ documentText: 'active editor content' });
    const { workspace, openedUris } = createFakeWorkspace('clicked file content');

    const analyzed: string[] = [];
    registerAnalysisCommands(commands, window, (text) => {
      analyzed.push(text);
    }, workspace);

    await handlers.get(ANALYZE_FILE_COMMAND)!();

    assert.deepStrictEqual(openedUris, []);
    assert.deepStrictEqual(analyzed, ['active editor content']);
  });

  it('analyzeFile on an empty clicked file shows "File is empty" and does not analyse', async () => {
    const { commands, handlers } = createFakeCommands();
    const { window, infoMessages } = createFakeWindow(undefined);
    const { workspace } = createFakeWorkspace('   \n');

    const analyzed: string[] = [];
    registerAnalysisCommands(commands, window, (text) => {
      analyzed.push(text);
    }, workspace);

    await handlers.get(ANALYZE_FILE_COMMAND)!({ toString: () => 'file:///empty.py' });

    assert.strictEqual(analyzed.length, 0);
    assert.deepStrictEqual(infoMessages, ['SchemAI: File is empty.']);
  });

  it('hides the explorer/context analyzeFile entry on folders', () => {
    const explorerMenus = readPackageJson().contributes?.menus?.['explorer/context'] ?? [];
    const explorerFile = explorerMenus.find((m) => m.command === ANALYZE_FILE_COMMAND);

    assert.strictEqual(explorerFile?.when, '!explorerResourceIsFolder');
  });

  it('hides analyzeSelection from the Command Palette when there is no selection', () => {
    const paletteMenus = readPackageJson().contributes?.menus?.commandPalette ?? [];
    const paletteSelection = paletteMenus.find((m) => m.command === ANALYZE_SELECTION_COMMAND);

    assert.strictEqual(paletteSelection?.when, 'editorHasSelection');
  });
});
