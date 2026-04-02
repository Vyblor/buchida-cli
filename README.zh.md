<div align="center">
  <img src="assets/logo-black.svg" alt="buchida" width="280" />
  <p><strong>buchida邮件API命令行工具</strong></p>

  [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md)

  [![npm version](https://img.shields.io/npm/v/@buchida/cli)](https://www.npmjs.com/package/@buchida/cli) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

[buchida](https://buchida.com)邮件API的官方CLI。在终端中发送邮件、管理域名和查看分析数据。

## 安装

```bash
npx @buchida/cli
```

或全局安装:

```bash
npm install -g @buchida/cli
```

## 快速开始

```bash
# 认证
buchida login

# 发送邮件
buchida send \
  --from hi@example.com \
  --to user@example.com \
  --subject "来自buchida的邮件" \
  --html "<h1>你好！</h1>"

# 查看邮件状态
buchida emails list

# 管理域名
buchida domains list
buchida domains add yourdomain.com
```

## 特性

- 通过`buchida login`交互式配置
- 直接从终端发送邮件
- 管理域名、API密钥和模板
- 查看发送指标和分析数据
- bash/zsh Tab自动补全

## 文档

- [快速开始](https://buchida.com/zh/docs/quickstart)
- [CLI参考](https://buchida.com/zh/docs/cli)
- [GitHub](https://github.com/Vyblor/buchida-cli)

## 许可证

MIT
