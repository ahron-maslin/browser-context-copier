import { getSettings, saveSettings } from "@shared/settings";
import type { ExtensionSettings } from "@shared/types";

const outputFormatEl = document.getElementById("output-format") as HTMLSelectElement;
const includeUrlEl = document.getElementById("include-url") as HTMLInputElement;
const includeMetadataEl = document.getElementById("include-metadata") as HTMLInputElement;
const preserveLinksEl = document.getElementById("preserve-links") as HTMLInputElement;
const includeImageDescriptionsEl = document.getElementById(
  "include-image-descriptions",
) as HTMLInputElement;
const statusEl = document.getElementById("status");

function applyToForm(settings: ExtensionSettings): void {
  outputFormatEl.value = settings.outputFormat;
  includeUrlEl.checked = settings.includeUrl;
  includeMetadataEl.checked = settings.includeMetadata;
  preserveLinksEl.checked = settings.preserveLinks;
  includeImageDescriptionsEl.checked = settings.includeImageDescriptions;
}

function readFromForm(): ExtensionSettings {
  return {
    outputFormat: outputFormatEl.value as ExtensionSettings["outputFormat"],
    includeUrl: includeUrlEl.checked,
    includeMetadata: includeMetadataEl.checked,
    preserveLinks: preserveLinksEl.checked,
    includeImageDescriptions: includeImageDescriptionsEl.checked,
  };
}

let statusTimeout: ReturnType<typeof setTimeout> | undefined;

async function persist(): Promise<void> {
  await saveSettings(readFromForm());
  if (statusEl) {
    statusEl.textContent = "Saved.";
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      if (statusEl) statusEl.textContent = "";
    }, 1500);
  }
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

void getSettings().then(applyToForm);
