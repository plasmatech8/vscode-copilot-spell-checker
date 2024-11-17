import * as vscode from "vscode";
import { z } from "zod";
import { getSettings } from "./settings";

export const spellingCorrectionSchema = z.array(
  z.object({
    word: z.string(),
    before: z.string(),
    lineIndex: z.number().int(),
    reason: z.string(),
    suggestion: z.string().nullable(),
  })
);

export function getSpellCheckPrompt() {
  const { additionalPrompt, ignoredWords } = getSettings();

  return vscode.LanguageModelChatMessage.User(`
You are a code-aware spell checker.

Analyze the following file for spelling mistakes, such as:
- String literals
- Variable names
- Function names
- Class names
- Comments
- Property names

Ignore words that the user would not want to be spell-checked, such as:
- Imported names
- Library/dependency names
- Technical abbreviations (e.g., 'src', 'dist', 'pkg')
- Common programming terms for the given file (e.g., 'async', 'func', 'impl')
- Any names that are part of externally defined config files (e.g., 'tsconfig.json', 'settings.json')

Additional ignored words: ${ignoredWords.map((s) => `"${s}"`).join(", ")}

Additional user information: ${additionalPrompt}

The response must be a valid parsable JSON string which matches the schema:
z.object({
  word: z.string(),
  before: z.string(),
  lineIndex: z.number().int(),
  reason: z.string(),
  suggestion: z.string().nullable(),
})

The "before" field should contain the text before the misspelled text.
There should not be any overlap with the "word" and the "before" fields.
It should not include the line number annotation.

The JSON should be a valid JSON string, meaning that strings are double-quoted.

If there are no spelling mistakes, you can respond with an empty array.

It is not necessary to wrap your response in triple backticks.
Here is an example of what your response should look like:
[
{
    "word": "recieve",
    "before": "    function ",
    "lineIndex": 4,
    "suggestion": "receive",
    "reason": "Common misspelling: 'i' before 'e' except after 'c'"
},
{
    "word": "calulate",
    "before": "  function ",
    "lineIndex": 12,
    "suggestion": "calculate",
    "reason": "Missing 'c' in common word 'calculate'"
},
{
    "word": "initialze",
    "before": "      const ",
    "lineIndex": 15,
    "suggestion": "initialize",
    "reason": "Missing 'i' in common word 'initialize'"
},
{
    "word": "chache",
    "before": "    // update the ",
    "lineIndex": 23,
    "suggestion": "cache",
    "reason": "Incorrect spelling of technical term 'cache'"
},
{
    "word": "paramaters",
    "before": "  class CustomConfig { private ",
    "lineIndex": 67,
    "suggestion": "parameters",
    "reason": "Common misspelling: should be '-meters' not '-aters'"
},
{
    "word": "xelmp",
    "before": "        const ",
    "lineIndex": 42,
    "reason": "Appears to be a typo or non-standard word",
    "suggestion": null
}
]
`);
}

export function getCodeDocumentPrompt(document: vscode.TextDocument) {
  const userLanguage = vscode.env.language;
  const languageId = document.languageId;
  const fileName = document.fileName;
  const fileContent = document.getText();
  const fileContentWithLineNumbers = fileContent
    .split("\n")
    .map((line, i) => `----------------- line ${i}\n${line}`)
    .join("\n");
  return vscode.LanguageModelChatMessage.User(`
Editor language code: ${userLanguage}
Language ID: ${languageId}
File Name: ${fileName}
File Content with line number annotations:
${fileContentWithLineNumbers}
  `);
}
