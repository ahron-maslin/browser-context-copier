import { runCopyPageContext } from "@shared/copy-runner";
import { browserAPI } from "@shared/browser-api";
import type { CopyResult } from "@shared/types";

const statusEl = document.getElementById("status");
const copyPageBtn = document.getElementById("copy-page");
const copySelectionBtn = document.getElementById("copy-selection");
const screenshotBtn = document.getElementById("screenshot") as HTMLButtonElement | null;
const settingsLink = document.getElementById("open-settings");

function renderResult(result: CopyResult): void {
  if (!statusEl) return;
  statusEl.textContent = result.ok
    ? `✓ Page copied — ${result.charCount.toLocaleString()} characters`
    : (result.error ?? "Something went wrong.");
}

async function copyPage(): Promise<void> {
  if (statusEl) statusEl.textContent = "Copying page…";
  renderResult(await runCopyPageContext("page"));
}

async function copySelection(): Promise<void> {
  if (statusEl) statusEl.textContent = "Copying selection…";
  renderResult(await runCopyPageContext("selection"));
}

copyPageBtn?.addEventListener("click", () => void copyPage());
copySelectionBtn?.addEventListener("click", () => void copySelection());

if (screenshotBtn) {
  screenshotBtn.disabled = true;
  screenshotBtn.title = "Not implemented yet";
}

settingsLink?.addEventListener("click", (event) => {
  event.preventDefault();
  void browserAPI.runtime.openOptionsPage();
});

void copyPage();
