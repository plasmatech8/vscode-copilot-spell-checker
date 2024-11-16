import * as vscode from "vscode";
import { checkSpelling } from "./checkSpelling";

export async function activate(context: vscode.ExtensionContext) {
  // Output channel
  const outputChannel = vscode.window.createOutputChannel(
    "Copilot Spell Checker"
  );
  outputChannel.appendLine("Copilot Spell Checker is active");
  outputChannel.show();

  // Spelling diagnostics
  const spellingDiagnostics =
    vscode.languages.createDiagnosticCollection("spelling");

  // Check spelling when a text document is opened
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      checkSpelling(document, spellingDiagnostics, outputChannel);
    })
  );

  // Check spelling when a text document is changed
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      checkSpelling(event.document, spellingDiagnostics, outputChannel);
    })
  );

  // Check all already open documents
  vscode.workspace.textDocuments.forEach((document) => {
    checkSpelling(document, spellingDiagnostics, outputChannel);
  });

  // Clean up when the extension is deactivated
  context.subscriptions.push({
    dispose: () => {
      spellingDiagnostics.clear();
      spellingDiagnostics.dispose();
    },
  });

  // Register the command to apply the fix
  vscode.commands.registerCommand(
    "spellCheck.fix",
    async ({ documentUri, range, suggestion }) => {
      const document = await vscode.workspace.openTextDocument(
        vscode.Uri.parse(documentUri)
      );
      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        new vscode.Range(
          range.start.line,
          range.start.character,
          range.end.line,
          range.end.character
        ),
        suggestion
      );
      await vscode.workspace.applyEdit(edit);
    }
  );
}

export function deactivate() {}
