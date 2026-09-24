export function scoreElement(el: Element): number {
  const paragraphs = Array.from(el.querySelectorAll("p"));
  if (paragraphs.length === 0) return -Infinity;

  const text = (el.textContent ?? "").trim();
  if (text.length === 0) return -Infinity;

  const linkTextLength = Array.from(el.querySelectorAll("a")).reduce(
    (sum, a) => sum + (a.textContent ?? "").trim().length,
    0,
  );
  const linkDensity = linkTextLength / text.length;

  const score = paragraphs.length * 20 + Math.min(text.length / 50, 100) - linkDensity * 100;
  return score;
}

export function findHeuristicContainer(doc: Document, minTextLength: number): Element | null {
  const candidates = Array.from(doc.querySelectorAll("div, section, td"));
  let best: Element | null = null;
  let bestScore = 0;

  for (const candidate of candidates) {
    if ((candidate.textContent ?? "").trim().length < minTextLength) continue;
    const score = scoreElement(candidate);
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}
