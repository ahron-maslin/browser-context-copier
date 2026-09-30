# Privacy Policy — Browser Context Copier

**Effective date:** 2026-09-30

Browser Context Copier does not collect, store, transmit, or share any data
of any kind, from anyone.

## What the extension does

When you click its toolbar icon (or use its keyboard shortcut or right-click
menu item), the extension reads the content of the page you are currently
viewing, converts it to Markdown or plain text, and copies it to your
system clipboard. That is the entire function of the extension.

## What data it collects

None. Specifically, the extension:

- Makes no network requests of any kind. It has no server, and nothing
  it does ever leaves your device.
- Has no analytics, telemetry, or crash reporting.
- Never reads your clipboard — only writes to it.
- Never tracks your browsing history or activity across sites.
- Never stores page content anywhere persistent. Extracted content exists
  only transiently, in memory, for the moment it takes to copy it to your
  clipboard.

## What it stores locally

Your settings (output format, and a few formatting toggles) are saved using
your browser's built-in extension storage (`chrome.storage.sync` /
`browser.storage.sync`), which is controlled entirely by your browser — the
same mechanism your browser uses to sync other extensions' settings across
your own signed-in devices, if you have that enabled. The developer has no
access to this data.

## Permissions

The extension requests the minimum permissions needed to function:

| Permission | Why |
|---|---|
| `activeTab` | Lets the extension act on the tab you're currently viewing, only when you invoke it (click the icon, press the shortcut, or use the context menu) — not on every page you visit. |
| `scripting` | Lets the extension run its extraction code in the current tab when invoked. |
| `clipboardWrite` | Lets the extension write the extracted content to your clipboard. The extension never requests clipboard *read* access. |
| `contextMenus` | Adds the right-click menu items. |
| `storage` | Saves your formatting preferences locally. |

## Changes to this policy

If this policy ever changes, the updated version will be published at the
same location and the effective date above will be updated.

## Contact

Questions about this policy or the extension: ahronkaylawedding@gmail.com
