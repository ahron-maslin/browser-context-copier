export const MAX_RECOMMENDED_CHARS = 100_000;

export function sizeWarning(charCount: number): string | null {
  if (charCount <= MAX_RECOMMENDED_CHARS) return null;
  return "This is a lot of text — it may exceed your AI chat's paste limit.";
}
