<div align="center">
  <img src="assets/logo-black.svg" alt="buchida" width="280" />
  <p><strong>Command-line interface for the buchida email API</strong></p>

  [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md)

  [![npm version](https://img.shields.io/npm/v/@buchida/cli)](https://www.npmjs.com/package/@buchida/cli) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

The official CLI for the [buchida](https://buchida.com) email API. Send emails, manage domains, and view analytics from your terminal.

## Installation

```bash
npx @buchida/cli
```

Or install globally:

```bash
npm install -g @buchida/cli
```

## Quick Start

```bash
# Authenticate
buchida login

# Send an email
buchida send \
  --from hi@example.com \
  --to user@example.com \
  --subject "Hello from buchida" \
  --html "<h1>Hello!</h1>"

# Check email status
buchida emails list

# Manage domains
buchida domains list
buchida domains add yourdomain.com
```

## Features

- Interactive setup with `buchida login`
- Send emails directly from the terminal
- Manage domains, API keys, and templates
- View delivery metrics and analytics
- Tab completion for bash/zsh

## Documentation

- [Quick Start](https://buchida.com/docs/quickstart)
- [CLI Reference](https://buchida.com/docs/cli)
- [GitHub](https://github.com/Vyblor/buchida-cli)

## License

MIT
