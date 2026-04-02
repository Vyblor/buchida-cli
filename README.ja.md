<div align="center">
  <img src="assets/logo-black.svg" alt="buchida" width="280" />
  <p><strong>buchidaメールAPI用コマンドラインインターフェース</strong></p>

  [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md)

  [![npm version](https://img.shields.io/npm/v/@buchida/cli)](https://www.npmjs.com/package/@buchida/cli) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

[buchida](https://buchida.com)メールAPIの公式CLIです。ターミナルからメール送信、ドメイン管理、分析データの確認ができます。

## インストール

```bash
npx @buchida/cli
```

またはグローバルインストール:

```bash
npm install -g @buchida/cli
```

## クイックスタート

```bash
# 認証
buchida login

# メール送信
buchida send \
  --from hi@example.com \
  --to user@example.com \
  --subject "buchidaからのメール" \
  --html "<h1>こんにちは！</h1>"

# メール状態確認
buchida emails list

# ドメイン管理
buchida domains list
buchida domains add yourdomain.com
```

## 特徴

- `buchida login`による対話式セットアップ
- ターミナルから直接メール送信
- ドメイン、APIキー、テンプレートの管理
- 配信指標と分析の表示
- bash/zshタブ補完

## ドキュメント

- [クイックスタート](https://buchida.com/ja/docs/quickstart)
- [CLIリファレンス](https://buchida.com/ja/docs/cli)
- [GitHub](https://github.com/Vyblor/buchida-cli)

## ライセンス

MIT
