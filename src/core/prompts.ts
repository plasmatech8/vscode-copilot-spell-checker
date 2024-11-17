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
You are a code-aware spell checker. Analyze the following code for spelling mistakes in:
- String literals
- Variable names
- Function names
- Class names
- Comments
- Property names

IGNORE:
- Imported names
- Library/dependency names
- Technical abbreviations (e.g., 'src', 'dist', 'pkg')
- Common programming terms (e.g., 'async', 'func', 'impl')

Ignored words: ${ignoredWords.join(", ")}

Additional information: ${additionalPrompt}

The response must be a valid parsable JSON string which matches the schema:
z.object({
    word: z.string(),
    before: z.string(),
    lineIndex: z.number().int(),
    reason: z.string(),
    suggestion: z.string().nullable(),
})

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
    .map((line, i) => `${i}:\n${line}`)
    .join("\n");
  return vscode.LanguageModelChatMessage.User(`
  Editor language code: ${userLanguage}
  Language ID: ${languageId}
  File Name: ${fileName}
  File Content with line number annotations:
  ${fileContentWithLineNumbers}
  `);
}
