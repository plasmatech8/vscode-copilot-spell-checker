import * as vscode from "vscode";
import { checkSpelling } from "./core/checkSpelling";

export async function activate(context: vscode.ExtensionContext) {
  // Output channel
  const outputChannel = createOutputChannel();

  // Spelling diagnostics
  const spellingDiagnostics = createDiagnosticCollection();

  // Spell checking events and suggestions
  registerSpellCheckingEvents(context, spellingDiagnostics, outputChannel);

  // Register the command to apply the fix
}

function createOutputChannel() {
  const outputChannel = vscode.window.createOutputChannel(
    "Copilot Spell Checker"
  );
  outputChannel.appendLine("Copilot Spell Checker is active");
  outputChannel.show();
  return outputChannel;
}

function createDiagnosticCollection() {
  return vscode.languages.createDiagnosticCollection("spelling");
}

function registerSpellCheckingEvents(
  context: vscode.ExtensionContext,
  spellingDiagnostics: vscode.DiagnosticCollection,
  outputChannel: vscode.OutputChannel
) {
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
}

export function deactivate() {}
