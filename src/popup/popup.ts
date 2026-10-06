import { runCopyPageContext } from "@shared/copy-runner";
import { copyScreenshotToClipboard } from "@shared/screenshot";
import { browserAPI } from "@shared/browser-api";
import type { RunCopyResult } from "@shared/types";

const statusEl = document.getElementById("status");
const copyPageBtn = document.getElementById("copy-page");
const copySelectionBtn = document.getElementById("copy-selection");
const screenshotBtn = document.getElementById("screenshot") as HTMLButtonElement | null;
const settingsLink = document.getElementById("open-settings");

function renderResult(result: RunCopyResult): void {
  if (!statusEl) return;
  if (!result.ok) {
    statusEl.textContent = result.error ?? "Something went wrong.";
    return;
  }
  const label = result.effectiveMode === "selection" ? "Selection" : "Page";
  const countNote = result.pageCount > 1 ? ` (${result.pageCount} pages accumulated)` : "";
  const base = `✓ ${label} copied — ${result.charCount.toLocaleString()} characters${countNote}`;
  statusEl.textContent = result.warning ? `${base} — ⚠ ${result.warning}` : base;
}

async function copyPage(): Promise<void> {
  if (statusEl) statusEl.textContent = "Copying…";
  renderResult(await runCopyPageContext("page"));
}

async function copySelection(): Promise<void> {
  if (statusEl) statusEl.textContent = "Copying selection…";
  renderResult(await runCopyPageContext("selection"));
}

async function captureScreenshot(): Promise<void> {
  if (statusEl) statusEl.textContent = "Capturing screenshot…";
  try {
    await copyScreenshotToClipboard();
    if (statusEl) statusEl.textContent = "✓ Screenshot copied to clipboard";
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = err instanceof Error ? err.message : "Screenshot failed.";
    }
  }
}

copyPageBtn?.addEventListener("click", () => void copyPage());
copySelectionBtn?.addEventListener("click", () => void copySelection());
screenshotBtn?.addEventListener("click", () => void captureScreenshot());

settingsLink?.addEventListener("click", (event) => {
  event.preventDefault();
  void browserAPI.runtime.openOptionsPage();
});

void copyPage();
