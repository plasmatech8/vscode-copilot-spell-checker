import * as vscode from "vscode";

export interface SpellCheckerSettings {
  ignoredWords: string[];
  additionalPrompt: string;
  modelFamily: string;
}

export function getSettings(): SpellCheckerSettings {
  const config = vscode.workspace.getConfiguration("copilotSpellChecker");
  return {
    ignoredWords: config.get("ignoredWords", []),
    additionalPrompt: config.get("additionalPrompt", ""),
    modelFamily: config.get("modelFamily", "auto"),
  };
}
