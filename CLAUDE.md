# Project Instructions — Browser Context Copier

This is a cross-browser Chrome/Firefox WebExtension (Manifest V3).

Primary goal: extract the readable content of the currently active webpage
and copy it to the user's clipboard as clean Markdown, ready to paste into
an LLM chat.

## Critical constraints

- No AI APIs. No external network requests of any kind at runtime.
- No telemetry, no analytics, no tracking.
- Never read the clipboard — only write to it.
- Never attempt to bypass authentication, CAPTCHA, paywalls, or anti-bot
  systems. If the DOM doesn't have the content, report that plainly.
- All processing happens locally, on the DOM as currently rendered in the
  user's browser. Never fetch or re-request the page over the network.
- Keep permissions minimal: `activeTab`, `scripting`, `clipboardWrite`,
  `contextMenus`, `storage`. Never add `tabs`, `webRequest`, `clipboardRead`,
  or broad host permissions without a concrete feature that needs them.

## Architecture

- No persistent content script is declared in the manifest. The extraction
  pipeline (`src/content/index.ts`) is bundled to a single IIFE
  (`content/inject.js`) and injected on demand via
  `browserAPI.scripting.executeScript`, in direct response to a user
  action (toolbar click, keyboard command, or context-menu item) — this is
  what lets the extension run on `activeTab` instead of host permissions.
- The clipboard write happens inside that injected script (page context,
  still within the user gesture), not in the background service worker —
  service workers have no `document` and can't use the Clipboard API.
- `src/background/background.ts` coordinates `commands.onCommand` and
  `contextMenus.onClicked` — both call `runCopyPageContext`. There is no
  `action.onClicked` listener: the manifest sets `default_popup`, which
  means Chrome/Firefox never fire `onClicked` for the toolbar icon at all;
  the popup is the only way that trigger reaches the pipeline.
- The popup (`src/popup/`) is not a separate code path: on open it calls
  the same `runCopyPageContext` immediately and renders the result, while
  also exposing secondary actions (Copy Selection, Screenshot, Settings).
  If the content script's own clipboard write fails (commonly because
  the popup opening moved focus off the page's document), it hands the
  `{text, html}` payload back instead of erroring, and `copy-runner.ts`
  retries the write from wherever it's running — which is the popup's own
  document when the popup was the caller, so it should be focused.
- Append mode (`ExtensionSettings.appendMode`) never reads the real
  system clipboard — that would violate "never read the clipboard"
  above. It keeps its own running buffer in `storage.session`
  (`src/shared/clipboard-accumulator.ts`) and writes the full combined
  buffer every time. Each accumulated entry is a complete, already-
  formatted page (header, body, closing note) joined by a plain-text
  separator — not a restructured shared header — so accumulation needed
  zero changes to the single-page formatting path.
- Browser differences live only in `src/shared/browser-api.ts`
  (`browser` vs `chrome` namespace detection) and in the two manifests —
  never scatter `if (chrome) / if (browser)` conditionals elsewhere.
- Two manifests, one build: `manifest.chrome.json` / `manifest.firefox.json`
  are merged into `dist/<target>/manifest.json` by `scripts/build.mjs`,
  which builds the popup/options pages, the background service worker, and
  the content bundle as three separate Vite passes so each gets the right
  output format (the content bundle must stay a single IIFE — it's
  injected as a raw file, not resolved as an ES module).

## Conventions

- Prefer `<article>` / `<main>` / semantic HTML, then heuristic content
  scoring, then cleaned `body.innerText` as a last resort — never fail
  extraction outright.
- Optimize output for LLM context: preserve headings, lists, tables,
  blockquotes, code blocks, and in-content links. Strip navigation, ads,
  and repeated chrome. Normalize whitespace. Don't summarize — compression
  through cleanup only, never through rewriting.
- Don't silently discard tables or code blocks; fall back to a readable
  text form if a table can't be represented in Markdown.
- Don't auto-scroll or trigger infinite-scroll loading by default —
  extract what's already in the DOM.
- TDD for extraction/formatting/clipboard logic: a failing test in
  `tests/` before the implementation in `src/`.
- No comments unless the WHY is genuinely non-obvious.
