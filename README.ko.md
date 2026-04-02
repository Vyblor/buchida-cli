<div align="center">
  <img src="assets/logo-black.svg" alt="buchida" width="280" />
  <p><strong>buchida 이메일 API를 위한 커맨드라인 인터페이스</strong></p>

  [English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [中文](README.zh.md)

  [![npm version](https://img.shields.io/npm/v/@buchida/cli)](https://www.npmjs.com/package/@buchida/cli) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

[buchida](https://buchida.com) 이메일 API의 공식 CLI입니다. 터미널에서 이메일 발송, 도메인 관리, 분석 데이터 조회가 가능합니다.

## 설치

```bash
npx @buchida/cli
```

또는 전역 설치:

```bash
npm install -g @buchida/cli
```

## 빠른 시작

```bash
# 인증
buchida login

# 이메일 발송
buchida send \
  --from hi@example.com \
  --to user@example.com \
  --subject "buchida에서 보내는 메일" \
  --html "<h1>안녕하세요!</h1>"

# 이메일 상태 확인
buchida emails list

# 도메인 관리
buchida domains list
buchida domains add yourdomain.com
```

## 주요 기능

- `buchida login`으로 대화형 설정
- 터미널에서 직접 이메일 발송
- 도메인, API 키, 템플릿 관리
- 발송 지표 및 분석 조회
- bash/zsh 탭 자동완성

## 문서

- [빠른 시작 가이드](https://buchida.com/ko/docs/quickstart)
- [CLI 레퍼런스](https://buchida.com/ko/docs/cli)
- [GitHub](https://github.com/Vyblor/buchida-cli)

## 라이선스

MIT
