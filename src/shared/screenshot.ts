import { browserAPI } from "@shared/browser-api";

export async function captureVisibleTabAsPng(): Promise<Blob> {
  const dataUrl = await browserAPI.tabs.captureVisibleTab({ format: "png" });
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function copyScreenshotToClipboard(): Promise<void> {
  const blob = await captureVisibleTabAsPng();
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
}
