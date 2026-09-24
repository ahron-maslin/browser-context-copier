const REMOVE_TAGS = ["script", "style", "noscript", "template", "iframe", "svg", "form", "nav", "header", "footer", "aside"];

const NOISE_PATTERN =
  /nav|menu|sidebar|footer|header|advert|banner|cookie|consent|popup|modal|subscribe|newsletter|social|share|widget|related|recommend|comment|promo|sponsor/i;

function isHidden(el: Element): boolean {
  const style = (el as HTMLElement).style;
  if (style && (style.display === "none" || style.visibility === "hidden")) return true;
  if (el.hasAttribute("hidden")) return true;
  if (el.getAttribute("aria-hidden") === "true") return true;
  return false;
}

function looksLikeNoise(el: Element): boolean {
  const identifier = `${el.id} ${el.className}`;
  return NOISE_PATTERN.test(identifier);
}

export function cleanDocument(doc: Document): Document {
  const clone = doc.cloneNode(true) as Document;
  for (const tag of REMOVE_TAGS) {
    clone.querySelectorAll(tag).forEach((el) => el.remove());
  }
  clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (el.isConnected && (isHidden(el) || looksLikeNoise(el))) el.remove();
  });
  return clone;
}
