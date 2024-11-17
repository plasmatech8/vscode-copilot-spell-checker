import * as vscode from "vscode";
import { z } from "zod";
import {
  getSpellCheckPrompt,
  getCodeDocumentPrompt,
  spellingCorrectionSchema,
} from "./prompts";
import { getSettings } from "./settings";

export async function checkSpelling(
  document: vscode.TextDocument,
  spellingDiagnostics: vscode.DiagnosticCollection,
  outputChannel: vscode.OutputChannel
) {
  // Only run spell check on text documents
  if (document.uri.scheme !== "file") {
    return;
  }

  // Log the file being checked
  outputChannel.appendLine(
    `Checking file: ${document.languageId} ${document.fileName}`
  );

  // Query the language model
  const spellingCorrections = await retrieveSpellCheckSuggestions(
    document,
    outputChannel
  );
  if (spellingCorrections) {
    // Assemble diagnostics
    const diagnostics: vscode.Diagnostic[] = [];
    for (const { lineIndex, word, before, suggestion } of spellingCorrections) {
      const start = before.length;
      const range = new vscode.Range(
        lineIndex,
        start,
        lineIndex,
        start + word.length
      );
      const message = suggestion
        ? `'${word}' might be misspelled. Suggestion: '${suggestion}'`
        : `'${word}' might be misspelled`;
      const diagnostic = new vscode.Diagnostic(
        range,
        message,
        vscode.DiagnosticSeverity.Information
      );
      diagnostics.push(diagnostic);
      outputChannel.appendLine(
        `Detected spelling mistake: '${word}' at line ${lineIndex + 1}. ${
          suggestion ? `Suggestion: '${suggestion}'` : "No suggestion"
        }`
      );
    }
    // Set the diagnostics
    spellingDiagnostics.set(document.uri, diagnostics);
  }
}

async function retrieveSpellCheckSuggestions(
  document: vscode.TextDocument,
  outputChannel: vscode.OutputChannel
) {
  const { modelFamily } = getSettings();

  // Compile messages and get model
  const messages = [getSpellCheckPrompt(), getCodeDocumentPrompt(document)];
  const [model] = await vscode.lm.selectChatModels({
    family: modelFamily === "auto" ? undefined : modelFamily,
  });
  outputChannel.appendLine(
    `Using langauge model: copilot ${modelFamily} family`
  );

  // Send request to language model
  try {
    const chatResponse = await model.sendRequest(
      messages,
      { justification: "spell-checker" },
      new vscode.CancellationTokenSource().token
    );
    const fullResponseText = await parseChatResponse(chatResponse);
    outputChannel.appendLine(
      `Language model chat response for ${document.fileName}:\n${fullResponseText}`
    );
    const cleanResponseText = cleanChatResponseText(fullResponseText);
    const responseJson = JSON.parse(cleanResponseText);
    return await spellingCorrectionSchema.parseAsync(responseJson);
  } catch (err) {
    // Log specific error details
    if (err instanceof z.ZodError) {
      const zodErrors = JSON.stringify(err.errors, null, 2);
      const msg = `Invalid response format: ${zodErrors}`;
      outputChannel.appendLine(msg);
    } else if (err instanceof SyntaxError) {
      const msg = `Invalid JSON response: ${err.message}`;
      outputChannel.appendLine(msg);
    } else if (err instanceof vscode.LanguageModelError) {
      const msg = `Language model error: ${err.message} (${err.code})`;
      outputChannel.appendLine(msg);
      console.log(err.message, err.code, err.cause);
    } else {
      throw err;
    }
    return null;
  }
}

async function parseChatResponse(
  chatResponse: vscode.LanguageModelChatResponse
) {
  let responseText = "";
  for await (const chunk of chatResponse.text) {
    responseText += chunk;
  }
  return responseText;
}

function cleanChatResponseText(responseText: string) {
  responseText = responseText.replace(/```^json/g, "");
  responseText = responseText.replace(/```$/g, "");
  responseText = responseText.match(/(\[.+\])/s)?.[0] ?? "[]";
  return responseText;
}
