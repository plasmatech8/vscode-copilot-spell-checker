# Copilot Spell Checker

> 🛑 **Project Status**: This project is an experiment that demonstrated some limitations of using language models for spell checking. Feel free to use the code as inspiration, but be aware that it's not production-ready.

A VS Code extension that provides context-aware spell checking powered by GitHub Copilot. Unlike traditional spell checkers, it uses AI to understand programming terminology and provide more intelligent suggestions based on the context of your code and documentation.

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

⚠️ Development was stopped due to fundamental limitations:
- Slow performance due to language model queries makes it impractical for real-time use
- Frequent JSON parsing errors from the API responses
- Poor accuracy with technical terms and programming-specific vocabulary

The core concept of using LLMs for spell checking might be better suited as a batch process rather than a real-time VS Code extension.
