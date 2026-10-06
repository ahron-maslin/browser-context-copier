import { browserAPI } from "@shared/browser-api";

const STORAGE_KEY = "clipboardAccumulator";
const SEPARATOR_TEXT = "\n\n=== Next page ===\n\n";
const SEPARATOR_HTML = "<hr><p><strong>Next page</strong></p><hr>";

export interface AccumulatorState {
  text: string;
  html: string;
  count: number;
}

const EMPTY_STATE: AccumulatorState = { text: "", html: "", count: 0 };

async function readAccumulator(): Promise<AccumulatorState> {
  const stored = await browserAPI.storage.session.get(STORAGE_KEY);
  return (stored[STORAGE_KEY] as AccumulatorState | undefined) ?? EMPTY_STATE;
}

export async function appendToAccumulator(entry: {
  text: string;
  html: string;
}): Promise<AccumulatorState> {
  const current = await readAccumulator();
  const next: AccumulatorState =
    current.count === 0
      ? { text: entry.text, html: entry.html, count: 1 }
      : {
          text: `${current.text}${SEPARATOR_TEXT}${entry.text}`,
          html: `${current.html}${SEPARATOR_HTML}${entry.html}`,
          count: current.count + 1,
        };
  await browserAPI.storage.session.set({ [STORAGE_KEY]: next });
  return next;
}

export async function clearAccumulator(): Promise<void> {
  await browserAPI.storage.session.remove(STORAGE_KEY);
}

export async function getAccumulatorCount(): Promise<number> {
  return (await readAccumulator()).count;
}
