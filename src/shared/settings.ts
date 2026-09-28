import { browserAPI } from "@shared/browser-api";
import { DEFAULT_SETTINGS } from "@shared/types";
import type { ExtensionSettings } from "@shared/types";

export async function getSettings(): Promise<ExtensionSettings> {
  const stored = await browserAPI.storage.sync.get(
    DEFAULT_SETTINGS as unknown as Record<string, unknown>,
  );
  return { ...DEFAULT_SETTINGS, ...stored } as ExtensionSettings;
}

export async function saveSettings(update: Partial<ExtensionSettings>): Promise<void> {
  await browserAPI.storage.sync.set(update);
}
