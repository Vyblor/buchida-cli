# @buchida/cli

**buchida CLI — Email API for AI agents**

@buchida/cli is the official command-line interface for **buchida** — an email API built for AI agents. buchida ships a CLI, an MCP server, and SDKs in 5 languages (Node, Python, Go, Ruby, Java), all sharing the same REST API surface. `@buchida/email` templates render Korean, Japanese, and Chinese natively.

## Install

```bash
npx @buchida/cli
```

Or install globally:

```bash
npm install -g @buchida/cli
```

## Send your first email

```bash
$ buchida emails send \
    --from hello@yourapp.com \
    --to user@example.com \
    --subject "Hello" \
    --html "<h1>Welcome</h1>"

✓ Email sent (id: em_abc123)
```

## Documentation

Full docs: **[buchida.com/docs](https://buchida.com/docs)**

- API reference: https://buchida.com/docs/api-reference
- Quickstart guide: https://buchida.com/docs/quickstart
- CJK email templates: https://buchida.com/docs/templates
- MCP server setup: https://buchida.com/docs/mcp
- CLI reference: https://buchida.com/docs/cli

## Links

- **Website:** [buchida.com](https://buchida.com)
- **Documentation:** [buchida.com/docs](https://buchida.com/docs)
- **Pricing:** [buchida.com/pricing](https://buchida.com/pricing)
- **GitHub:** https://github.com/Vyblor/buchida-cli

## License

MIT
