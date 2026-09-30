# Browser Context Copier

A Chrome/Firefox extension that extracts the readable content of the
current page and copies it to your clipboard as clean Markdown — so you
can paste it into ChatGPT, Claude, or any other LLM that can't fetch the
page itself.

It is not an AI tool: no LLM calls, no network requests, no telemetry.
Everything runs locally against the page as your browser has already
rendered it.

## Security boundary

This extension reads what your browser already shows you. It never
attempts to bypass authentication, CAPTCHAs, paywalls, or bot protection.
If the page shows a CAPTCHA instead of an article, the extension reports
that no readable content was found — it does not try to work around it.

## Development

```bash
npm install
npm run build      # builds both dist/chrome and dist/firefox
npm run test
npm run typecheck
npm run lint
```

Load `dist/chrome` as an unpacked extension via `chrome://extensions`, or
`dist/firefox` via `about:debugging#/runtime/this-firefox` in Firefox.

See `CLAUDE.md` for architecture and constraints.

## License

MIT — see [LICENSE](LICENSE).

## Privacy

See [PRIVACY.md](PRIVACY.md). Short version: this extension collects
nothing, ever.
