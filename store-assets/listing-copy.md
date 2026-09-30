# Store listing copy — Browser Context Copier

Reference text for the Chrome Web Store Developer Dashboard and Mozilla
AMO submission forms. Not shipped with the extension.

## Short description (Chrome, max 132 chars)

```
Copy a webpage's readable content as clean Markdown, for pasting into ChatGPT, Claude, or any AI that can't fetch the page.
```
(124 characters)

## Full / detailed description (both stores)

```
Browser Context Copier extracts the readable content of the page you're
viewing and copies it to your clipboard as clean Markdown — ready to
paste into ChatGPT, Claude, or any other AI assistant that can't fetch
the page itself.

It is not an AI tool. It makes no network requests, calls no AI APIs,
and collects no data of any kind. Everything runs locally, against the
page exactly as your browser has already rendered it.

HOW IT WORKS
- Click the toolbar icon (or press Ctrl+Shift+C / Cmd+Shift+C): the
  page's main content is extracted, cleaned of navigation/ads/clutter,
  converted to Markdown, and copied to your clipboard. Paste it
  anywhere.
- If you've highlighted text first, that selection is copied instead
  of the whole page.
- Right-click anywhere for the same options from the context menu.
- Optionally capture a screenshot of the visible page to your
  clipboard.
- Settings let you choose Markdown or plain text, and toggle whether
  to include the URL, author/date, links, and image captions.

WHAT IT DOESN'T DO
- It never reads your clipboard, only writes to it.
- It never tries to bypass paywalls, logins, CAPTCHAs, or bot
  protection — it reads what's already rendered in your browser, the
  same as Reader Mode would.
- It never sends anything anywhere. No analytics, no telemetry, no
  servers.

Full source code, privacy policy, and issue tracker:
https://github.com/ahron-maslin/browser-context-copier
```

## Single purpose statement (Chrome "Privacy practices" tab)

```
Extracts the readable content of the page the user is currently
viewing (or their current text selection) and copies it to the
clipboard as Markdown or plain text, for pasting elsewhere.
```

## Permission justifications (Chrome dashboard, one per requested permission)

**activeTab**
```
Used only at the moment the user invokes the extension (toolbar click,
keyboard shortcut, or context-menu item) to read and extract content
from the currently active tab. The extension has no access to any tab
the user has not explicitly invoked it on.
```

**scripting**
```
Used to run the content-extraction code in the active tab at the
moment the user invokes the extension, via chrome.scripting.executeScript.
```

**clipboardWrite**
```
Used to copy the extracted page content (and, for the optional
screenshot feature, a captured image) to the user's clipboard. The
extension does not request clipboardRead and never reads the
clipboard.
```

**contextMenus**
```
Adds "Copy page context" and "Copy selected context" right-click menu
items as alternative triggers for the same one-click copy action.
```

**storage**
```
Saves the user's formatting preferences (output format, and whether to
include the URL, author/date, links, and image descriptions) locally
via the browser's own extension storage.
```

## Data disclosure (Chrome "Data collected" checklist)

Answer **no / not collected** for every category (personally
identifiable info, health info, financial info, authentication info,
personal communications, location, web history, user activity, website
content). None of it is collected, stored, or transmitted.

Certify: "I do not sell or transfer user data to third parties" / "I do
not use or transfer user data for purposes unrelated to the item's core
functionality" / "I do not use or transfer user data to determine
creditworthiness or for lending purposes" — all true, check all three.

## Privacy policy URL (both stores)

```
https://github.com/ahron-maslin/browser-context-copier/blob/master/PRIVACY.md
```

## Category

Productivity

## Store icon

`store-assets/icon-512.png` (also used for the 128px extension icon at
`icons/icon128.png`)
