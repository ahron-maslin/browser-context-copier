import { getSettings, saveSettings } from "@shared/settings";
import { clearAccumulator, getAccumulatorCount } from "@shared/clipboard-accumulator";
import type { ExtensionSettings } from "@shared/types";

const outputFormatEl = document.getElementById("output-format") as HTMLSelectElement;
const includeUrlEl = document.getElementById("include-url") as HTMLInputElement;
const includeMetadataEl = document.getElementById("include-metadata") as HTMLInputElement;
const preserveLinksEl = document.getElementById("preserve-links") as HTMLInputElement;
const includeImageDescriptionsEl = document.getElementById(
  "include-image-descriptions",
) as HTMLInputElement;
const appendModeEl = document.getElementById("append-mode") as HTMLInputElement;
const accumulatorRowEl = document.getElementById("accumulator-row");
const accumulatorCountEl = document.getElementById("accumulator-count");
const clearAccumulatorBtn = document.getElementById("clear-accumulator");
const statusEl = document.getElementById("status");
const welcomePanelEl = document.getElementById("welcome-panel");

if (new URLSearchParams(window.location.search).get("welcome") === "1") {
  welcomePanelEl?.removeAttribute("hidden");
}

function applyToForm(settings: ExtensionSettings): void {
  outputFormatEl.value = settings.outputFormat;
  includeUrlEl.checked = settings.includeUrl;
  includeMetadataEl.checked = settings.includeMetadata;
  preserveLinksEl.checked = settings.preserveLinks;
  includeImageDescriptionsEl.checked = settings.includeImageDescriptions;
  appendModeEl.checked = settings.appendMode;
}

function readFromForm(): ExtensionSettings {
  return {
    outputFormat: outputFormatEl.value as ExtensionSettings["outputFormat"],
    includeUrl: includeUrlEl.checked,
    includeMetadata: includeMetadataEl.checked,
    preserveLinks: preserveLinksEl.checked,
    includeImageDescriptions: includeImageDescriptionsEl.checked,
    appendMode: appendModeEl.checked,
  };
}

async function refreshAccumulatorDisplay(): Promise<void> {
  const count = await getAccumulatorCount();
  if (accumulatorCountEl) {
    accumulatorCountEl.textContent = count === 1 ? "1 page accumulated" : `${count} pages accumulated`;
  }
  if (count > 0 || appendModeEl.checked) {
    accumulatorRowEl?.removeAttribute("hidden");
  } else {
    accumulatorRowEl?.setAttribute("hidden", "");
  }
}

let statusTimeout: ReturnType<typeof setTimeout> | undefined;

function flashStatus(message: string): void {
  if (!statusEl) return;
  statusEl.textContent = message;
  clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    if (statusEl) statusEl.textContent = "";
  }, 1500);
}

async function persist(): Promise<void> {
  await saveSettings(readFromForm());
  flashStatus("Saved.");
}

for (const el of [
  outputFormatEl,
  includeUrlEl,
  includeMetadataEl,
  preserveLinksEl,
  includeImageDescriptionsEl,
]) {
  el.addEventListener("change", () => void persist());
}

appendModeEl.addEventListener("change", () => {
  void (async () => {
    await persist();
    if (!appendModeEl.checked) {
      // Turning append mode off signals "I'm done accumulating" - clear the
      // buffer so a future append-mode session doesn't silently inherit it.
      await clearAccumulator();
    }
    await refreshAccumulatorDisplay();
  })();
});

clearAccumulatorBtn?.addEventListener("click", () => {
  void (async () => {
    await clearAccumulator();
    await refreshAccumulatorDisplay();
    flashStatus("Cleared.");
  })();
});

void getSettings().then(applyToForm);
void refreshAccumulatorDisplay();
