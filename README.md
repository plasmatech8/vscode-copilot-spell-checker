# Copilot Spell Checker

This is the README for your extension "copilot-spell-checker". This extension provides intelligent spell checking powered by GitHub Copilot.

## Features

- Automatically checks spelling in text documents.
- Provides suggestions for spelling corrections.
- Allows customization of ignored words and additional instructions for the spell checker.

## Requirements

No additional requirements.

## Extension Settings

This extension contributes the following settings:

* `copilotSpellChecker.ignoredWords`: Words to ignore during spell checking.
* `copilotSpellChecker.additionalPrompt`: Additional instructions for the spell checker.
* `copilotSpellChecker.modelFamily`: Model family to use for spell checking.

## Known Issues

- Commonly has JSON parsing errors.
- Commonly includes words that should be ignored.
- Is slow due to needing to query the language model.
